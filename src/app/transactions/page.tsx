import { getAccounts } from "@/features/accounts/services/account-service";
import { getCategories } from "@/features/categories/services/category-service";
import { TransactionsWrapper } from "@/features/transactions/components/transactions-wrapper";
import { getTransactions } from "@/features/transactions/services/transaction-service";
import { revalidatePath } from "next/cache";

async function refresh() {
  "use server";
  revalidatePath("/transactions", "page");
}

export default async function TransactionsPage() {
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(),
    getAccounts(),
    getCategories(),
  ]);
  
  return (
    <div className="flex max-h-screen flex-col">
      <div className="p-4">
        <TransactionsWrapper
          initialTransactions={transactions}
          accounts={accounts}
          categories={categories}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
