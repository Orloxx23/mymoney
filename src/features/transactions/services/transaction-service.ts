import { getGoogleSheetsClient, getGoogleSheetsClientWithToken, getOrCreateSpreadsheet } from "@/lib/google-sheets";
import { unstable_cache } from "next/cache";
import { Transaction } from "../types/transaction";

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
      description: description || "Sin descripción",
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
        newTransaction.description,
        newTransaction.date.toISOString(),
        newTransaction.account,
      ]],
    },
  });

  return newTransaction;
}

export async function deleteTransactions(ids: string[]): Promise<void> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = await getOrCreateSpreadsheet();

  const { data: sheetData } = await sheets.spreadsheets.get({
    spreadsheetId,
    ranges: ["Transacciones"],
    fields: "sheets(properties(sheetId,title))",
  });

  const transactionsSheet = sheetData.sheets?.find(
    (s) => s.properties?.title === "Transacciones"
  );
  const sheetId = transactionsSheet?.properties?.sheetId;

  if (sheetId === undefined) throw new Error("Sheet not found");

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Transacciones!A2:G",
  });

  if (!data.values) return;

  const rowsToDelete = data.values
    .map((row, index) => ({ id: row[0], rowIndex: index + 2 }))
    .filter(row => ids.includes(row.id))
    .sort((a, b) => b.rowIndex - a.rowIndex);

  for (const { rowIndex } of rowsToDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        }],
      },
    });
  }
}
