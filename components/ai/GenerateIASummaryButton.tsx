"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AISummaryDialog } from "./AiSummaryDialog";
import { useUI } from "@/components/providers/UIProvider";

interface GerarResumoIAButtonProps {
  patientId: string;
  patientName: string;
}

export function GerarResumoIAButton({ patientId, patientName }: GerarResumoIAButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { setDialogOpen } = useUI();

  useEffect(() => {
    setDialogOpen(true);
    return () => setDialogOpen(false);
  }, [setDialogOpen]);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Sparkles size={20} />
        <span>Resumo com IA</span>
      </button>

      {showDialog && (
        <AISummaryDialog
          patientId={patientId}
          patientName={patientName}
          onClose={() => {
            setShowDialog(false);
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
