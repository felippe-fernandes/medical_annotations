"use client";

import { useState } from "react";
import { X, Calendar, Loader2, Sparkles, Download } from "lucide-react";

interface AIResumoDialogProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export function AIResumoDialog({ patientId, patientName, onClose }: AIResumoDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [resumo, setResumo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesCount, setNotesCount] = useState<number>(0);

  const handleGenerateResumo = async () => {
    setLoading(true);
    setError(null);
    setResumo(null);

    try {
      const response = await fetch("/api/ai/resumo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar resumo");
      }

      setResumo(data.resumo);
      setNotesCount(data.notesCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResumo = () => {
    if (resumo) {
      navigator.clipboard.writeText(resumo);
      // Poderia adicionar um toast aqui
    }
  };

  const handleDownloadResumo = () => {
    if (resumo) {
      const blob = new Blob([resumo], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resumo_${patientName.replace(/\s+/g, "_")}_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-purple-400" />
            <h2 className="text-xl font-bold text-slate-100">Resumo com IA</h2>
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
            <p className="text-lg font-semibold text-slate-100">{patientName}</p>
          </div>

          {/* Date Range */}
          {!resumo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={18} />
                <span className="font-medium">Período (opcional)</span>
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
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Limpar período
                </button>
              )}

              {/* Info */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400">
                  {startDate || endDate ? (
                    <>
                      A IA analisará apenas as anotações do período selecionado.
                    </>
                  ) : (
                    <>
                      A IA analisará todas as anotações do paciente.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={48} className="text-purple-400 animate-spin" />
              <p className="text-slate-300">Gerando resumo com IA...</p>
              <p className="text-sm text-slate-500">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Resumo */}
          {resumo && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  Resumo gerado com base em {notesCount} anotaç{notesCount === 1 ? "ão" : "ões"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyResumo}
                    className="px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={handleDownloadResumo}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                  >
                    <Download size={16} />
                    Baixar
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <div
                    className="text-slate-200 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: resumo
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/^#{1} (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-purple-300">$1</h1>')
                        .replace(/^#{2} (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2 text-purple-400">$1</h2>')
                        .replace(/^#{3} (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-purple-400">$1</h3>')
                        .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
                        .replace(/\n\n/g, '<br/><br/>')
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          {!resumo ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateResumo}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Gerar Resumo
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
