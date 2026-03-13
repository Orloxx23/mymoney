"use client";

import { Transaction } from "@/features/transactions/types/transaction";
import { TransactionsDataTable } from "@/features/transactions/components/transactions-data-table";
import { CreateTransactionDialog } from "@/features/transactions/components/create-transaction-dialog";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";
import { useInfiniteTransactions } from "@/features/transactions/hooks/use-infinite-transactions";

interface TransactionsWrapperProps {
  initialTransactions: Transaction[];
  initialCursor: string | null;
  initialTotal: number;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{
    id: string;
    name: string;
    type: string;
    parentId?: string;
  }>;
  onRefresh: () => void;
}

export function TransactionsWrapper({
  initialTransactions,
  initialCursor,
  initialTotal,
  accounts,
  categories,
  onRefresh,
}: TransactionsWrapperProps) {
  const {
    transactions,
    hasMore,
    isFetchingMore,
    total,
    fetchMore,
    addOptimistic,
    removeOptimistic,
  } = useInfiniteTransactions({
    initialData: initialTransactions,
    initialCursor,
    initialTotal,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold">Movimientos</h1>
        <div className="flex gap-2">
          <CreateAccountDialog onSuccess={onRefresh} />
          <CreateTransactionDialog
            accounts={accounts}
            categories={categories}
            onOptimisticCreate={addOptimistic}
          />
        </div>
      </div>
      <TransactionsDataTable
        transactions={transactions}
        onDeleteTransactions={removeOptimistic}
        hasMore={hasMore}
        isFetchingMore={isFetchingMore}
        onLoadMore={fetchMore}
        total={total}
      />
    </div>
  );
}
