/* eslint-disable @next/next/no-img-element */
"use client";

import { cn } from "@/lib/utils";

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  flag: string;
}

interface FinancialTickerProps {
  items: TickerItem[];
  className?: string;
}

export function FinancialTicker({ items, className }: FinancialTickerProps) {
  const duplicatedItems = [...items, ...items];

  const getIconSrc = (flag: string, name: string) => {
    if (name.includes("Oro"))
      return "https://api.iconify.design/twemoji/coin.svg";
    if (name.includes("Plata"))
      return "https://api.iconify.design/twemoji/optical-disk.svg";
    if (name.includes("Petróleo"))
      return "https://api.iconify.design/twemoji/oil-drum.svg";
    if (name.includes("Bitcoin"))
      return "https://api.iconify.design/logos/bitcoin.svg";
    if (name.includes("Ethereum"))
      return "https://api.iconify.design/cryptocurrency-color/eth.svg";
    return null;
  };

  const isCountryFlag = (flag: string) => /^[a-z]{2}$/i.test(flag);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-card text-card-foreground h-10 group",
        className,
      )}
    >
      <div className="flex animate-[ticker_60s_linear_infinite] absolute left-0 h-full items-center group-hover:[animation-play-state:paused]">
        {duplicatedItems.map((item, index) => {
          const iconSrc = getIconSrc(item.flag, item.name);

          return (
            <div
              key={`${item.symbol}-${index}`}
              className="flex items-center justify-center gap-2 px-8 border-r whitespace-nowrap "
            >
              {isCountryFlag(item.flag) ? (
                <img
                  src={`https://flagcdn.com/h40/${item.flag}.png`}
                  srcSet={`https://flagcdn.com/h80/${item.flag}.png 2x`}
                  alt={item.name}
                  className="w-6 h-4 object-cover rounded"
                />
              ) : iconSrc ? (
                <img src={iconSrc} alt={item.name} className="w-5 h-5" />
              ) : (
                <span className="text-lg">{item.flag}</span>
              )}
              <span className="text-sm text-zinc-400">1 {item.name} =</span>
              <span className="font-semibold text-sm">
                $
                {item.price.toLocaleString("es-CO", {
                  maximumFractionDigits: 2,
                })}{" "}
                COP
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  item.change >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {item.change >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(item.changePercent).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
