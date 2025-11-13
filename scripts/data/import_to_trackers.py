#!/usr/bin/env python3
"""
Unified importer for Jira Cloud & Azure DevOps.

Usage:
  python import_to_trackers.py --jira --azdo \
    --jira-json jira_bulk_payload.json \
    --azdo-csv azdo_bulk_import.csv

Env (use tracker_import.env):
  # Jira
  JIRA_BASE_URL=https://your-domain.atlassian.net
  JIRA_EMAIL=you@org.com
  JIRA_API_TOKEN=xxxxx

  # Azure DevOps
  AZDO_ORG=yourorg
  AZDO_PROJECT=YourProject
  AZDO_PAT=xxxxx

Flags:
  --dry-run : print only, no API calls
"""
import os, json, argparse, csv, time
import requests

def load_env(env_path="tracker_import.env"):
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line=line.strip()
                if not line or line.startswith("#"): continue
                if "=" in line:
                    k,v = line.split("=",1)
                    os.environ.setdefault(k.strip(), v.strip())

def jira_get_account_id(base, email, auth):
    # Jira Cloud requires accountId for assignee
    params={"query": email}
    r = requests.get(f"{base}/rest/api/3/user/search", params=params, auth=auth)
    if r.status_code==200:
        arr = r.json()
        if arr:
            return arr[0].get("accountId")
    return None

def jira_bulk_create(jira_json, base, email, token, dry_run=False):
    with open(jira_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    updates = []
    auth=(email, token)
    for item in data.get("issues", []):
        fields = item.get("fields", {})
        assignee_email = fields.pop("customfield_assignee_email", None)
        if assignee_email:
            acct = jira_get_account_id(base, assignee_email, auth)
            if acct:
                fields["assignee"] = {"accountId": acct}
        updates.append({"fields": fields})
    payload={"issueUpdates": updates}
    if dry_run:
        print("[JIRA] DRY-RUN would create", len(updates), "issues")
        return
    r = requests.post(f"{base}/rest/api/3/issue/bulk", json=payload, auth=auth)
    print("[JIRA]", r.status_code, r.text[:500])

def azdo_create_from_csv(csv_path, org, project, pat, dry_run=False):
    url = f"https://dev.azure.com/{org}/{project}/_apis/wit/workitems/$Task?api-version=7.0"
    headers={"Content-Type":"application/json-patch+json"}
    auth = requests.auth.HTTPBasicAuth("", pat)

    def patch_body(row):
        ops = []
        def add(path, value):
            if value is None: return
            ops.append({"op":"add","path":path,"value":value})
        add("/fields/System.Title", row.get("Title",""))
        add("/fields/System.Description", row.get("Description",""))
        add("/fields/System.AreaPath", row.get("Area Path",""))
        add("/fields/System.IterationPath", row.get("Iteration Path",""))
        add("/fields/System.AssignedTo", row.get("Assigned To",""))
        add("/fields/Microsoft.VSTS.Scheduling.DueDate", row.get("Due Date",""))
        # map Priority text -> number (1 highest .. 4 low)
        p = str(row.get("Priority","Medium")).lower()
        pnum = 2 if p=="high" else (1 if p=="critical" else (3 if p=="medium" else 4))
        add("/fields/Microsoft.VSTS.Common.Priority", pnum)
        # Tags
        tags = row.get("Tags","")
        add("/fields/System.Tags", tags)
        return ops

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    if dry_run:
        print("[AZDO] DRY-RUN would create", len(rows), "work items")
        return
    for i, row in enumerate(rows, 1):
        body = patch_body(row)
        r = requests.patch(url, json=body, headers=headers, auth=auth)
        print(f"[AZDO] {i}/{len(rows)} ->", r.status_code)
        time.sleep(0.05)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--jira", action="store_true")
    ap.add_argument("--azdo", action="store_true")
    ap.add_argument("--jira-json", default="jira_bulk_payload.json")
    ap.add_argument("--azdo-csv", default="azdo_bulk_import.csv")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--env", default="tracker_import.env")
    args = ap.parse_args()

    load_env(args.env)

    if args.jira:
        base = os.environ.get("JIRA_BASE_URL","").rstrip("/")
        email = os.environ.get("JIRA_EMAIL","")
        token = os.environ.get("JIRA_API_TOKEN","")
        assert base and email and token, "Missing Jira credentials in env."
        jira_bulk_create(args.jira_json, base, email, token, dry_run=args.dry_run)

    if args.azdo:
        org = os.environ.get("AZDO_ORG","")
        proj = os.environ.get("AZDO_PROJECT","")
        pat = os.environ.get("AZDO_PAT","")
        assert org and proj and pat, "Missing Azure DevOps credentials in env."
        azdo_create_from_csv(args.azdo_csv, org, proj, pat, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
