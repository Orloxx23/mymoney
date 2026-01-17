"use client";

import { Transaction } from "@/features/transactions/types/transaction";
import { TransactionsDataTable } from "@/features/transactions/components/transactions-data-table";
import { CreateTransactionDialog } from "@/features/transactions/components/create-transaction-dialog";
import { useOptimistic, startTransition } from "react";

interface TransactionsWrapperProps {
  initialTransactions: Transaction[];
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: string; parentId?: string }>;
  onRefresh: () => void;
}

export function TransactionsWrapper({ 
  initialTransactions, 
  accounts, 
  categories,
  onRefresh 
}: TransactionsWrapperProps) {
  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic(
    initialTransactions,
    (state, newTransaction: Transaction) => [newTransaction, ...state]
  );

  function handleCreateTransaction(transaction: Transaction) {
    startTransition(() => {
      addOptimisticTransaction(transaction);
      onRefresh();
    });
  }

  return (
    <>
      <CreateTransactionDialog
        accounts={accounts}
        categories={categories}
        onSuccess={onRefresh}
        onOptimisticCreate={handleCreateTransaction}
      />
      <TransactionsDataTable transactions={optimisticTransactions} />
    </>
  );
}
