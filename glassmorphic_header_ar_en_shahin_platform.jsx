import React, { useEffect, useMemo, useRef, useState } from "react";
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
  ChevronDown,
  Menu,
  X,
  Search,
  Sparkles,
  Globe,
  SunMedium,
  MoonStar
} from "lucide-react";

// TailwindCSS is assumed. Drop this component in your Next.js app/layout.tsx top area.
// Glassmorphic, bilingual (AR/EN), RTL-aware, with agents-style animated backdrop,
// command palette stub, and full platform navigation (no login UI).

export default function GlassHeader() {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const [open, setOpen] = useState(false); // mobile drawer
  const [isDark, setIsDark] = useState(false);
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
    }
  }, [dir]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark]);

  const t = useMemo(() =>
    ({
      ar: {
        brand: "شاهين — منصة الامتثال الذكي",
        search: "ابحث… (Ctrl/⌘K)",
        systemOnline: "النظام متصل",
        dbConnected: "قاعدة البيانات: متصلة",
        controls: "الضوابط",
      },
      en: {
        brand: "Shahin — Intelligent Compliance Platform",
        search: "Search… (Ctrl/⌘K)",
        systemOnline: "System Online",
        dbConnected: "Database: Connected",
        controls: "Controls",
      }
    } as const)[locale]
  , [locale]);

  const items = useMemo(() => (
    [
      { key: "dashboard", ar: "لوحة القيادة", en: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { key: "assessments", ar: "التقييمات", en: "Assessments", icon: ListChecks, href: "/assessments" },
      { key: "frameworks", ar: "الأطر التنظيمية", en: "Frameworks", icon: Layers, href: "/frameworks" },
      { key: "compliance", ar: "متابعة الامتثال", en: "Compliance", icon: ShieldCheck, href: "/compliance" },
      { key: "controls", ar: "الضوابط", en: "Controls", icon: CheckSquare, href: "/controls" },
      { key: "organizations", ar: "المؤسسات", en: "Organizations", icon: Building2, href: "/organizations" },
      { key: "regulators", ar: "الجهات التنظيمية", en: "Regulators", icon: Landmark, href: "/regulators" },
      { key: "risk", ar: "إدارة المخاطر", en: "Risk Management", icon: Activity, href: "/risk" },
      { key: "reports", ar: "التقارير", en: "Reports", icon: BarChart3, href: "/reports" },
      { key: "documents", ar: "إدارة المستندات", en: "Documents", icon: Files, href: "/documents" },
      { key: "workflows", ar: "إدارة سير العمل", en: "Workflows", icon: Workflow, href: "/workflows" },
      { key: "partners", ar: "إدارة الشركاء", en: "Partners", icon: Handshake, href: "/partners" },
      { key: "notifications", ar: "مركز الإشعارات", en: "Notifications", icon: Bell, href: "/notifications" },
      { key: "regintel", ar: "الذكاء التنظيمي", en: "Regulatory Intelligence", icon: ScanSearch, href: "/reg-intel" },
      { key: "scheduler", ar: "الجدولة الذكية", en: "AI Scheduler", icon: AlarmClock, href: "/scheduler" },
      { key: "rag", ar: "خدمة RAG", en: "RAG Service", icon: Bot, href: "/rag" },
      { key: "users", ar: "إدارة المستخدمين", en: "Users", icon: UsersIcon, href: "/users" },
      { key: "audit", ar: "سجلات التدقيق", en: "Audit Logs", icon: ScrollText, href: "/audit" },
      { key: "database", ar: "قاعدة البيانات", en: "Database", icon: DatabaseIcon, href: "/database" },
      { key: "settings", ar: "الإعدادات", en: "Settings", icon: SettingsIcon, href: "/settings" },
    ]
  ), []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Agents-style animated backdrop */}
      <AgentsBackdrop />

      <nav className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/10">
          <div className="flex items-center gap-2 px-3 sm:px-5 py-2">
            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex md:hidden items-center justify-center rounded-xl p-2 hover:bg-white/20 transition"
              aria-label="Toggle Menu"
            >
              {open ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </button>

            {/* Brand */}
            <div className="relative flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/70 via-fuchsia-400/70 to-emerald-400/70 ring-1 ring-white/40">
                <Sparkles className="h-4 w-4"/>
              </span>
              <div className="font-semibold tracking-tight text-sm sm:text-base">
                {t.brand}
              </div>
            </div>

            {/* Primary nav (scrollable pills) */}
            <div className="hidden md:flex ms-auto items-center gap-1">
              <PillNav items={items} locale={locale} />
            </div>

            {/* Actions */}
            <div className="ms-auto flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden sm:block">
                <input
                  aria-label={t.search}
                  placeholder={t.search}
                  className="w-56 rounded-xl border border-white/20 bg-white/5 px-9 py-2 text-sm outline-none placeholder-white/60 focus:ring-2 focus:ring-cyan-400/60"
                />
                <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70"/>
              </div>

              {/* Notifications */}
              <button className="relative rounded-xl p-2 hover:bg-white/20 transition" aria-label="Notifications">
                <Bell className="h-5 w-5"/>
                <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white/80"/>
              </button>

              {/* Lang toggle */}
              <button
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="rounded-xl p-2 hover:bg-white/20 transition"
                aria-label="Language"
                title="Language"
              >
                <Globe className="h-5 w-5"/>
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setIsDark(v => !v)}
                className="rounded-xl p-2 hover:bg-white/20 transition"
                aria-label="Theme"
                title="Theme"
              >
                {isDark ? <SunMedium className="h-5 w-5"/> : <MoonStar className="h-5 w-5"/>}
              </button>
            </div>
          </div>

          {/* Status strip */}
          <div className="flex items-center gap-3 px-3 sm:px-5 pb-2">
            <StatusChip color="emerald">{t.systemOnline}</StatusChip>
            <StatusChip color="cyan">{t.dbConnected}</StatusChip>
            <StatusChip color="violet">{t.controls}</StatusChip>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="mx-auto mt-2 max-w-7xl px-3 sm:px-6"
          >
            <div className="rounded-2xl border border-white/15 bg-white/10 dark:bg-neutral-900/40 backdrop-blur-xl ring-1 ring-white/10 p-2">
              <div className="mb-2 flex items-center gap-2 px-1">
                <input
                  placeholder={t.search}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm outline-none placeholder-white/60 focus:ring-2 focus:ring-cyan-400/60"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {items.map((it) => {
                  const Icon = it.icon;
                  return (
                    <a key={it.key} href={it.href}
                       className="group flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/15 transition">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                        <Icon className="h-4 w-4"/>
                      </span>
                      <span className="text-sm font-medium">{locale === "ar" ? it.ar : it.en}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Spacer to avoid content overlap */}
      <div className="h-28"/>
    </header>
  );
}

function PillNav({ items, locale }: { items: any[]; locale: "ar" | "en" }) {
  const listRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={listRef} className="flex max-w-[58rem] overflow-x-auto no-scrollbar gap-1 py-1">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <a key={it.key} href={it.href}
             className="group inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm ring-1 ring-white/10 hover:bg-white/15 hover:ring-white/20 transition">
            <Icon className="h-4 w-4 opacity-90"/>
            <span className="whitespace-nowrap font-medium">{locale === "ar" ? it.ar : it.en}</span>
          </a>
        );
      })}
    </div>
  );
}

function StatusChip({ children, color }: { children: React.ReactNode; color: "emerald" | "cyan" | "violet" }) {
  const palette = {
    emerald: "from-emerald-400/70 to-teal-400/60",
    cyan: "from-cyan-400/70 to-sky-400/60",
    violet: "from-fuchsia-400/70 to-violet-400/60",
  }[color];
  return (
    <span className={`inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-2 py-1 text-xs ring-1 ring-white/10`}> 
      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${palette} shadow`} />
      {children}
    </span>
  );
}

function AgentsBackdrop() {
  // subtle floating orbs simulating "agents" energy in the header background
  const Orb = ({ delay, size, x, y }: { delay: number; size: number; x: number; y: number }) => (
    <motion.span
      initial={{ opacity: 0.2, x, y, scale: 0.9 }}
      animate={{
        opacity: [0.35, 0.6, 0.35],
        x: [x, x + 8, x - 6, x],
        y: [y, y - 6, y + 4, y],
        scale: [0.95, 1.06, 0.98, 0.95]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
      className="pointer-events-none absolute rounded-full blur-2xl"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(35% 35% at 50% 50%, rgba(255,255,255,0.8), rgba(255,255,255,0) 70%)",
        filter: "saturate(120%)",
      }}
    />
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-36">
      <div className="relative mx-auto max-w-7xl">
        <Orb delay={0} size={180} x={-40} y={10} />
        <Orb delay={1.2} size={140} x={220} y={-6} />
        <Orb delay={0.8} size={120} x={520} y={8} />
        <Orb delay={1.6} size={160} x={820} y={-2} />
      </div>
    </div>
  );
}

// Utility: hide scrollbars on horizontal pill nav
declare global { interface HTMLElement { } }

// Add in globals.css:
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
