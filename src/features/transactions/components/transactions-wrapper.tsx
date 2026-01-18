"use client";

import { Transaction } from "@/features/transactions/types/transaction";
import { TransactionsDataTable } from "@/features/transactions/components/transactions-data-table";
import { CreateTransactionDialog } from "@/features/transactions/components/create-transaction-dialog";
import { useOptimistic, startTransition } from "react";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";

interface TransactionsWrapperProps {
  initialTransactions: Transaction[];
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{
    id: string;
    name: string;
    type: string;
    parentId?: string;
  }>;
  onRefresh: () => void;
}

type OptimisticAction =
  | { type: "add"; transaction: Transaction }
  | { type: "delete"; ids: string[] };

export function TransactionsWrapper({
  initialTransactions,
  accounts,
  categories,
  onRefresh,
}: TransactionsWrapperProps) {
  const [optimisticTransactions, updateOptimistic] = useOptimistic(
    initialTransactions,
    (state, action: OptimisticAction) => {
      if (action.type === "add") {
        return [action.transaction, ...state];
      }
      return state.filter((t) => !action.ids.includes(t.id));
    },
  );

  function handleCreateTransaction(transaction: Transaction) {
    startTransition(() => {
      updateOptimistic({ type: "add", transaction });
    });
  }

  function handleDeleteTransactions(ids: string[]) {
    startTransition(() => {
      updateOptimistic({ type: "delete", ids });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacciones</h1>
        <div className="flex gap-2">
          <CreateAccountDialog onSuccess={onRefresh} />
          <CreateTransactionDialog
            accounts={accounts}
            categories={categories}
            onOptimisticCreate={handleCreateTransaction}
          />
        </div>
      </div>
      <TransactionsDataTable
        transactions={optimisticTransactions}
        onDeleteTransactions={handleDeleteTransactions}
      />
    </div>
  );
}
