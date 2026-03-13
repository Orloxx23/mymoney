"use client";

import type { AccountWithBalance } from "./accounts-wrapper";
import { Badge } from "@/ui/badge";
import { Wallet, Landmark, CreditCard } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/ui/empty";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  AccountWithBalance["type"],
  { label: string; icon: React.ReactNode }
> = {
  bank: { label: "Banco", icon: <Landmark className="h-5 w-5" /> },
  cash: { label: "Efectivo", icon: <Wallet className="h-5 w-5" /> },
  credit: {
    label: "Tarjeta de Crédito",
    icon: <CreditCard className="h-5 w-5" />,
  },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

interface AccountsListProps {
  accounts: AccountWithBalance[];
}

export function AccountsList({ accounts }: AccountsListProps) {
  if (accounts.length === 0) {
    return (
      <Empty className="mt-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>Sin cuentas</EmptyTitle>
          <EmptyDescription>
            Crea tu primera cuenta para empezar a registrar tus movimientos.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const config = typeConfig[account.type];
        return (
          <div
            key={account.id}
            className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{account.name}</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                {config.label}
              </Badge>
            </div>
            <span
              className={cn(
                "text-sm font-semibold tabular-nums",
                account.balance >= 0
                  ? "text-emerald-500"
                  : "text-red-500"
              )}
            >
              {formatCurrency(account.balance)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
