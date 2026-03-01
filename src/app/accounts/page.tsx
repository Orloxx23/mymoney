import { getAccounts } from "@/features/accounts/services/account-service";
import { getTransactions } from "@/features/transactions/services/transaction-service";
import { AccountsWrapper } from "@/features/accounts/components/accounts-wrapper";
import { revalidatePath } from "next/cache";

async function refresh() {
  "use server";
  revalidatePath("/accounts", "page");
}

export default async function AccountsPage() {
  const [accounts, transactions] = await Promise.all([
    getAccounts(),
    getTransactions(),
  ]);

  const balanceByAccount = new Map<string, number>();
  for (const t of transactions) {
    const current = balanceByAccount.get(t.account) ?? 0;
    balanceByAccount.set(
      t.account,
      t.type === "income" ? current + t.amount : current - t.amount
    );
  }

  const accountsWithBalance = accounts.map((a) => ({
    ...a,
    balance: a.initialBalance + (balanceByAccount.get(a.name) ?? 0),
  }));

  return (
    <div className="flex max-h-screen flex-col">
      <div className="p-4">
        <AccountsWrapper
          initialAccounts={accountsWithBalance}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
