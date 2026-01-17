"use client";

import { Button } from "@/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function CategoriesPage() {
  const [loading, setLoading] = useState(false);

  async function handleSeedCategories() {
    setLoading(true);
    try {
      const response = await fetch("/api/categories/seed", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`${data.count} categorías creadas exitosamente`);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error al crear categorías");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Button onClick={handleSeedCategories} disabled={loading}>
          {loading ? "Creando..." : "Crear Categorías por Defecto"}
        </Button>
      </div>
    </div>
  );
}
