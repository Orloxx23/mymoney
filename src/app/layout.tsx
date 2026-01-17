import Navbar from "@/components/layouts/navbar";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Providers from "@/components/layouts/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Money",
  description: "Gestiona tus finanzas personales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-background`}>
        <Providers>
          {session ? (
            <div className="flex container mx-auto border-l border-r min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          ) : (
            <div className="flex container mx-auto border-l border-r min-h-screen">
              <main className="flex-1">{children}</main>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
