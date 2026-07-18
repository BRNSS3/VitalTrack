"use client";
import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionType = "expense" | "income";

export type TransactionCategory =
  | "alimentacao"
  | "transporte"
  | "moradia"
  | "saude"
  | "lazer"
  | "educacao"
  | "roupas"
  | "outros"
  | "salario"
  | "freelance"
  | "investimento";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string;
  createdAt: string;
  recurring?: boolean;
}

export interface HealthEntry {
  id: string;
  date: string;
  weight?: number;
  steps?: number;
  water?: number;
  sleep?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export type GoalCategory = "health" | "finance";
export type GoalStatus = "active" | "completed" | "paused";

export interface GoalSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  category: GoalCategory;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  status: GoalStatus;
  subtasks?: GoalSubtask[];
  createdAt: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
  month: string;
}

export interface UserProfile {
  height: number; // cm
  name: string;
}

export interface AppData {
  transactions: Transaction[];
  healthEntries: HealthEntry[];
  goals: Goal[];
  budgets: Budget[];
  profile: UserProfile;
}

// ─── Storage Key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "vitaltrack_data";

function getDefaultData(): AppData {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];
  const fourDaysAgo = new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0];

  return {
    profile: { height: 172, name: "Você" },
    transactions: [
      { id: "t1", type: "income", amount: 3500, description: "Salário", category: "salario", date: today, createdAt: new Date().toISOString(), recurring: true },
      { id: "t2", type: "expense", amount: 85.5, description: "Supermercado", category: "alimentacao", date: today, createdAt: new Date().toISOString() },
      { id: "t3", type: "expense", amount: 45, description: "Uber", category: "transporte", date: yesterday, createdAt: new Date().toISOString() },
      { id: "t4", type: "expense", amount: 120, description: "Academia", category: "saude", date: yesterday, createdAt: new Date().toISOString(), recurring: true },
      { id: "t5", type: "expense", amount: 39.9, description: "Streaming", category: "lazer", date: twoDaysAgo, createdAt: new Date().toISOString(), recurring: true },
      { id: "t6", type: "expense", amount: 1200, description: "Aluguel", category: "moradia", date: twoDaysAgo, createdAt: new Date().toISOString(), recurring: true },
    ],
    healthEntries: [
      { id: "h1", date: today, weight: 75.5, steps: 6200, water: 5, sleep: 7.5, mood: 4, createdAt: new Date().toISOString() },
      { id: "h2", date: yesterday, weight: 75.8, steps: 8100, water: 6, sleep: 6, mood: 3, createdAt: new Date().toISOString() },
      { id: "h3", date: twoDaysAgo, weight: 76.0, steps: 7500, water: 8, sleep: 8, mood: 5, createdAt: new Date().toISOString() },
      { id: "h4", date: threeDaysAgo, weight: 76.2, steps: 5000, water: 4, sleep: 5.5, mood: 2, createdAt: new Date().toISOString() },
      { id: "h5", date: fourDaysAgo, weight: 76.1, steps: 9200, water: 7, sleep: 7, mood: 4, createdAt: new Date().toISOString() },
    ],
    goals: [
      {
        id: "g1", category: "health", title: "Perder peso", description: "Chegar a 70kg",
        targetValue: 70, currentValue: 75.5, unit: "kg",
        deadline: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        status: "active",
        subtasks: [
          { id: "s1", title: "Fazer 30 min de exercício por dia", completed: true },
          { id: "s2", title: "Evitar frituras durante a semana", completed: false },
          { id: "s3", title: "Pesar toda segunda-feira", completed: false },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: "g2", category: "health", title: "Beber mais água", targetValue: 8, currentValue: 5, unit: "copos",
        status: "active", subtasks: [], createdAt: new Date().toISOString(),
      },
      {
        id: "g3", category: "finance", title: "Reserva de emergência", description: "Juntar R$5.000",
        targetValue: 5000, currentValue: 1200, unit: "R$",
        deadline: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
        status: "active",
        subtasks: [
          { id: "s4", title: "Guardar R$500/mês", completed: false },
          { id: "s5", title: "Cancelar assinaturas desnecessárias", completed: true },
        ],
        createdAt: new Date().toISOString(),
      },
    ],
    budgets: [
      { category: "alimentacao", limit: 600, month: new Date().toISOString().slice(0, 7) },
      { category: "transporte", limit: 300, month: new Date().toISOString().slice(0, 7) },
      { category: "lazer", limit: 200, month: new Date().toISOString().slice(0, 7) },
      { category: "saude", limit: 250, month: new Date().toISOString().slice(0, 7) },
      { category: "moradia", limit: 1300, month: new Date().toISOString().slice(0, 7) },
    ],
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    if (typeof window === "undefined") return getDefaultData();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppData;
        if (!parsed.profile) parsed.profile = { height: 172, name: "Você" };
        parsed.goals = parsed.goals.map((g) => ({ ...g, subtasks: g.subtasks ?? [] }));
        return parsed;
      }
    } catch { /* ignore */ }
    return getDefaultData();
  });

  const save = useCallback((next: AppData) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id" | "createdAt">) => {
    save({ ...data, transactions: [{ ...t, id: `t_${Date.now()}`, createdAt: new Date().toISOString() }, ...data.transactions] });
  }, [data, save]);

  const removeTransaction = useCallback((id: string) => {
    save({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
  }, [data, save]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    save({ ...data, transactions: data.transactions.map((t) => t.id === id ? { ...t, ...updates } : t) });
  }, [data, save]);

  const upsertHealthEntry = useCallback((entry: Omit<HealthEntry, "id" | "createdAt"> & { id?: string }) => {
    const existing = data.healthEntries.find((h) => h.date === entry.date);
    if (existing) {
      save({ ...data, healthEntries: data.healthEntries.map((h) => h.date === entry.date ? { ...h, ...entry, id: h.id } : h) });
    } else {
      save({ ...data, healthEntries: [{ ...entry, id: entry.id ?? `h_${Date.now()}`, createdAt: new Date().toISOString() }, ...data.healthEntries] });
    }
  }, [data, save]);

  const addGoal = useCallback((g: Omit<Goal, "id" | "createdAt">) => {
    save({ ...data, goals: [{ ...g, id: `g_${Date.now()}`, createdAt: new Date().toISOString() }, ...data.goals] });
  }, [data, save]);

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    save({ ...data, goals: data.goals.map((g) => g.id === id ? { ...g, ...updates } : g) });
  }, [data, save]);

  const removeGoal = useCallback((id: string) => {
    save({ ...data, goals: data.goals.filter((g) => g.id !== id) });
  }, [data, save]);

  const toggleSubtask = useCallback((goalId: string, subtaskId: string) => {
    save({
      ...data,
      goals: data.goals.map((g) => g.id === goalId ? {
        ...g,
        subtasks: (g.subtasks ?? []).map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s),
      } : g),
    });
  }, [data, save]);

  const addSubtask = useCallback((goalId: string, title: string) => {
    save({
      ...data,
      goals: data.goals.map((g) => g.id === goalId ? {
        ...g,
        subtasks: [...(g.subtasks ?? []), { id: `st_${Date.now()}`, title, completed: false }],
      } : g),
    });
  }, [data, save]);

  const upsertBudget = useCallback((budget: Budget) => {
    const exists = data.budgets.find((b) => b.category === budget.category && b.month === budget.month);
    if (exists) {
      save({ ...data, budgets: data.budgets.map((b) => b.category === budget.category && b.month === budget.month ? budget : b) });
    } else {
      save({ ...data, budgets: [...data.budgets, budget] });
    }
  }, [data, save]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    save({ ...data, profile: { ...data.profile, ...updates } });
  }, [data, save]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split("T")[0];

  const monthlyIncome = useMemo(() =>
    data.transactions.filter((t) => t.type === "income" && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0),
    [data.transactions, currentMonth]);

  const monthlyExpenses = useMemo(() =>
    data.transactions.filter((t) => t.type === "expense" && t.date.startsWith(currentMonth)).reduce((s, t) => s + t.amount, 0),
    [data.transactions, currentMonth]);

  const balance = monthlyIncome - monthlyExpenses;

  const todayHealth = useMemo(() => data.healthEntries.find((h) => h.date === todayStr), [data.healthEntries, todayStr]);

  const latestWeight = useMemo(() =>
    data.healthEntries.filter((h) => h.weight !== undefined).sort((a, b) => a.date > b.date ? -1 : 1)[0]?.weight ?? null,
    [data.healthEntries]);

  // ─── Streaks ──────────────────────────────────────────────────────────────
  const streaks = useMemo(() => {
    let water = 0, steps = 0, sleep = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const e = data.healthEntries.find((h) => h.date === d);
      if (!e) { if (i === 0) continue; else break; }
      if ((e.water ?? 0) >= 6) water++; else if (i > 0) { /* stop counting water */ }
    }
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const e = data.healthEntries.find((h) => h.date === d);
      if (!e) { if (i === 0) continue; else break; }
      if ((e.steps ?? 0) >= 5000) steps++; else break;
    }
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const e = data.healthEntries.find((h) => h.date === d);
      if (!e) { if (i === 0) continue; else break; }
      if ((e.sleep ?? 0) >= 7) sleep++; else break;
    }
    // recalculate water streak properly
    let waterStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
      const e = data.healthEntries.find((h) => h.date === d);
      if (!e) { if (i === 0) continue; else break; }
      if ((e.water ?? 0) >= 6) waterStreak++; else break;
    }
    return { water: waterStreak, steps, sleep };
  }, [data.healthEntries]);

  // ─── Budget Status ────────────────────────────────────────────────────────
  const budgetStatus = useMemo(() =>
    data.budgets
      .filter((b) => b.month === currentMonth)
      .map((b) => {
        const spent = data.transactions
          .filter((t) => t.type === "expense" && t.category === b.category && t.date.startsWith(currentMonth))
          .reduce((s, t) => s + t.amount, 0);
        return { ...b, spent, pct: Math.min((spent / b.limit) * 100, 100), over: spent > b.limit };
      }),
    [data.budgets, data.transactions, currentMonth]);

  return {
    data, save,
    addTransaction, removeTransaction, updateTransaction,
    upsertHealthEntry,
    addGoal, updateGoal, removeGoal, toggleSubtask, addSubtask,
    upsertBudget,
    updateProfile,
    monthlyIncome, monthlyExpenses, balance,
    todayHealth, latestWeight, currentMonth, todayStr,
    streaks, budgetStatus,
  };
}

// ─── Labels & Helpers ─────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  alimentacao: "Alimentação", transporte: "Transporte", moradia: "Moradia",
  saude: "Saúde", lazer: "Lazer", educacao: "Educação", roupas: "Roupas",
  outros: "Outros", salario: "Salário", freelance: "Freelance", investimento: "Investimento",
};

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "alimentacao", "transporte", "moradia", "saude", "lazer", "educacao", "roupas", "outros",
];

export const INCOME_CATEGORIES: TransactionCategory[] = ["salario", "freelance", "investimento", "outros"];

export const MOOD_LABELS: Record<number, string> = {
  1: "😞 Péssimo", 2: "😕 Ruim", 3: "😐 Ok", 4: "😊 Bem", 5: "😄 Ótimo",
};

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
