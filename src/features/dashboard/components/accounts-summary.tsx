"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Wallet, Landmark, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AccountSummary {
  name: string;
  type: "bank" | "cash" | "credit";
  balance: number;
}

interface AccountsSummaryProps {
  accounts: AccountSummary[];
}

const typeIcons: Record<string, React.ReactNode> = {
  bank: <Landmark className="h-4 w-4" />,
  cash: <Wallet className="h-4 w-4" />,
  credit: <CreditCard className="h-4 w-4" />,
};

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm">Mis cuentas</CardTitle>
        <Link href="/accounts" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Ver todas →
        </Link>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin cuentas creadas</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div key={acc.name} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {typeIcons[acc.type]}
                </div>
                <span className="flex-1 text-sm truncate">{acc.name}</span>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  acc.balance >= 0 ? "text-emerald-500" : "text-red-500"
                )}>
                  {formatCOP(acc.balance)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
