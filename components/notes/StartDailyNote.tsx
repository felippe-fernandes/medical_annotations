"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface StartDailyNoteProps {
  patientId: string;
}

export function StartDailyNote({ patientId }: StartDailyNoteProps) {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/patients/${patientId}/notes/new`);
  };

  return (
    <button
      onClick={handleStart}
      className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Plus size={20} />
      <span>Iniciar Anotação</span>
    </button>
  );
}
