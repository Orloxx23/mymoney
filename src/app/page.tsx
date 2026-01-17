import { TransactionsDataTable } from "@/features/transactions";
import { auth } from "@/lib/auth";
import { getTransactions } from "@/features/transactions/services/transaction-service";
import { getAccounts } from "@/features/accounts/services/account-service";
import { getCategories } from "@/features/categories/services/category-service";
import { CreateTransactionDialog } from "@/features/transactions/components/create-transaction-dialog";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { revalidatePath } from "next/cache";

async function refresh() {
  "use server";
  revalidatePath("/", "page");
}

export default async function Home() {
  const session = await auth();
  const [transactions, accounts, categories] = await Promise.all([
    getTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  return (
    <div className="flex max-h-screen flex-col gap-4 p-8">
      <div className="flex flex-col max-w-xl">
        <span className="text-3xl font-bold">
          Bienvenido, {session?.user?.name}
        </span>
        <span className="text-muted-foreground">
          No ahorres lo que queda después de gastar, sino gasta lo que queda
          después de ahorrar
        </span>
      </div>

      <div className="flex gap-2">
        <CreateTransactionDialog accounts={accounts} categories={categories} onSuccess={refresh} />
        <CreateAccountDialog onSuccess={refresh} />
        <CreateCategoryDialog categories={categories} onSuccess={refresh} />
      </div>

      <TransactionsDataTable transactions={transactions} />
    </div>
  );
}
