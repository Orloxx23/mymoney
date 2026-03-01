import { FinancialTickerWrapper } from "@/features/stocks/components/financial-ticker-wrapper";
import { auth } from "@/lib/auth";
import { FlipClock } from "@/ui/flip-clock";
import { getAccounts } from "@/features/accounts/services/account-service";
import { getTransactions } from "@/features/transactions/services/transaction-service";
import { getCategories } from "@/features/categories/services/category-service";
import { DashboardClient } from "@/features/dashboard/components/dashboard-client";

export default async function Home() {
  const session = await auth();

  let accounts: Awaited<ReturnType<typeof getAccounts>> = [];
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];

  try {
    [accounts, transactions, categories] = await Promise.all([
      getAccounts(),
      getTransactions(),
      getCategories(),
    ]);
  } catch {
    // User might not have data yet
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b flex">
        <div className="flex flex-col flex-1 p-4">
          <span className="text-3xl font-bold">
            Bienvenido, {session?.user?.name}
          </span>
          <span className="text-muted-foreground">
            No ahorres lo que queda después de gastar, sino gasta lo que queda después de ahorrar
          </span>
        </div>
        <div className="flex items-center justify-center flex-col p-4 border-l overflow-hidden relative">
          <FlipClock size="sm" variant="secondary" suppressHydrationWarning />
        </div>
      </div>

      <FinancialTickerWrapper />

      <DashboardClient
        accounts={accounts}
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
}
