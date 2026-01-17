import { Transaction } from "../types/transaction";

export function groupTransactionsByDate(transactions: Transaction[]) {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((transaction) => {
    const dateKey = new Date(transaction.date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(transaction);
  });

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    transactions: items,
    total: items.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0),
  }));
}
