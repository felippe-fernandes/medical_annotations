"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { ExportPDFDialog } from "./ExportPDFDialog";
import type { PatientData } from "@/lib/types";
import { useUI } from "@/components/providers/UIProvider";

interface ExportPDFButtonProps {
  patient: PatientData;
}

export function ExportPDFButton({ patient }: ExportPDFButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { setDialogOpen } = useUI();

   useEffect(() => {
    setDialogOpen(true);
    return () => setDialogOpen(false);
  }, [setDialogOpen]);


  return (
    <>
      <button
        onClick={() =>setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download size={20} />
        <span>Exportar PDF</span>
      </button>

      {showDialog && (
        <ExportPDFDialog
          patient={patient}
          onClose={() => {
            setShowDialog(false);
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
