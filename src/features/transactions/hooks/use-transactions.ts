"use client";

import { useState } from "react";
import type { Transaction } from "../services/transaction-service";

export function useTransactions(initialTransactions: Transaction[]) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);

  async function addTransaction(transaction: Omit<Transaction, "id">) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      const newTransaction = await response.json();
      setTransactions([...transactions, newTransaction]);
      return newTransaction;
    } finally {
      setIsLoading(false);
    }
  }

  return { transactions, addTransaction, isLoading };
}
