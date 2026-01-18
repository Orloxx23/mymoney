import { FinancialTickerWrapper } from "@/features/stocks/components/financial-ticker-wrapper";
import { auth } from "@/lib/auth";
import { FlipClock } from "@/ui/flip-clock";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex max-h-screen flex-col">
      <div className="border-b flex">
        <div className="flex flex-col flex-1 p-4">
          <span className="text-3xl font-bold">
            Bienvenido, {session?.user?.name}
          </span>
          <span className="text-muted-foreground">
            No ahorres lo que queda después de gastar, sino gasta lo que queda
            después de ahorrar
          </span>
        </div>
        <div className="flex items-center justify-center flex-col p-4 border-l overflow-hidden relative">
          <FlipClock size="sm" variant="secondary" suppressHydrationWarning />
        </div>
      </div>

      <FinancialTickerWrapper />

      {/* <div className="flex gap-2">
        <CreateAccountDialog onSuccess={refresh} />
        <CreateCategoryDialog categories={categories} onSuccess={refresh} />
        <SeedCategoriesButton onSuccess={refresh} />
      </div> */}
    </div>
  );
}
