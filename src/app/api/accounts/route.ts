import { getAccounts, createAccount } from "@/features/accounts/services/account-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accounts = await getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = await createAccount(body);
    return NextResponse.json(account);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
