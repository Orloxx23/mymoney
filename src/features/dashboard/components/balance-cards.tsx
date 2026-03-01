"use client";

import { Card, CardContent } from "@/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BalanceCards({ totalBalance, totalIncome, totalExpense }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="rounded-sm">
        <CardContent className="flex items-center gap-4 py-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Saldo general</p>
            <p className={cn("text-lg font-bold tabular-nums", totalBalance >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCOP(totalBalance)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardContent className="flex items-center gap-4 py-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Ingresos del periodo</p>
            <p className="text-lg font-bold tabular-nums text-emerald-500">
              {formatCOP(totalIncome)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm">
        <CardContent className="flex items-center gap-4 py-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-red-500/10">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Gastos del periodo</p>
            <p className="text-lg font-bold tabular-nums text-red-500">
              {formatCOP(totalExpense)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
