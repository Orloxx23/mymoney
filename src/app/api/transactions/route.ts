import { getTransactions, createTransaction } from "@/features/transactions/services/transaction-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

    const allTransactions = await getTransactions();

    // Sort by date descending
    const sorted = allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = sorted.findIndex((t) => t.id === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const page = sorted.slice(startIndex, startIndex + limit);
    const nextCursor = page.length === limit ? page[page.length - 1].id : null;

    return NextResponse.json({
      transactions: page,
      nextCursor,
      total: sorted.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transaction = await createTransaction({
      ...body,
      date: new Date(body.date),
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
