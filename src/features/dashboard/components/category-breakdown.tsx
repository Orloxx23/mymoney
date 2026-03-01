"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryItem[];
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <Card className="w-[320px] rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Gastos por categoría</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin gastos este mes</p>
        ) : (
          categories.slice(0, 6).map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || "var(--muted-foreground)" }}
                  />
                  <span className="truncate max-w-[140px]">{cat.name}</span>
                </div>
                <span className="tabular-nums text-muted-foreground">{formatCOP(cat.amount)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || "var(--muted-foreground)",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
