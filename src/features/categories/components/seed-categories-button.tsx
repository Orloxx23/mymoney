"use client";

import { Button } from "@/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Sparkles } from "lucide-react";

interface SeedCategoriesButtonProps {
  onSuccess?: () => void;
}

export function SeedCategoriesButton({ onSuccess }: SeedCategoriesButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    try {
      const response = await fetch("/api/categories/seed", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`${data.count} categorías creadas exitosamente`);
        onSuccess?.();
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
    <Button onClick={handleSeed} disabled={loading} variant="outline">
      <Sparkles className="h-4 w-4" />
      {loading ? "Creando..." : "Crear Categorías"}
    </Button>
  );
}
