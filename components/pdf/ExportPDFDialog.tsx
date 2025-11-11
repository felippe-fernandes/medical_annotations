"use client";

import { useState, useMemo } from "react";
import { Download, X, Calendar, Tag } from "lucide-react";
import { generatePatientPDF } from "@/lib/pdf-export";

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
  nome: string;
  dataNascimento: Date | null;
  dailyNotes: DailyNote[];
}

interface ExportPDFDialogProps {
  patient: PatientData;
  onClose: () => void;
}

export function ExportPDFDialog({ patient, onClose }: ExportPDFDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Extrair todas as tags únicas das anotações
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    patient.dailyNotes.forEach((note) => {
      note.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [patient.dailyNotes]);

  const handleExport = () => {
    const options: {
      startDate?: Date;
      endDate?: Date;
      filterTag?: string;
    } = {};

    // Criar datas no timezone local (não UTC)
    // Input date vem como "2025-11-03", precisamos criar como data local
    if (startDate) {
      const [year, month, day] = startDate.split('-').map(Number);
      options.startDate = new Date(year, month - 1, day);
    }
    if (endDate) {
      const [year, month, day] = endDate.split('-').map(Number);
      options.endDate = new Date(year, month - 1, day);
    }
    if (selectedTag) options.filterTag = selectedTag;

    generatePatientPDF(patient, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Download size={24} className="text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">Exportar PDF</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Paciente Info */}
          <div>
            <p className="text-sm text-slate-400 mb-1">Paciente</p>
            <p className="text-lg font-semibold text-slate-100">{patient.nome}</p>
            <p className="text-sm text-slate-500">
              {patient.dailyNotes.length} {patient.dailyNotes.length === 1 ? "anotação" : "anotações"}
            </p>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar size={18} />
              <span className="font-medium">Período</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Limpar período
              </button>
            )}
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Tag size={18} />
                <span className="font-medium">Filtrar por Tag</span>
              </div>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              {selectedTag && (
                <button
                  onClick={() => setSelectedTag("")}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              {startDate || endDate || selectedTag ? (
                <>
                  Serão exportadas apenas as anotações que correspondem aos filtros selecionados.
                </>
              ) : (
                <>
                  Todas as anotações do paciente serão exportadas para o PDF.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
