"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { ExportPDFDialog } from "./ExportPDFDialog";

interface HourlyNote {
  hora: string;
  descricao: string;
}

interface DailyNote {
  data: Date;
  horaDormiu: string | null;
  horaAcordou: string | null;
  humor: number | null;
  detalhesExtras: string | null;
  tags: string[];
  hourlyNotes: HourlyNote[];
}

interface PatientData {
  id?: string;
  nome: string;
  dataNascimento: Date | null;
  dailyNotes: DailyNote[];
}

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
