"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ListChecks,
  Layers,
  ShieldCheck,
  CheckSquare,
  Building2,
  Landmark,
  Activity,
  BarChart3,
  Files,
  Workflow,
  Handshake,
  Bell,
  ScanSearch,
  AlarmClock,
  Bot,
  Users as UsersIcon,
  ScrollText,
  Database as DatabaseIcon,
  Settings as SettingsIcon,
  ChevronRight,
  ChevronLeft,
  Zap,
  ClipboardCheck,
  FileCheck,
  Timer,
  Sparkles,
  Search
} from "lucide-react";

/**
 * Glass Sidebar + Agents (Enhanced)
 * - Active item highlighting via usePathname()
 * - Agents wired to API endpoints (fetch)
 * - Tooltips (lightweight, no external UI lib)
 * - Command Palette (Ctrl/⌘K) with fuzzy-ish filter
 * TailwindCSS required. Works RTL/LTR. Persist collapse in localStorage.
 */

export default function GlassSidebarEnhanced({
  locale: initialLocale = "ar",
  widthCollapsePx = 1280,
}: {
  locale?: "ar" | "en";
  widthCollapsePx?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocale] = useState<"ar" | "en">(initialLocale);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [agentBusy, setAgentBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{title:string,body?:string,type?:"ok"|"err"}|null>(null);

  const dir = locale === "ar" ? "rtl" : "ltr";
  useEffect(() => { if (typeof document !== "undefined") document.documentElement.dir = dir; }, [dir]);

  // Persist preference + auto collapse
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("sh.sidebar.c") : null;
    if (saved) setCollapsed(saved === "1");
    const onResize = () => setCollapsed(window.innerWidth < widthCollapsePx);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [widthCollapsePx]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("sh.sidebar.c", collapsed?"1":"0"); }, [collapsed]);

  // Command Palette hotkey
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.key.toLowerCase() === "k") && (e.metaKey || e.ctrlKey);
      if (isCmdK) { e.preventDefault(); setPaletteOpen(v => !v); }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = useMemo(() => ({
    ar: {
      groups: { core: "الأساسيات", governance: "الحوكمة", operations: "التشغيل", intelligence: "الذكاء", admin: "الإدارة" },
      toggle: "طي الشريط", agents: "الوكلاء (Agents)",
      palette: { placeholder: "ابحث أو نفّذ أمرًا…", nav: "تنقّل", agent: "وكيل" },
      running: "يعمل…", done: "تم التنفيذ", failed: "فشل التنفيذ",
    },
    en: {
      groups: { core: "Core", governance: "Governance", operations: "Operations", intelligence: "Intelligence", admin: "Admin" },
      toggle: "Collapse bar", agents: "Agents",
      palette: { placeholder: "Search or run a command…", nav: "Navigate", agent: "Agent" },
      running: "Running…", done: "Done", failed: "Failed",
    }
  } as const)[locale], [locale]);

  const groups = useMemo(() => ([
    { key: "core", titleAr: "الأساسيات", titleEn: "Core", items: [
      { k: "dashboard", ar: "لوحة القيادة", en: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { k: "assessments", ar: "التقييمات", en: "Assessments", icon: ListChecks, href: "/assessments" },
      { k: "frameworks", ar: "الأطر التنظيمية", en: "Frameworks", icon: Layers, href: "/frameworks" },
      { k: "compliance", ar: "متابعة الامتثال", en: "Compliance", icon: ShieldCheck, href: "/compliance" },
      { k: "controls", ar: "الضوابط", en: "Controls", icon: CheckSquare, href: "/controls" },
    ]},
    { key: "governance", titleAr: "الحوكمة", titleEn: "Governance", items: [
      { k: "organizations", ar: "المؤسسات", en: "Organizations", icon: Building2, href: "/organizations" },
      { k: "regulators", ar: "الجهات التنظيمية", en: "Regulators", icon: Landmark, href: "/regulators" },
      { k: "risk", ar: "إدارة المخاطر", en: "Risk Management", icon: Activity, href: "/risk" },
      { k: "reports", ar: "التقارير", en: "Reports", icon: BarChart3, href: "/reports" },
    ]},
    { key: "operations", titleAr: "التشغيل", titleEn: "Operations", items: [
      { k: "documents", ar: "إدارة المستندات", en: "Documents", icon: Files, href: "/documents" },
      { k: "workflows", ar: "إدارة سير العمل", en: "Workflows", icon: Workflow, href: "/workflows" },
      { k: "partners", ar: "إدارة الشركاء", en: "Partners", icon: Handshake, href: "/partners" },
      { k: "notifications", ar: "مركز الإشعارات", en: "Notifications", icon: Bell, href: "/notifications" },
    ]},
    { key: "intelligence", titleAr: "الذكاء", titleEn: "Intelligence", items: [
      { k: "regintel", ar: "الذكاء التنظيمي", en: "Regulatory Intelligence", icon: ScanSearch, href: "/reg-intel" },
      { k: "scheduler", ar: "الجدولة الذكية", en: "AI Scheduler", icon: AlarmClock, href: "/scheduler" },
      { k: "rag", ar: "خدمة RAG", en: "RAG Service", icon: Bot, href: "/rag" },
    ]},
    { key: "admin", titleAr: "الإدارة", titleEn: "Admin", items: [
      { k: "users", ar: "إدارة المستخدمين", en: "Users", icon: UsersIcon, href: "/users" },
      { k: "audit", ar: "سجلات التدقيق", en: "Audit Logs", icon: ScrollText, href: "/audit" },
      { k: "database", ar: "قاعدة البيانات", en: "Database", icon: DatabaseIcon, href: "/database" },
      { k: "settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon, href: "/settings" },
    ]},
  ]), []);

  const agents = useMemo(() => ([
    { k: "agent_compliance", labelAr: "وكيل الامتثال", labelEn: "Compliance Agent", icon: ShieldCheck, color: "from-emerald-400/70 to-teal-400/70", action: "Gap Scan", endpoint: "/api/agents/compliance/gap-scan", nav: "/compliance?agent=gap-scan" },
    { k: "agent_risk", labelAr: "وكيل المخاطر", labelEn: "Risk Agent", icon: Activity, color: "from-amber-400/70 to-orange-400/70", action: "Risk Analyze", endpoint: "/api/agents/risk/analyze", nav: "/risk?agent=analyze" },
    { k: "agent_evidence", labelAr: "وكيل الأدلة", labelEn: "Evidence Agent", icon: FileCheck, color: "from-sky-400/70 to-cyan-400/70", action: "Collect Evidence", endpoint: "/api/agents/evidence/collect", nav: "/documents?agent=collect" },
    { k: "agent_rag", labelAr: "وكيل المعرفة", labelEn: "RAG Agent", icon: Bot, color: "from-fuchsia-400/70 to-violet-400/70", action: "Ask RAG", endpoint: "/api/agents/rag/ask", nav: "/rag" },
    { k: "agent_scheduler", labelAr: "وكيل الجدولة", labelEn: "Scheduler Agent", icon: Timer, color: "from-indigo-400/70 to-blue-400/70", action: "AI Schedule", endpoint: "/api/agents/scheduler/optimize", nav: "/scheduler?agent=optimize" },
    { k: "agent_coder", labelAr: "وكيل الكود", labelEn: "Coding Agent", icon: ClipboardCheck, color: "from-pink-400/70 to-rose-400/70", action: "Coding Agent", endpoint: "/api/agents/dev/coding", nav: "/devops?agent=coding" },
  ]), []);

  const isActive = useCallback((href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const runAgent = useCallback(async (agentKey: string) => {
    const agent = agents.find(a => a.k === agentKey);
    if (!agent) return;
    try {
      setAgentBusy(agent.k);
      setToast({title: locale==='ar'?t.running:t.running, body: agent.action});
      const res = await fetch(agent.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: "current" }) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(()=>({ok:true}));
      setToast({title: locale==='ar'?t.done:t.done, body: agent.action, type:"ok"});
      // optional: navigate to the relevant page once started
      router.push(agent.nav);
    } catch (e:any) {
      setToast({title: locale==='ar'?t.failed:t.failed, body: e?.message||String(e), type:"err"});
    } finally {
      setAgentBusy(null);
      setTimeout(()=>setToast(null), 2500);
    }
  }, [agents, router, locale, t]);

  return (
    <aside className={`fixed top-0 ${dir === "rtl" ? "right-0" : "left-0"} z-40 h-screen transition-[width] duration-300`} aria-label="Sidebar" style={{ width: collapsed ? 84 : 300 }}>
      <div className="relative h-full border border-white/15 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
        {/* Brand / Toggle + Command button */}
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/70 via-fuchsia-400/70 to-emerald-400/70 ring-1 ring-white/40">
              <Sparkles className="h-4 w-4"/>
            </span>
            {!collapsed && <div className="text-sm font-semibold tracking-tight">Shahin</div>}
          </div>
          <div className="flex items-center gap-1">
            {!collapsed && (
              <button onClick={()=>setPaletteOpen(true)} className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs ring-1 ring-white/10 hover:bg-white/20">
                <Search className="h-3.5 w-3.5"/> <span>Ctrl/⌘K</span>
              </button>
            )}
            <button className="rounded-xl border border-white/20 bg-white/10 p-2 ring-1 ring-white/10 hover:bg-white/20" title={t.toggle} onClick={() => setCollapsed(v => !v)}>
              {dir === "rtl" ? (collapsed ? <ChevronLeft className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>) : (collapsed ? <ChevronRight className="h-4 w-4"/> : <ChevronLeft className="h-4 w-4"/>)}
            </button>
          </div>
        </div>

        {/* NAV GROUPS */}
        <div className="scrollbar-thin space-y-3 overflow-y-auto px-2 pb-28">
          {groups.map((g) => (
            <div key={g.key} className="relative" onMouseEnter={() => setHoverGroup(g.key)} onMouseLeave={() => setHoverGroup(null)}>
              {!collapsed ? (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-wide text-white/70">{locale === "ar" ? g.titleAr : g.titleEn}</div>
              ) : <div className="px-3 py-1 text-[10px] text-white/50"/>}
              <div className="mt-1 space-y-1">
                {g.items.map((it) => {
                  const Icon = it.icon; const active = isActive(it.href);
                  return (
                    <Tooltip key={it.k} label={collapsed ? (locale === "ar" ? it.ar : it.en) : undefined}>
                      <Link href={it.href} className={`group flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl border border-white/10 px-3 py-2 ring-1 ring-white/10 transition ${active?"bg-white/20 shadow-inner ring-2 ring-cyan-300/40":"bg-white/5 hover:bg-white/15"}`}>
                        <Icon className="h-4 w-4 opacity-90"/>
                        {!collapsed && <span className="text-sm font-medium">{locale === "ar" ? it.ar : it.en}</span>}
                      </Link>
                    </Tooltip>
                  );
                })}
              </div>
              <AnimatePresence>
                {collapsed && hoverGroup === g.key && (
                  <motion.div initial={{ opacity: 0, x: dir === "rtl" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir === "rtl" ? -8 : 8 }} transition={{ duration: 0.16 }} className={`absolute top-5 ${dir === "rtl" ? "left-full" : "right-full"} w-56 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl ring-1 ring-white/10 shadow-xl`}>
                    <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">{locale === "ar" ? g.titleAr : g.titleEn}</div>
                    <div className="space-y-1">
                      {g.items.map((it) => {
                        const Icon = it.icon; const active = isActive(it.href);
                        return (
                          <Link key={it.k} href={it.href} className={`group flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2 ring-1 ring-white/10 transition ${active?"bg-white/20 ring-2 ring-cyan-300/40":"bg-white/5 hover:bg-white/15"}`}>
                            <Icon className="h-4 w-4"/>
                            <span className="text-sm font-medium">{locale === "ar" ? it.ar : it.en}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* AGENTS SECTION */}
        <div className="absolute inset-x-0 bottom-0">
          {!collapsed ? (
            <div className="px-3 pb-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{t.agents}</div>
                <Link href="/agents" className="text-[11px] text-white/60 hover:text-white/80">View all</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {agents.map((a) => {
                  const Icon = a.icon; const busy = agentBusy === a.k;
                  return (
                    <button key={a.k} onClick={() => runAgent(a.k)} className="group relative rounded-2xl border border-white/10 bg-white/5 p-2 ring-1 ring-white/10 hover:bg-white/15 transition focus:outline-none">
                      <span className={`absolute -z-10 inset-0 rounded-2xl blur-xl opacity-50 bg-gradient-to-r ${a.color}`}></span>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Icon className={`h-4 w-4 ${busy?"animate-pulse":''''}` as any}/>
                        <div className="text-[10px] leading-tight line-clamp-2">{locale === "ar" ? a.labelAr : a.labelEn}</div>
                        <div className="mt-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px]">
                          <span className="inline-flex items-center gap-1 opacity-90"><Zap className="h-3 w-3"/>{a.action}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-2">
              <Link href="/agents" title={t.agents} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 ring-1 ring-white/10 hover:bg-white/15 transition">
                <Bot className="h-5 w-5"/>
              </Link>
            </div>
          )}
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} transition={{duration:0.18}} className="pointer-events-none absolute bottom-24 inset-x-0 px-3">
              <div className={`mx-3 rounded-xl ${toast.type==='err'?'bg-rose-600/20 ring-rose-400/40':'bg-emerald-600/20 ring-emerald-400/40'} backdrop-blur-xl ring-1 px-3 py-2 text-sm`}> 
                <div className="font-semibold">{toast.title}</div>
                {toast.body && <div className="opacity-90 text-xs">{toast.body}</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)} locale={locale} items={flattenForPalette(groups, agents, locale)} onRun={(type, hrefOrKey)=>{
        if(type==='nav') router.push(hrefOrKey); else runAgent(hrefOrKey);
        setPaletteOpen(false);
      }}/>
    </aside>
  );
}

/* -------- Helpers -------- */
function Tooltip({ children, label }: { children: React.ReactNode; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      {children}
      <AnimatePresence>
        {label && show && (
          <motion.div initial={{opacity:0, y:4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:2}} transition={{duration:0.12}} className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded-md border border-white/15 bg-white/10 px-2 py-1 text-[11px] backdrop-blur-xl ring-1 ring-white/10">
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function flattenForPalette(groups:any[], agents:any[], locale:"ar"|"en") {
  const nav = groups.flatMap(g => g.items.map((it:any) => ({ type:'nav', label: locale==='ar'?it.ar:it.en, href: it.href, icon: it.icon })));
  const act = agents.map(a => ({ type:'agent', label: locale==='ar'?a.labelAr:a.labelEn, key: a.k, icon: a.icon }));
  return [...nav, ...act];
}

function CommandPalette({ open, onClose, items, onRun, locale }:{ open:boolean; onClose:()=>void; items:any[]; onRun:(type:'nav'|'agent', value:string)=>void; locale:'ar'|'en'}){
  const [q, setQ] = useState("");
  const dialogRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ if(open){ setQ(""); setTimeout(()=>dialogRef.current?.querySelector("input")?.focus(),50);} },[open]);

  // Simple filter (case-insensitive contains). Could be upgraded to fuse.js.
  const list = useMemo(()=>{
    const s = q.trim().toLowerCase();
    return !s ? items : items.filter((it:any)=> it.label.toLowerCase().includes(s));
  },[q, items]);

  const [idx, setIdx] = useState(0);
  useEffect(()=>setIdx(0), [q, open]);

  useEffect(()=>{
    if(!open) return;
    const onKey = (e:KeyboardEvent) => {
      if(e.key==='ArrowDown'){ e.preventDefault(); setIdx(i=> Math.min(i+1, list.length-1)); }
      if(e.key==='ArrowUp'){ e.preventDefault(); setIdx(i=> Math.max(i-1, 0)); }
      if(e.key==='Enter'){ e.preventDefault(); const it=list[idx]; if(!it) return; if(it.type==='nav') onRun('nav', it.href); else onRun('agent', it.key); }
      if(e.key==='Escape'){ onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[open, list, idx, onRun, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60]" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
          <motion.div ref={dialogRef} initial={{opacity:0, scale:0.98, y:8}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.98, y:6}} transition={{duration:0.16}} className="absolute inset-x-0 top-24 mx-auto w-full max-w-xl rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl">
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <Search className="h-4 w-4 opacity-80"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder={locale==='ar'? 'ابحث أو نفّذ أمرًا…' : 'Search or run a command…'} className="w-full bg-transparent text-sm outline-none placeholder-white/60"/>
            </div>
            <div className="mt-2 max-h-80 overflow-auto">
              {list.length===0 && (
                <div className="px-3 py-6 text-center text-sm opacity-70">{locale==='ar'? 'لا توجد نتائج' : 'No results'}</div>
              )}
              {list.map((it:any, i:number)=>{
                const Icon = it.icon; const active = i===idx;
                return (
                  <button key={(it.type==='nav'?it.href:it.key)+i} onClick={()=> it.type==='nav'? onRun('nav', it.href): onRun('agent', it.key)} className={`flex w-full items-center gap-3 rounded-xl border border-white/10 px-3 py-2 text-left ring-1 ring-white/10 transition ${active? 'bg-white/20 ring-2 ring-cyan-300/40':'bg-white/5 hover:bg-white/15'}`}>
                    <Icon className="h-4 w-4"/>
                    <div className="text-sm">
                      <div className="font-medium">{it.label}</div>
                      <div className="text-xs opacity-70">{it.type==='nav' ? (locale==='ar'? 'تنقّل' : 'Navigate') : (locale==='ar'? 'وكيل' : 'Agent')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Sample Next.js Route Handlers (API) ----------------
Create files like these in /app/api/agents/.../route.ts

// app/api/agents/compliance/gap-scan/route.ts
export async function POST(req: Request) {
  // TODO: read tenant_id from body/JWT; kick a queue job
  const body = await req.json().catch(()=>({}));
  // simulate enqueue
  return new Response(JSON.stringify({ ok: true, job: "gap-scan-queued", tenant: body?.tenant_id || "current" }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// app/api/agents/risk/analyze/route.ts
export async function POST(req: Request) {
  return new Response(JSON.stringify({ ok: true, job: "risk-analyze-queued" }), { status: 200, headers: { "Content-Type": "application/json" } });
}

// Repeat similarly for: evidence/collect, rag/ask, scheduler/optimize, dev/coding
*/
