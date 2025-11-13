"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ExportPDFDialog } from "./ExportPDFDialog";
import type { PatientData } from "@/lib/types";

interface ExportPDFButtonProps {
  patient: PatientData;
}

export function ExportPDFButton({ patient }: ExportPDFButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download size={20} />
        <span>Exportar PDF</span>
      </button>

      {showDialog && (
        <ExportPDFDialog
          patient={patient}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
