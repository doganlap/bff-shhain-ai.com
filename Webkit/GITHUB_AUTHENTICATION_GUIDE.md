# GitHub Authentication Guide

## Problem
Git push is failing because the repository belongs to `doganlap`, but Git is authenticated as `Dogana-Ai`.

## Solution: Authenticate with Correct GitHub Account

### Option 1: Use GitHub CLI (Recommended)

1. **Install GitHub CLI** (if not already installed):
   ```bash
   winget install GitHub.cli
   ```

2. **Login with GitHub CLI**:
   ```bash
   gh auth login
   ```
   
   Follow the prompts:
   - Select: `GitHub.com`
   - Select: `HTTPS`
   - Authenticate: `Yes`
   - Select: `Login with a web browser`
   - Copy the code shown
   - Press Enter (browser will open)
   - Paste the code and authorize

3. **Verify authentication**:
   ```bash
   gh auth status
   ```

4. **Push to GitHub**:
   ```bash
   git push -u origin master
   ```

### Option 2: Use Personal Access Token

1. **Create a Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click: "Generate new token" → "Generate new token (classic)"
   - Name: `shahin-landing-deployment`
   - Expiration: `90 days` (or your preference)
   - Select scopes:
     - ✅ `repo` (all)
     - ✅ `workflow` (if using GitHub Actions)
   - Click: "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push using the token**:
   ```bash
   git push -u origin master
   ```
   
   When prompted:
   - Username: `doganlap`
   - Password: `[paste your token]`

3. **Save credentials** (optional):
   - Windows Credential Manager will save the token
   - Or use: `git config --global credential.helper wincred`

### Option 3: Use SSH (If SSH Key is Configured)

1. **Check for SSH key**:
   ```bash
   ls ~/.ssh/id_rsa.pub
   ```

2. **If no SSH key, generate one**:
   ```bash
   ssh-keygen -t ed25519 -C "doganlap@github.com"
   ```

3. **Add SSH key to GitHub**:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/ssh/new
   - Paste the key and save

4. **Update remote to use SSH**:
   ```bash
   git remote set-url origin git@github.com:doganlap/shahin-landing.git
   ```

5. **Push to GitHub**:
   ```bash
   git push -u origin master
   ```

## Quick Script

Run the automated script:
```bash
PUSH_TO_GITHUB.shahin-landing.bat
```

This script will guide you through authentication and push.

## Verify Push

After successful push, verify:
- Go to: https://github.com/doganlap/shahin-landing
- Check that files are present
- Verify the commit history

## Next Steps

After pushing to GitHub:
1. Run: `CONNECT_CLOUDFLARE.shahin-landing.bat`
2. Connect repository to Cloudflare Pages
3. Configure build settings
4. Deploy!

## Troubleshooting

### Error: "Permission denied"
- Ensure you're authenticated with the correct account (`doganlap`)
- Verify repository access permissions
- Check if 2FA is enabled (requires token, not password)

### Error: "Repository not found"
- Verify repository exists: https://github.com/doganlap/shahin-landing
- Check repository visibility (public/private)
- Ensure you have access to the repository

### Error: "Authentication failed"
- Clear cached credentials: `git credential-manager erase`
- Re-authenticate using one of the methods above
- Check token expiration (if using token)

## References

- GitHub CLI: https://cli.github.com/
- Personal Access Tokens: https://github.com/settings/tokens
- SSH Keys: https://github.com/settings/ssh
- Git Credentials: https://git-scm.com/docs/git-credential

