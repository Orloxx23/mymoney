import { NextResponse } from "next/server";

interface CurrencyData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  flag: string;
}

// Symbols to fetch - these will be converted to COP
const SYMBOLS = [
  {
    symbol: "USDCOP=X",
    name: "Dólar Estadounidense",
    flag: "us",
    direct: true,
  },
  { symbol: "EURCOP=X", name: "Euro", flag: "eu", direct: true },
  { symbol: "GBPCOP=X", name: "Libra Esterlina", flag: "gb", direct: true },
  { symbol: "JPYUSD=X", name: "Yen Japonés", flag: "jp", inverse: true },
  { symbol: "CNYUSD=X", name: "Yuan Chino", flag: "cn", inverse: true },
  { symbol: "CADUSD=X", name: "Dólar Canadiense", flag: "ca", inverse: true },
  { symbol: "AUDUSD=X", name: "Dólar Australiano", flag: "au", inverse: true },
  { symbol: "CHFCOP=X", name: "Franco Suizo", flag: "ch", direct: true },
  { symbol: "MXNUSD=X", name: "Peso Mexicano", flag: "mx", inverse: true },
  { symbol: "ARSUSD=X", name: "Peso Argentino", flag: "ar", inverse: true },
  { symbol: "BRLCOP=X", name: "Real Brasileño", flag: "br", direct: true },
  { symbol: "CLPUSD=X", name: "Peso Chileno", flag: "cl", inverse: true },
  { symbol: "PENUSD=X", name: "Sol Peruano", flag: "pe", inverse: true },
  { symbol: "UYUUSD=X", name: "Peso Uruguayo", flag: "uy", inverse: true },
  { symbol: "GC=F", name: "Oro (1 onza)", flag: "🥇", commodity: true },
  { symbol: "SI=F", name: "Plata (1 onza)", flag: "🥈", commodity: true },
  {
    symbol: "CL=F",
    name: "Petróleo WTI (barril)",
    flag: "🛢️",
    commodity: true,
  },
  { symbol: "BTC-USD", name: "Bitcoin", flag: "₿", commodity: true },
  { symbol: "ETH-USD", name: "Ethereum", flag: "⟠", commodity: true },
];

async function fetchPrice(
  symbol: string,
): Promise<{ price: number; previousClose: number } | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    return {
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose || meta.previousClose,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // First get USD to COP rate for converting commodities
    const usdCopData = await fetchPrice("USDCOP=X");
    const usdToCop = usdCopData?.price || 4200; // fallback rate

    const currencyPromises = SYMBOLS.map(
      async ({ symbol, name, flag, direct, commodity, inverse }) => {
        try {
          const priceData = await fetchPrice(symbol);
          if (!priceData) return null;

          let priceInCop: number;
          let previousCloseInCop: number;

          if (direct) {
            priceInCop = priceData.price;
            previousCloseInCop = priceData.previousClose;
          } else if (inverse) {
            // Currency to USD - convert to COP (1 MXN = X USD * Y COP/USD)
            priceInCop = priceData.price * usdToCop;
            previousCloseInCop = priceData.previousClose * usdToCop;
          } else if (commodity) {
            priceInCop = priceData.price * usdToCop;
            previousCloseInCop = priceData.previousClose * usdToCop;
          } else {
            priceInCop = priceData.price;
            previousCloseInCop = priceData.previousClose;
          }

          const change = priceInCop - previousCloseInCop;
          const changePercent = (change / previousCloseInCop) * 100;

          return {
            symbol,
            name,
            price: priceInCop,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            flag,
          };
        } catch {
          return null;
        }
      },
    );

    const results = await Promise.all(currencyPromises);
    const currencies = results.filter((c): c is CurrencyData => c !== null);

    return NextResponse.json({
      currencies,
      lastUpdated: new Date().toISOString(),
      baseCurrency: "COP",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch currency data" },
      { status: 500 },
    );
  }
}
