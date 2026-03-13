import { getAccounts } from "@/features/accounts/services/account-service";
import { getCategories } from "@/features/categories/services/category-service";
import { TransactionsWrapper } from "@/features/transactions/components/transactions-wrapper";
import { getTransactionsPaginated } from "@/features/transactions/services/transaction-service";
import { revalidatePath } from "next/cache";

async function refresh() {
  "use server";
  revalidatePath("/transactions", "page");
}

export default async function TransactionsPage() {
  const [{ transactions, nextCursor, total }, accounts, categories] =
    await Promise.all([
      getTransactionsPaginated({ limit: 50 }),
      getAccounts(),
      getCategories(),
    ]);

  return (
    <div className="flex max-h-screen flex-col">
      <div className="p-4">
        <TransactionsWrapper
          initialTransactions={transactions}
          initialCursor={nextCursor}
          initialTotal={total}
          accounts={accounts}
          categories={categories}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
