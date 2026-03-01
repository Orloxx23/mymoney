"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/ui/chart";
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";

interface BalanceChartProps {
  data: { date: string; saldo: number }[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  const trend = useMemo(() => {
    if (data.length < 2) return "positive";
    const first = data[0].saldo;
    const last = data[data.length - 1].saldo;
    if (last < first) return "negative";
    return "positive"; // equal or up = green
  }, [data]);

  const strokeColor = trend === "positive" ? "#10b981" : "#ef4444";

  const chartConfig = {
    saldo: { label: "Saldo", color: strokeColor },
  } satisfies ChartConfig;

  return (
    <Card className="flex-1 rounded-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Evolución del saldo</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
            <YAxis hide />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `$${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="saldo"
              stroke={strokeColor}
              strokeWidth={2}
              fill="url(#saldoGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
