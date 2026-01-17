"use client";

import { useState } from "react";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Textarea } from "@/ui/textarea";
import { Plus } from "lucide-react";

interface CreateTransactionDialogProps {
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; type: string; parentId?: string }>;
  onSuccess?: () => void;
}

export function CreateTransactionDialog({ accounts, categories, onSuccess }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  const parentCategories = categories.filter(c => !c.parentId && c.type === type);
  const [selectedParent, setSelectedParent] = useState<string>();
  const subcategories = selectedParent 
    ? categories.filter(c => c.parentId === selectedParent)
    : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type,
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category"),
      description: formData.get("description"),
      date: new Date(formData.get("date") as string).toISOString(),
      account: formData.get("account"),
    };

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setOpen(false);
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Ingreso</SelectItem>
                <SelectItem value="expense">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Monto</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select name="parentCategory" value={selectedParent} onValueChange={setSelectedParent}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {subcategories.length > 0 && (
            <div>
              <Label htmlFor="subcategory">Subcategoría</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {subcategories.length === 0 && selectedParent && (
            <input type="hidden" name="category" value={parentCategories.find(c => c.id === selectedParent)?.name} />
          )}
          <div>
            <Label htmlFor="account">Cuenta</Label>
            <Select name="account" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona cuenta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creando..." : "Crear Transacción"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
