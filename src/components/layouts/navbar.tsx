import { Jersey_10 } from "next/font/google";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import { NavItems } from "./nav-items";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Separator } from "@/ui/separator";

const jersey10 = Jersey_10({
  subsets: ["latin"],
  weight: ["400"],
});

export default async function Navbar() {
  const session = await auth();

  return (
    <div className="border-r flex flex-col w-64">
      <div className="flex flex-col p-4 gap-4">
        <Link href="/">
          <div
            className={`${jersey10.className} bg-primary text-4xl rounded p-2 flex justify-center items-center text-white`}
          >
            MyMoney
          </div>
        </Link>

        <NavItems />
      </div>

      <div className="flex-1"></div>

      <Separator />

      {session?.user && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex flex-col gap-3 cursor-pointer p-4">
              <div className="flex items-center gap-3 px-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-10 h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm  font-medium truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right">
            <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full text-left flex items-center gap-2"
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
