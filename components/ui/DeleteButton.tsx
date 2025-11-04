"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  itemType: "patient" | "note";
  itemId: string;
  itemName: string;
  redirectTo: string;
}

export function DeleteButton({ itemType, itemId, itemName, redirectTo }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmMessage =
      itemType === "patient"
        ? `Tem certeza que deseja excluir o paciente "${itemName}"? Todas as anotações também serão excluídas.`
        : `Tem certeza que deseja excluir esta anotação?`;

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      const url = itemType === "patient" ? `/api/patients/${itemId}` : `/api/notes/${itemId}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar");

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-red-400 hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
      title={`Excluir ${itemType === "patient" ? "paciente" : "anotação"}`}
    >
      <Trash2 size={20} />
    </button>
  );
}
