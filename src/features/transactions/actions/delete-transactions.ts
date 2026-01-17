"use server";

import { revalidatePath } from "next/cache";
import { deleteTransactions } from "../services/transaction-service";

export async function deleteTransactionsAction(ids: string[]) {
  await deleteTransactions(ids);
  revalidatePath("/", "page");
}
