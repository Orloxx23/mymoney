"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownUp, House, Tag, Wallet } from "lucide-react";

const navItems = [
  { label: "Inicio", href: "/", icon: <House size={16} /> },
  {
    label: "Transacciones",
    href: "/transactions",
    icon: <ArrowDownUp size={16} />,
  },
  { label: "Cuentas", href: "/accounts", icon: <Wallet size={16} /> },
  { label: "Categorias", href: "/categories", icon: <Tag size={16} /> },
];

export function NavItems() {
  const pathname = usePathname();

  return (
    <nav>
      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={index}
            href={item.href}
            className={`py-2 px-4 rounded hover:bg-primary/10 flex items-center text-sm font-medium ${
              isActive
                ? "bg-primary/10 text-foreground"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
