import { TransactionsWrapper } from "@/features/transactions/components/transactions-wrapper";
import { auth } from "@/lib/auth";
import { getTransactions } from "@/features/transactions/services/transaction-service";
import { getAccounts } from "@/features/accounts/services/account-service";
import { getCategories } from "@/features/categories/services/category-service";
import { CreateAccountDialog } from "@/features/accounts/components/create-account-dialog";
import { CreateCategoryDialog } from "@/features/categories/components/create-category-dialog";
import { SeedCategoriesButton } from "@/features/categories/components/seed-categories-button";
import { revalidatePath } from "next/cache";
import { FlipClock } from "@/ui/flip-clock";

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
    <div className="flex max-h-screen flex-col">
      <div className=" border-b flex">
        <div className="flex flex-col flex-1 p-4">
          <span className="text-3xl font-bold">
            Bienvenido, {session?.user?.name}
          </span>
          <span className="text-muted-foreground">
            No ahorres lo que queda después de gastar, sino gasta lo que queda
            después de ahorrar
          </span>
        </div>
        <div className="flex flex-col p-4 border-l overflow-hidden relative">
          <FlipClock size="sm" variant="secondary"/>
        </div>
      </div>

      <div className="flex gap-2">
        <CreateAccountDialog onSuccess={refresh} />
        <CreateCategoryDialog categories={categories} onSuccess={refresh} />
        <SeedCategoriesButton onSuccess={refresh} />
      </div>

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
