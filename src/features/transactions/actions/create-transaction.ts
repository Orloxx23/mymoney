"use server";

import { revalidatePath } from "next/cache";
import { createTransaction } from "../services/transaction-service";

export async function createTransactionAction(data: {
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: string;
  account: string;
}) {
  await createTransaction({
    ...data,
    date: new Date(data.date),
  });
  revalidatePath("/transactions", "page");
}
