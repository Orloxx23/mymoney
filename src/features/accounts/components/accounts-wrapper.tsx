"use client";

import { Account } from "../services/account-service";
import { AccountsList } from "./accounts-list";
import { CreateAccountDialog } from "./create-account-dialog";

export type AccountWithBalance = Account & { balance: number };

interface AccountsWrapperProps {
  initialAccounts: AccountWithBalance[];
  onRefresh: () => void;
}

export function AccountsWrapper({
  initialAccounts,
  onRefresh,
}: AccountsWrapperProps) {

  function handleSuccess() {
    onRefresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <CreateAccountDialog onSuccess={handleSuccess} />
      </div>
      <AccountsList accounts={initialAccounts} />
    </div>
  );
}
