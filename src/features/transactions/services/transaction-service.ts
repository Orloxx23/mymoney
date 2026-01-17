import { getGoogleSheetsClient, getGoogleSheetsClientWithToken, getOrCreateSpreadsheet } from "@/lib/google-sheets";
import { unstable_cache } from "next/cache";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description?: string;
  date: Date;
  account: string;
}

const getCachedTransactions = unstable_cache(
  async (accessToken: string, refreshToken: string | undefined, spreadsheetId: string): Promise<Transaction[]> => {
    const sheets = getGoogleSheetsClientWithToken(accessToken, refreshToken);

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Transacciones!A2:G",
  });

  if (!data.values) return [];

    return data.values.map(([id, type, amount, category, description, date, account]) => ({
      id,
      type: type as Transaction["type"],
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date),
      account,
    }));
  },
  ["transactions"],
  { revalidate: 30, tags: ["transactions"] }
);

export async function getTransactions(): Promise<Transaction[]> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  
  const spreadsheetId = await getOrCreateSpreadsheet();
  return getCachedTransactions(session.accessToken, session.refreshToken, spreadsheetId);
}

export async function createTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = await getOrCreateSpreadsheet();

  const id = crypto.randomUUID();
  const newTransaction = { id, ...transaction };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Transacciones!A:G",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        newTransaction.id,
        newTransaction.type,
        newTransaction.amount,
        newTransaction.category,
        newTransaction.description || "",
        newTransaction.date.toISOString(),
        newTransaction.account,
      ]],
    },
  });

  return newTransaction;
}
