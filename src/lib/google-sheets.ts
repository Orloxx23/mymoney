import { google } from "googleapis";
import { auth } from "./auth";
import { unstable_cache } from "next/cache";

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
  const oauth2Client = createOAuth2Client(accessToken, refreshToken);
  const drive = google.drive({ version: "v3", auth: oauth2Client });
  const FOLDER_NAME = "MyMoney";

  // Buscar carpeta principal
  const { data } = await drive.files.list({
    q: `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  let folderId: string;

  if (data.files && data.files.length > 0) {
    folderId = data.files[0].id!;
  } else {
    // Crear carpeta principal
    const folder = await drive.files.create({
      requestBody: {
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });
    folderId = folder.data.id!;

    // Crear subcarpeta storage
    await drive.files.create({
      requestBody: {
        name: "storage",
        mimeType: "application/vnd.google-apps.folder",
        parents: [folderId],
      },
    });
  }

  return folderId;
}

const getCachedSpreadsheetId = unstable_cache(
  async (accessToken: string, refreshToken: string | undefined): Promise<string> => {
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
        ],
        valueInputOption: "RAW",
      },
    });

    return spreadsheetId;
  },
  ["spreadsheet-id"],
  { revalidate: 3600, tags: ["spreadsheet"] }
);

export async function getOrCreateSpreadsheet(): Promise<string> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("No access token");
  return getCachedSpreadsheetId(session.accessToken, session.refreshToken);
}
