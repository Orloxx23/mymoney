"use client";

import { useFinancialTicker } from "../hooks/use-financial-ticker";
import { FinancialTicker } from "./financial-ticker";

export function FinancialTickerWrapper() {
  const { data, loading } = useFinancialTicker();

  if (loading || data.length === 0) {
    return (
      <div className="border-b relative w-full overflow-hidden bg-card text-card-foreground h-10">
        <div className="flex animate-[ticker_60s_linear_infinite] absolute left-0 h-full items-center">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-2 px-8 border-r whitespace-nowrap"
            >
              <div className="w-6 h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b">
      <FinancialTicker items={data} />
    </div>
  );
}
