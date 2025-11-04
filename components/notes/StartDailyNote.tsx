"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

interface StartDailyNoteProps {
  patientId: string;
}

export function StartDailyNote({ patientId }: StartDailyNoteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          data: today,
          horaDormiu: null,
          horaAcordou: null,
          humor: null,
          detalhesExtras: null,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar anotação");

      const result = await response.json();
      router.push(`/patients/${patientId}/notes/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar anotação do dia");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
    >
      <Plus size={20} />
      <span>{isLoading ? "Criando..." : "Iniciar Anotação de Hoje"}</span>
    </button>
  );
}
