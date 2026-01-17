import { getTransactions, createTransaction } from "@/features/transactions/services/transaction-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
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
