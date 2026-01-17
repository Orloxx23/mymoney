import { getGoogleSheetsClient, getGoogleSheetsClientWithToken, getOrCreateSpreadsheet } from "@/lib/google-sheets";
import { unstable_cache } from "next/cache";

export interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "credit";
}

const getCachedAccounts = unstable_cache(
  async (accessToken: string, refreshToken: string | undefined, spreadsheetId: string): Promise<Account[]> => {
    const sheets = getGoogleSheetsClientWithToken(accessToken, refreshToken);

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Cuentas!A2:C",
  });

  if (!data.values) return [];

    return data.values.map(([id, name, type]) => ({
      id,
      name,
      type: type as Account["type"],
    }));
  },
  ["accounts"],
  { revalidate: 60, tags: ["accounts"] }
);

export async function getAccounts(): Promise<Account[]> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  
  const spreadsheetId = await getOrCreateSpreadsheet();
  return getCachedAccounts(session.accessToken, session.refreshToken, spreadsheetId);
}

export async function createAccount(account: Omit<Account, "id">): Promise<Account> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = await getOrCreateSpreadsheet();

  const id = crypto.randomUUID();
  const newAccount = { id, ...account };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Cuentas!A:C",
    valueInputOption: "RAW",
    requestBody: {
      values: [[newAccount.id, newAccount.name, newAccount.type]],
    },
  });

  return newAccount;
}
