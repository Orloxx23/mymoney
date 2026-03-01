"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

interface RecentTransaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
  account: string;
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">Últimos movimientos</CardTitle>
        <Link href="/transactions" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Ver todos →
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin movimientos recientes</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  t.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                  {t.type === "income" ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{t.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(t.date), "d MMM", { locale: es })}
                    </span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {t.account}
                    </Badge>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-medium tabular-nums",
                  t.type === "income" ? "text-emerald-500" : "text-red-500"
                )}>
                  {t.type === "income" ? "+" : "-"}{formatCOP(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
