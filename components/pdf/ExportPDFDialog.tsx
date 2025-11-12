"use client";

import { useState } from "react";
import { Download, X, Calendar, Sparkles, Loader2 } from "lucide-react";
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
  const [includeAIResumo, setIncludeAIResumo] = useState(false);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [resumo, setResumo] = useState<string | null>(null);

  const handleGenerateResumo = async () => {
    setLoadingResumo(true);
    try {
      // Precisamos pegar o patientId - vamos assumir que está disponível
      // Se não estiver, precisaremos adicionar à interface PatientData
      const response = await fetch("/api/ai/resumo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: (patient as any).id, // Assumindo que o ID existe
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar resumo");
      }

      setResumo(data.resumo);
      setIncludeAIResumo(true);
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      alert("Erro ao gerar resumo com IA. Verifique se a chave da API está configurada.");
    } finally {
      setLoadingResumo(false);
    }
  };

  const handleExport = () => {
    const options: {
      startDate?: Date;
      endDate?: Date;
      aiResumo?: string;
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

    if (includeAIResumo && resumo) {
      options.aiResumo = resumo;
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

          {/* Info */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-400">
              {startDate || endDate ? (
                <>
                  Serão exportadas apenas as anotações do período selecionado.
                </>
              ) : (
                <>
                  Todas as anotações do paciente serão exportadas para o PDF.
                </>
              )}
            </p>
          </div>

          {/* AI Resumo Section */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles size={18} />
              <span className="font-medium">Resumo com IA (opcional)</span>
            </div>

            {!resumo ? (
              <button
                onClick={handleGenerateResumo}
                disabled={loadingResumo}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingResumo ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando resumo...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar resumo e incluir no PDF
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-purple-900/20 border border-purple-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-400" />
                    <span className="text-sm text-purple-300">Resumo gerado com sucesso</span>
                  </div>
                  <button
                    onClick={() => {
                      setResumo(null);
                      setIncludeAIResumo(false);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Remover
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  O resumo será incluído no início do PDF
                </p>
              </div>
            )}
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
