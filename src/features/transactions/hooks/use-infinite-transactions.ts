"use client";

import { useCallback, useRef, useState } from "react";
import type { Transaction } from "../types/transaction";

interface PageData {
  transactions: Transaction[];
  nextCursor: string | null;
  total: number;
}

interface UseInfiniteTransactionsOptions {
  initialData: Transaction[];
  initialCursor: string | null;
  initialTotal: number;
  pageSize?: number;
}

export function useInfiniteTransactions({
  initialData,
  initialCursor,
  initialTotal,
  pageSize = 50,
}: UseInfiniteTransactionsOptions) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialData);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [total, setTotal] = useState(initialTotal);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const fetchingRef = useRef(false);

  const hasMore = nextCursor !== null;

  const fetchMore = useCallback(async () => {
    if (!nextCursor || fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetchingMore(true);

    try {
      const res = await fetch(
        `/api/transactions?cursor=${nextCursor}&limit=${pageSize}`
      );
      const data: PageData = await res.json();

      setTransactions((prev) => [...prev, ...data.transactions]);
      setNextCursor(data.nextCursor);
      setTotal(data.total);
    } finally {
      setIsFetchingMore(false);
      fetchingRef.current = false;
    }
  }, [nextCursor, pageSize]);

  const addOptimistic = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    setTotal((prev) => prev + 1);
  }, []);

  const removeOptimistic = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions((prev) => prev.filter((t) => !idSet.has(t.id)));
    setTotal((prev) => prev - ids.length);
  }, []);

  return {
    transactions,
    hasMore,
    isFetchingMore,
    total,
    fetchMore,
    addOptimistic,
    removeOptimistic,
  };
}
