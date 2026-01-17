import { NextResponse } from "next/server";
import { getGoogleSheetsClient, getOrCreateSpreadsheet } from "@/lib/google-sheets";

const DEFAULT_CATEGORIES = [
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
];

export async function POST() {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Categorías!A2:E25",
      valueInputOption: "RAW",
      requestBody: {
        values: DEFAULT_CATEGORIES,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Categorías creadas exitosamente",
      count: DEFAULT_CATEGORIES.length 
    });
  } catch (error) {
    console.error("Error seeding categories:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear categorías" },
      { status: 500 }
    );
  }
}
