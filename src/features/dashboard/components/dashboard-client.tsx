"use client";

import { useState, useMemo } from "react";
import { BalanceCards } from "./balance-cards";
import { BalanceChart } from "./monthly-chart";
import { CategoryBreakdown } from "./category-breakdown";
import { RecentTransactions } from "./recent-transactions";
import { AccountsSummary } from "./accounts-summary";
import { CreateTransactionDialog } from "@/features/transactions/components/create-transaction-dialog";
import { ScrollArea } from "@/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Button } from "@/ui/button";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Calendar } from "@/ui/calendar";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "credit";
  initialBalance: number;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  account: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  parentId?: string;
}

interface DashboardClientProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}

type RangePreset = "7d" | "30d" | "month" | "3m" | "year" | "all" | "custom";

const presets: { value: RangePreset; label: string }[] = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "month", label: "Este mes" },
  { value: "3m", label: "3 meses" },
  { value: "year", label: "Este año" },
  { value: "all", label: "Todo" },
  { value: "custom", label: "Personalizado" },
];

function getDateRange(preset: RangePreset, custom?: DateRange): { from: Date; to: Date } {
  const now = new Date();
  const to = now;
  switch (preset) {
    case "7d": return { from: subWeeks(now, 1), to };
    case "30d": return { from: subDays(now, 30), to };
    case "month": return { from: startOfMonth(now), to: endOfMonth(now) };
    case "3m": return { from: subMonths(now, 3), to };
    case "year": return { from: startOfYear(now), to };
    case "all": return { from: new Date(2000, 0, 1), to };
    case "custom":
      return { from: custom?.from ?? subDays(now, 30), to: custom?.to ?? now };
  }
}

function getBalanceOverTime(
  transactions: Transaction[],
  initialBalance: number,
  from: Date,
  to: Date,
) {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Build a map of net change per day from filtered transactions
  const dailyMap = new Map<string, number>();
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const delta = t.type === "income" ? t.amount : -t.amount;
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + delta);
  }

  // Generate every day in the range, but never past today
  const result: { date: string; saldo: number }[] = [];
  let running = initialBalance;
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const today = new Date();
  const endCap = new Date(Math.min(to.getTime(), today.getTime()));
  const end = new Date(endCap.getFullYear(), endCap.getMonth(), endCap.getDate());

  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    running += dailyMap.get(key) ?? 0;
    result.push({
      date: `${cursor.getDate()} ${months[cursor.getMonth()]}`,
      saldo: running,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export function DashboardClient({ accounts, transactions, categories }: DashboardClientProps) {
  const [rangePreset, setRangePreset] = useState<RangePreset>("month");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const { from, to } = getDateRange(rangePreset, customRange);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      const inRange = d >= from && d <= to;
      const inAccount = selectedAccount === "all" || t.account === selectedAccount;
      return inRange && inAccount;
    });
  }, [transactions, from, to, selectedAccount]);

  // Balances per account (using ALL transactions, not filtered)
  const accountsWithBalance = useMemo(() => {
    const balanceByAccount = new Map<string, number>();
    for (const t of transactions) {
      const current = balanceByAccount.get(t.account) ?? 0;
      balanceByAccount.set(t.account, t.type === "income" ? current + t.amount : current - t.amount);
    }
    return accounts.map((a) => ({
      ...a,
      balance: a.initialBalance + (balanceByAccount.get(a.name) ?? 0),
    }));
  }, [accounts, transactions]);

  const totalBalance = useMemo(() => {
    if (selectedAccount === "all") return accountsWithBalance.reduce((s, a) => s + a.balance, 0);
    return accountsWithBalance.find((a) => a.name === selectedAccount)?.balance ?? 0;
  }, [accountsWithBalance, selectedAccount]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const expenseByCategory = new Map<string, number>();
    for (const t of filtered.filter((t) => t.type === "expense")) {
      expenseByCategory.set(t.category, (expenseByCategory.get(t.category) ?? 0) + t.amount);
    }
    const maxExpense = Math.max(...Array.from(expenseByCategory.values()), 1);
    return Array.from(expenseByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => {
        const cat = categories.find((c) => c.name === name);
        return { name, amount, color: cat?.color ?? "#71717a", percentage: (amount / maxExpense) * 100 };
      });
  }, [filtered, categories]);

  // Chart data (filtered transactions)
  const initialBalanceForChart = useMemo(() => {
    if (selectedAccount === "all") return accounts.reduce((s, a) => s + a.initialBalance, 0);
    return accounts.find((a) => a.name === selectedAccount)?.initialBalance ?? 0;
  }, [accounts, selectedAccount]);

  // For the chart, we need to compute the running balance UP TO the filter start,
  // then show the evolution within the filtered range
  const chartData = useMemo(() => {
    const relevantTxs = selectedAccount === "all"
      ? transactions
      : transactions.filter((t) => t.account === selectedAccount);

    const beforeRange = relevantTxs.filter((t) => new Date(t.date) < from);
    const balanceBefore = beforeRange.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), initialBalanceForChart);

    return getBalanceOverTime(filtered, balanceBefore, from, to);
  }, [transactions, filtered, from, selectedAccount, initialBalanceForChart]);

  const recentTransactions = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);
  }, [filtered]);

  const displayedAccounts = selectedAccount === "all"
    ? accountsWithBalance
    : accountsWithBalance.filter((a) => a.name === selectedAccount);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        {/* Filters row */}
        <div className="flex items-center gap-3">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[180px] h-8 text-xs rounded-sm">
              <SelectValue placeholder="Cuenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las cuentas</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-sm p-0.5">
            {presets.filter(p => p.value !== "custom").map((p) => (
              <button
                key={p.value}
                onClick={() => setRangePreset(p.value)}
                className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${
                  rangePreset === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={rangePreset === "custom" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs rounded-sm gap-1.5"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {rangePreset === "custom" && customRange?.from
                  ? `${format(customRange.from, "d MMM", { locale: es })} - ${customRange.to ? format(customRange.to, "d MMM", { locale: es }) : "..."}`
                  : "Rango"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(range) => {
                  setCustomRange(range);
                  setRangePreset("custom");
                }}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          <CreateTransactionDialog accounts={accounts} categories={categories} />
        </div>

        <BalanceCards totalBalance={totalBalance} totalIncome={totalIncome} totalExpense={totalExpense} />

        <div className="flex gap-4">
          <BalanceChart data={chartData} />
          <CategoryBreakdown categories={categoryBreakdown} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <RecentTransactions transactions={recentTransactions} />
          <AccountsSummary accounts={displayedAccounts} />
        </div>
      </div>
    </ScrollArea>
  );
}
