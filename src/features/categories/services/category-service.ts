import { getGoogleSheetsClient, getGoogleSheetsClientWithToken, getOrCreateSpreadsheet } from "@/lib/google-sheets";
import { unstable_cache } from "next/cache";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  parentId?: string;
}

const getCachedCategories = unstable_cache(
  async (accessToken: string, refreshToken: string | undefined, spreadsheetId: string): Promise<Category[]> => {
    const sheets = getGoogleSheetsClientWithToken(accessToken, refreshToken);

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Categorías!A2:E",
  });

  if (!data.values) return [];

    return data.values.map(([id, name, type, color, parentId]) => ({
      id,
      name,
      type: type as Category["type"],
      color,
      parentId: parentId || undefined,
    }));
  },
  ["categories"],
  { revalidate: 60, tags: ["categories"] }
);

export async function getCategories(): Promise<Category[]> {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  
  const spreadsheetId = await getOrCreateSpreadsheet();
  return getCachedCategories(session.accessToken, session.refreshToken, spreadsheetId);
}

export async function createCategory(category: Omit<Category, "id">): Promise<Category> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = await getOrCreateSpreadsheet();

  const id = crypto.randomUUID();
  const newCategory = { id, ...category };

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Categorías!A:E",
    valueInputOption: "RAW",
    requestBody: {
      values: [[newCategory.id, newCategory.name, newCategory.type, newCategory.color, newCategory.parentId || ""]],
    },
  });

  return newCategory;
}
