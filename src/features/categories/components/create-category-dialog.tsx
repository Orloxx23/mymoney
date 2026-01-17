"use client";

import { useState } from "react";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Plus } from "lucide-react";
import type { Category } from "../services/category-service";

interface CreateCategoryDialogProps {
  categories?: Category[];
  onSuccess?: () => void;
}

export function CreateCategoryDialog({ categories = [], onSuccess }: CreateCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  const parentCategories = categories.filter(c => !c.parentId && c.type === type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type,
      color: formData.get("color"),
      parentId: formData.get("parentId") || undefined,
    };

    try {
      await fetch("/api/categories", {
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
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Categoría</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
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
            <Label htmlFor="parentId">Categoría Padre (opcional)</Label>
            <Select name="parentId">
              <SelectTrigger>
                <SelectValue placeholder="Sin categoría padre" />
              </SelectTrigger>
              <SelectContent>
                {parentCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" type="color" defaultValue="#3b82f6" required />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creando..." : "Crear Categoría"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
