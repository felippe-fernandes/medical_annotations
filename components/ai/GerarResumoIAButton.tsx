"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AIResumoDialog } from "./AIResumoDialog";

interface GerarResumoIAButtonProps {
  patientId: string;
  patientName: string;
}

export function GerarResumoIAButton({ patientId, patientName }: GerarResumoIAButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

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
        <AIResumoDialog
          patientId={patientId}
          patientName={patientName}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
