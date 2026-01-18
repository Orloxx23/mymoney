import { google } from "googleapis";
import { auth } from "./auth";
import { unstable_cache } from "next/cache";

let folderPromise: Promise<string> | null = null;
let spreadsheetPromise: Promise<string> | null = null;

function createOAuth2Client(accessToken: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ 
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return oauth2Client;
}

export async function getGoogleSheetsClient() {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  const oauth2Client = createOAuth2Client(session.accessToken, session.refreshToken);
  return google.sheets({ version: "v4", auth: oauth2Client });
}

export function getGoogleSheetsClientWithToken(accessToken: string, refreshToken?: string) {
  const oauth2Client = createOAuth2Client(accessToken, refreshToken);
  return google.sheets({ version: "v4", auth: oauth2Client });
}

async function getOrCreateFolderInternal(accessToken: string, refreshToken?: string) {
  if (folderPromise) return folderPromise;

  folderPromise = (async () => {
    const oauth2Client = createOAuth2Client(accessToken, refreshToken);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const FOLDER_NAME = "MyMoney";

    const { data } = await drive.files.list({
      q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'me' in owners`,
      fields: "files(id, name, createdTime)",
      orderBy: "createdTime",
      pageSize: 1,
    });

    if (data.files && data.files.length > 0) {
      return data.files[0].id!;
    }

    const folder = await drive.files.create({
      requestBody: {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    const folderId = folder.data.id!;

    await drive.files.create({
      requestBody: {
        name: "storage",
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      },
    });

    return folderId;
  })();

  return folderPromise;
}

async function getOrCreateSpreadsheetInternal(accessToken: string, refreshToken: string | undefined): Promise<string> {
  if (spreadsheetPromise) return spreadsheetPromise;

  spreadsheetPromise = (async () => {
    const oauth2Client = createOAuth2Client(accessToken, refreshToken);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const folderId = await getOrCreateFolderInternal(accessToken, refreshToken);
    const SPREADSHEET_NAME = "MyMoney - Finanzas Personales";

    const { data } = await drive.files.list({
      q: `name='${SPREADSHEET_NAME}' and '${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      fields: "files(id, name)",
    });

    if (data.files && data.files.length > 0) {
      return data.files[0].id!;
    }

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: SPREADSHEET_NAME },
        sheets: [
          { properties: { title: "Cuentas" } },
          { properties: { title: "Categorías" } },
          { properties: { title: "Transacciones" } },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;

    await drive.files.update({
      fileId: spreadsheetId,
      addParents: folderId,
      fields: "id, parents",
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        data: [
          {
            range: "Cuentas!A1:C1",
            values: [["ID", "Nombre", "Tipo"]],
          },
          {
            range: "Categorías!A1:E1",
            values: [["ID", "Nombre", "Tipo", "Color", "Padre"]],
          },
          {
            range: "Transacciones!A1:G1",
            values: [["ID", "Tipo", "Monto", "Categoría", "Descripción", "Fecha", "Cuenta"]],
          },
          {
            range: "Categorías!A2:E25",
            values: [
              ["1", "Alimentación", "expense", "#ef4444", ""],
              ["2", "Supermercado", "expense", "#ef4444", "1"],
              ["3", "Restaurantes", "expense", "#ef4444", "1"],
              ["4", "Transporte", "expense", "#f97316", ""],
              ["5", "Combustible", "expense", "#f97316", "4"],
              ["6", "Transporte Público", "expense", "#f97316", "4"],
              ["7", "Vivienda", "expense", "#eab308", ""],
              ["8", "Alquiler", "expense", "#eab308", "7"],
              ["9", "Servicios", "expense", "#eab308", "7"],
              ["10", "Salud", "expense", "#22c55e", ""],
              ["11", "Entretenimiento", "expense", "#3b82f6", ""],
              ["12", "Educación", "expense", "#8b5cf6", ""],
              ["13", "Compras", "expense", "#ec4899", ""],
              ["14", "Ropa", "expense", "#ec4899", "13"],
              ["15", "Otros Gastos", "expense", "#64748b", ""],
              ["16", "Ingresos", "income", "#10b981", ""],
              ["17", "Salario", "income", "#10b981", "16"],
              ["18", "Freelance", "income", "#14b8a6", "16"],
              ["19", "Inversiones", "income", "#6366f1", ""],
              ["20", "Dividendos", "income", "#6366f1", "19"],
              ["21", "Intereses", "income", "#6366f1", "19"],
              ["22", "Ventas", "income", "#84cc16", ""],
              ["23", "Productos", "income", "#84cc16", "22"],
              ["24", "Otros Ingresos", "income", "#a3a3a3", ""],
            ],
          },
        ],
        valueInputOption: "RAW",
      },
    });

    return spreadsheetId;
  })();

  return spreadsheetPromise;
}

export async function getOrCreateSpreadsheet(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  return getOrCreateSpreadsheetInternal(session.accessToken, session.refreshToken);
}
