"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAppData, formatCurrency, formatDate } from "@/lib/storage";
import { ThemeProvider } from "@/lib/theme";
import dynamic from "next/dynamic";
import {
  Activity, AlertTriangle, Droplets, Flame, LayoutDashboard,
  Scale, Target, TrendingDown, TrendingUp, Wallet, CalendarCheck,
  Settings, Smile, Calendar, BarChart2,
} from "lucide-react";

const FinanceDashboard = dynamic(() => import("@/components/finance/FinanceDashboard"), { ssr: false });
const FinanceInsights = dynamic(() => import("@/components/finance/FinanceInsights"), { ssr: false });
const HealthDashboard = dynamic(() => import("@/components/health/HealthDashboard"), { ssr: false });
const HealthCalendar = dynamic(() => import("@/components/health/HealthCalendar"), { ssr: false });
const GoalsDashboard = dynamic(() => import("@/components/goals/GoalsDashboard"), { ssr: false });
const DailySummaryModal = dynamic(() => import("@/components/daily/DailySummaryModal"), { ssr: false });
const SettingsPanel = dynamic(() => import("@/components/settings/SettingsPanel").then(m => ({ default: () => { const S = m; return <><S.ThemePicker /><S.BackupRestore /></>; } })), { ssr: false });

type Tab = "dashboard" | "finance" | "health" | "goals" | "settings";
type FinanceView = "transactions" | "insights";
type HealthView = "metrics" | "calendar";

// ─── App Content ──────────────────────────────────────────────────────────────
function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [financeView, setFinanceView] = useState<FinanceView>("transactions");
  const [healthView, setHealthView] = useState<HealthView>("metrics");
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    data, monthlyIncome, monthlyExpenses, balance,
    todayHealth, latestWeight, currentMonth,
    streaks, budgetStatus,
  } = useAppData();

  const trendData = mounted ? Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
    const amount = data.transactions
      .filter((t) => t.type === "expense" && t.date === dateStr)
      .reduce((s, t) => s + t.amount, 0);
    return { label, amount };
  }) : [];

  const overBudget = mounted ? budgetStatus.filter((b) => b.over) : [];
  const nearBudget = mounted ? budgetStatus.filter((b) => !b.over && b.pct >= 80) : [];
  const hasAlert = overBudget.length > 0 || nearBudget.length > 0;
  const safeStreaks = mounted ? streaks : { water: 0, steps: 0, sleep: 0 };
  const totalStreak = Math.max(safeStreaks.water, safeStreaks.steps, safeStreaks.sleep);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Início", icon: <LayoutDashboard size={19} /> },
    { id: "finance", label: "Finanças", icon: <Wallet size={19} /> },
    { id: "health", label: "Saúde", icon: <Activity size={19} /> },
    { id: "goals", label: "Metas", icon: <Target size={19} /> },
    { id: "settings", label: "Config", icon: <Settings size={19} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative" style={{ background: "var(--vt-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b px-5 pt-6 pb-4"
        style={{ background: "var(--vt-nav)", backdropFilter: "blur(12px)", borderColor: "var(--vt-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--vt-text)" }}>
              Vital<span style={{ color: "var(--vt-health)" }}>Track</span>
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--vt-muted)" }} suppressHydrationWarning>
              {typeof window !== "undefined"
                ? new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
                : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {totalStreak > 0 && (
              <div className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.3)" }}>
                <Flame size={12} style={{ color: "var(--vt-warning)" }} />
                <span className="text-xs font-bold" suppressHydrationWarning style={{ color: "var(--vt-warning)" }}>{totalStreak}</span>
              </div>
            )}
            <button onClick={() => setShowDailySummary(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.25)" }}>
              <CalendarCheck size={16} style={{ color: "var(--vt-health)" }} />
            </button>
          </div>
        </div>

        {/* Finance sub-tabs */}
        {activeTab === "finance" && (
          <div className="flex gap-2 mt-3">
            {([["transactions","Transações","💳"],["insights","Análises","📊"]] as const).map(([v, label, icon]) => (
              <button key={v} onClick={() => setFinanceView(v as FinanceView)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: financeView === v ? "rgba(124,106,247,0.2)" : "var(--vt-input)",
                  color: financeView === v ? "var(--vt-finance)" : "var(--vt-muted)",
                  border: financeView === v ? "1px solid var(--vt-finance)" : "1px solid transparent",
                }}>
                {icon} {label}
              </button>
            ))}
          </div>
        )}

        {/* Health sub-tabs */}
        {activeTab === "health" && (
          <div className="flex gap-2 mt-3">
            {([["metrics","Métricas","💪"],["calendar","Calendário","📅"]] as const).map(([v, label, icon]) => (
              <button key={v} onClick={() => setHealthView(v as HealthView)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: healthView === v ? "rgba(0,229,160,0.15)" : "var(--vt-input)",
                  color: healthView === v ? "var(--vt-health)" : "var(--vt-muted)",
                  border: healthView === v ? "1px solid var(--vt-health)" : "1px solid transparent",
                }}>
                {icon} {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {hasAlert && (
              <div className="rounded-2xl p-3 cursor-pointer" onClick={() => setActiveTab("finance")}
                style={{ background: overBudget.length > 0 ? "rgba(255,107,107,0.08)" : "rgba(255,179,71,0.08)", border: `1px solid ${overBudget.length > 0 ? "rgba(255,107,107,0.3)" : "rgba(255,179,71,0.3)"}` }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} style={{ color: overBudget.length > 0 ? "var(--vt-danger)" : "var(--vt-warning)" }} />
                  <span className="text-xs font-semibold" style={{ color: overBudget.length > 0 ? "var(--vt-danger)" : "var(--vt-warning)" }}>
                    {overBudget.length > 0 ? `${overBudget.length} categoria(s) acima do limite` : `${nearBudget.length} categoria(s) próxima(s) do limite`}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: "var(--vt-muted)" }}>Ver →</span>
                </div>
              </div>
            )}

            {(safeStreaks.water > 0 || safeStreaks.steps > 0 || safeStreaks.sleep > 0) && (
              <div className="rounded-2xl p-4" style={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={14} style={{ color: "var(--vt-warning)" }} />
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-muted)" }}>Sequências 🔥</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Água", streak: safeStreaks.water, icon: "💧" },
                    { label: "Passos", streak: safeStreaks.steps, icon: "👟" },
                    { label: "Sono", streak: safeStreaks.sleep, icon: "🌙" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-2.5 text-center"
                      style={{ background: s.streak > 0 ? "rgba(255,179,71,0.08)" : "var(--vt-input)", border: s.streak > 0 ? "1px solid rgba(255,179,71,0.25)" : "1px solid var(--vt-border)" }}>
                      <div className="text-lg">{s.icon}</div>
                      <div className="flex items-center justify-center gap-0.5 mt-0.5">
                        {s.streak > 0 && <Flame size={10} style={{ color: "var(--vt-warning)" }} />}
                        <span className="text-sm font-bold" style={{ color: s.streak > 0 ? "var(--vt-warning)" : "var(--vt-muted)" }}>{s.streak || "—"}</span>
                      </div>
                      <p className="text-[9px]" style={{ color: "var(--vt-muted)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!todayHealth && (
              <button onClick={() => setShowDailySummary(true)}
                className="w-full rounded-2xl p-4 text-center transition-all"
                style={{ background: "rgba(0,229,160,0.06)", border: "1px dashed rgba(0,229,160,0.35)" }}>
                <CalendarCheck size={20} className="mx-auto mb-1" style={{ color: "var(--vt-health)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--vt-health)" }}>Registrar meu dia</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--vt-muted)" }}>Anote peso, passos, água, sono e humor</p>
              </button>
            )}

            <div className="rounded-2xl p-4" style={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={14} style={{ color: "var(--vt-finance)" }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-muted)" }}>Finanças do Mês</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs" style={{ color: "var(--vt-muted)" }}>Saldo disponível</p>
                  <p className="text-2xl font-bold" suppressHydrationWarning style={{ color: mounted && balance < 0 ? "var(--vt-danger)" : "var(--vt-health)" }}>{mounted ? formatCurrency(balance) : "—"}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1.5 justify-end">
                    <TrendingUp size={11} style={{ color: "var(--vt-health)" }} />
                    <span className="text-xs" suppressHydrationWarning style={{ color: "var(--vt-health)" }}>{mounted ? formatCurrency(monthlyIncome) : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <TrendingDown size={11} style={{ color: "var(--vt-danger)" }} />
                    <span className="text-xs" suppressHydrationWarning style={{ color: "var(--vt-danger)" }}>{mounted ? formatCurrency(monthlyExpenses) : ""}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C6AF7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7C6AF7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: "var(--vt-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)", borderRadius: 8, color: "var(--vt-text)", fontSize: 11 }} formatter={(v: number) => [formatCurrency(v), "Gastos"]} />
                    <Area type="monotone" dataKey="amount" stroke="var(--vt-finance)" strokeWidth={1.5} fill="url(#expGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Activity size={14} style={{ color: "var(--vt-health)" }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-muted)" }}>Saúde de Hoje</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: <Scale size={15} />, value: latestWeight?.toFixed(1) ?? "—", unit: "kg", color: "var(--vt-health)" },
                  { icon: <Activity size={15} />, value: `${((todayHealth?.steps ?? 0)/1000).toFixed(1)}k`, unit: "passos", color: "var(--vt-finance)" },
                  { icon: <Droplets size={15} />, value: `${todayHealth?.water ?? 0}/8`, unit: "copos", color: "#38BDF8" },
                  { icon: todayHealth?.mood ? <span className="text-base">{["😞","😕","😐","😊","😄"][(todayHealth.mood)-1]}</span> : <Smile size={15} />, value: `${todayHealth?.sleep ?? "—"}h`, unit: "sono", color: "var(--vt-warning)" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--vt-input)", color: item.color }}>{item.icon}</div>
                    <span className="text-xs font-bold" style={{ color: "var(--vt-text)" }}>{item.value}</span>
                    <span className="text-[9px]" style={{ color: "var(--vt-muted)" }}>{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} style={{ color: "var(--vt-warning)" }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-muted)" }}>Metas Ativas</span>
              </div>
              {data.goals.slice(0, 3).map((goal) => {
                const pct = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                const color = goal.category === "health" ? "var(--vt-health)" : "var(--vt-finance)";
                return (
                  <div key={goal.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm truncate flex-1 pr-2" style={{ color: "var(--vt-text)" }}>{goal.title}</span>
                      <span className="text-xs font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--vt-border)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
              {data.goals.length === 0 && <p className="text-xs text-center py-2" style={{ color: "var(--vt-muted)" }}>Nenhuma meta criada</p>}
            </div>

            <div className="rounded-2xl p-4" style={{ background: "var(--vt-card)", border: "1px solid var(--vt-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={14} style={{ color: "var(--vt-danger)" }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-muted)" }}>Últimas Transações</span>
              </div>
              <div className="space-y-2">
                {data.transactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: t.type === "income" ? "rgba(0,229,160,0.12)" : "rgba(255,107,107,0.12)" }}>
                        {t.type === "income"
                          ? <TrendingUp size={11} style={{ color: "var(--vt-health)" }} />
                          : <TrendingDown size={11} style={{ color: "var(--vt-danger)" }} />}
                      </div>
                      <div>
                        <p className="text-xs font-medium truncate max-w-[130px]" style={{ color: "var(--vt-text)" }}>{t.description}</p>
                        <p className="text-[10px]" style={{ color: "var(--vt-muted)" }}>{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: t.type === "income" ? "var(--vt-health)" : "var(--vt-danger)" }}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "finance" && (
          financeView === "transactions" ? <FinanceDashboard /> : <FinanceInsights />
        )}

        {activeTab === "health" && (
          healthView === "metrics" ? <HealthDashboard /> : <HealthCalendar />
        )}

        {activeTab === "goals" && <GoalsDashboard />}

        {activeTab === "settings" && (
          <div className="space-y-4 pb-4">
            <SettingsPanel />
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto border-t px-2 pt-2 pb-6 safe-bottom"
        style={{ background: "var(--vt-nav)", backdropFilter: "blur(12px)", borderColor: "var(--vt-border)" }}>
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const colors: Record<Tab, string> = {
              dashboard: "var(--vt-text)", finance: "var(--vt-finance)",
              health: "var(--vt-health)", goals: "var(--vt-warning)", settings: "#94A3B8",
            };
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all">
                <span style={{ color: isActive ? colors[tab.id] : "var(--vt-muted)" }}>{tab.icon}</span>
                <span className="text-[9px] font-medium" style={{ color: isActive ? colors[tab.id] : "var(--vt-muted)" }}>{tab.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full" style={{ background: colors[tab.id] }} />}
              </button>
            );
          })}
        </div>
      </nav>

      {showDailySummary && <DailySummaryModal onClose={() => setShowDailySummary(false)} />}
    </div>
  );
}

export default function VitalTrackApp() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
