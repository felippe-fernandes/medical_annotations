"use client";

import { useState, useMemo } from "react";
import { Download, X, Calendar, Tag } from "lucide-react";
import { generatePatientPDF } from "@/lib/pdf-export";
import { parseLocalDate } from "@/lib/dateUtils";
import type { PatientData } from "@/lib/types";

interface ExportPDFDialogProps {
  patient: PatientData;
  onClose: () => void;
}

export function ExportPDFDialog({ patient, onClose }: ExportPDFDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extrair todas as tags únicas das anotações do paciente
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    patient.dailyNotes.forEach((note) => {
      note.tags.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [patient.dailyNotes]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleExport = () => {
    const options: {
      startDate?: Date;
      endDate?: Date;
      tags?: string[];
    } = {};

    // Usar função centralizada para parsing de datas
    if (startDate) {
      options.startDate = parseLocalDate(startDate);
    }
    if (endDate) {
      options.endDate = parseLocalDate(endDate);
    }
    if (selectedTags.length > 0) {
      options.tags = selectedTags;
    }

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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto pb-20">
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

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Tag size={18} />
                <span className="font-medium">Filtrar por Tags</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Limpar tags ({selectedTags.length})
                </button>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              {startDate || endDate || selectedTags.length > 0 ? (
                <>
                  Serão exportadas apenas as anotações que correspondem aos filtros selecionados
                  {selectedTags.length > 0 && (
                    <> (tags: {selectedTags.join(", ")})</>
                  )}
                  .
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
