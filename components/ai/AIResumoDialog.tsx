"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Loader2, Sparkles, Download, Eye, Edit2, Tag } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResumoDialogProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
}

export function AIResumoDialog({ patientId, patientName, onClose }: AIResumoDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [resumo, setResumo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  // Buscar tags disponíveis quando o componente montar
  useEffect(() => {
    const fetchTags = async (retryCount = 0) => {
      try {
        const response = await fetch(`/api/patients/${patientId}`);

        // Se retornar 401, redirecionar para o login
        if (response.status === 401) {
          try {
            await fetch("/api/auth/logout", { method: "POST" });
          } catch (error) {
            console.error("Erro ao fazer logout:", error);
          } finally {
            window.location.href = "/login";
          }
          return;
        }

        if (!response.ok && retryCount < 3) {
          setTimeout(() => fetchTags(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        const data = await response.json();

        if (response.ok && data.dailyNotes) {
          const tagsSet = new Set<string>();
          data.dailyNotes.forEach((note: any) => {
            if (note.tags && Array.isArray(note.tags)) {
              note.tags.forEach((tag: string) => tagsSet.add(tag));
            }
          });
          setAvailableTags(Array.from(tagsSet).sort());
        }
      } catch (err) {
        console.error("Erro ao buscar tags:", err);
        if (retryCount < 3) {
          setTimeout(() => fetchTags(retryCount + 1), 1000 * (retryCount + 1));
        }
      }
    };

    fetchTags();
  }, [patientId]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
          tags: selectedTags.length > 0 ? selectedTags : null,
        }),
      });

      // Se retornar 401, redirecionar para o login
      if (response.status === 401) {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
        } finally {
          window.location.href = "/login";
        }
        return;
      }

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


  const handleDownloadPDF = async () => {
    if (!resumo) return;

    try {
      // Importar bibliotecas e utilitários dinamicamente
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const { sanitizeFileName } = await import("@/lib/utils/security");

      const doc = new jsPDF() as any;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Função auxiliar para adicionar texto com quebra de linha
      const addText = (text: string, fontSize: number, isBold: boolean, color: number[] = [0, 0, 0]) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.setTextColor(...color);

        const lines = doc.splitTextToSize(text, contentWidth);

        lines.forEach((line: string, index: number) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.4;
        });

        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
      };

      // Processar markdown linha por linha
      const lines = resumo.split('\n');
      let inTable = false;
      let tableData: string[][] = [];
      let tableHeaders: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Pular linhas vazias
        if (!line) {
          yPosition += 3;
          continue;
        }

        // Detectar início de tabela
        if (line.startsWith('|') && !inTable) {
          inTable = true;
          tableHeaders = line.split('|').map(c => c.trim()).filter(c => c && c !== '---' && !c.includes(':---'));
          continue;
        }

        // Linha de separação da tabela
        if (line.includes('|') && line.includes(':---')) {
          continue;
        }

        // Processar linhas da tabela
        if (inTable && line.startsWith('|')) {
          const cells = line.split('|').map(c => c.trim().replace(/\*\*/g, '')).filter(c => c);
          if (cells.length > 0) {
            tableData.push(cells);
          }
          continue;
        }

        // Fim da tabela - renderizar
        if (inTable && !line.startsWith('|')) {
          if (tableData.length > 0) {
            autoTable(doc, {
              startY: yPosition,
              head: tableHeaders.length > 0 ? [tableHeaders] : undefined,
              body: tableData,
              theme: 'grid',
              styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: [0, 0, 0],
              },
              headStyles: {
                fillColor: [139, 92, 246],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [245, 245, 245],
              },
              margin: { left: margin, right: margin },
            });
            yPosition = doc.lastAutoTable.finalY + 5;
          }
          inTable = false;
          tableData = [];
          tableHeaders = [];
        }

        // Headers H2 (##)
        if (line.startsWith('## ')) {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = margin;
          }
          const text = line.replace(/^## /, '');
          addText(text, 16, true, [139, 92, 246]);
          yPosition += 5;
          continue;
        }

        // Headers H3 (###)
        if (line.startsWith('### ')) {
          if (yPosition > 255) {
            doc.addPage();
            yPosition = margin;
          }
          const text = line.replace(/^### /, '');
          addText(text, 13, true, [167, 139, 250]);
          yPosition += 3;
          continue;
        }

        // Headers H4 (####)
        if (line.startsWith('#### ')) {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = margin;
          }
          const text = line.replace(/^#### /, '').replace(/\*\*/g, '');
          addText(text, 11, true, [50, 50, 50]);
          yPosition += 2;
          continue;
        }

        // Texto que é só bold (ex: **03/11**) - tratar como sub-heading
        if (/^\*\*[^*]+\*\*$/.test(line)) {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = margin;
          }
          const text = line.replace(/\*\*/g, '');
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(50, 50, 50);
          doc.text(text, margin, yPosition);
          yPosition += 7;
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          continue;
        }

        // Linha horizontal (---)
        if (line === '---') {
          if (yPosition > 265) {
            doc.addPage();
            yPosition = margin;
          }
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 5;
          continue;
        }

        // Bullet points
        if (line.startsWith('* ') || line.startsWith('- ')) {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = margin;
          }

          const text = line.replace(/^[*-] /, '');

          // Processar bold
          const segments = text.split(/(\*\*[^*]+\*\*)/g);
          doc.setFontSize(10);
          let xPos = margin + 4;

          doc.text('•', margin, yPosition);

          segments.forEach(segment => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              const boldText = segment.replace(/\*\*/g, '');
              doc.setFont(undefined, 'bold');
              const lines = doc.splitTextToSize(boldText, contentWidth - 8);
              lines.forEach((line: string, idx: number) => {
                if (idx > 0) {
                  yPosition += 5;
                  if (yPosition > 270) {
                    doc.addPage();
                    yPosition = margin;
                  }
                  xPos = margin + 4;
                }
                doc.text(line, xPos, yPosition);
                xPos += doc.getTextWidth(line);
              });
              doc.setFont(undefined, 'normal');
            } else if (segment) {
              const lines = doc.splitTextToSize(segment, contentWidth - 8);
              lines.forEach((line: string, idx: number) => {
                if (idx > 0) {
                  yPosition += 5;
                  if (yPosition > 270) {
                    doc.addPage();
                    yPosition = margin;
                  }
                  xPos = margin + 4;
                }
                doc.text(line, xPos, yPosition);
                xPos += doc.getTextWidth(line);
              });
            }
          });

          yPosition += 6;
          continue;
        }

        // Texto normal com suporte a bold
        if (yPosition > 260) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(10);
        const segments = line.split(/(\*\*[^*]+\*\*)/g);
        let xPos = margin;

        segments.forEach(segment => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            const boldText = segment.replace(/\*\*/g, '');
            doc.setFont(undefined, 'bold');
            const lines = doc.splitTextToSize(boldText, contentWidth);
            lines.forEach((line: string, idx: number) => {
              if (idx > 0) {
                yPosition += 5;
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = margin;
                }
                xPos = margin;
              }
              doc.text(line, xPos, yPosition);
              xPos += doc.getTextWidth(line);
            });
            doc.setFont(undefined, 'normal');
          } else if (segment) {
            const lines = doc.splitTextToSize(segment, contentWidth);
            lines.forEach((line: string, idx: number) => {
              if (idx > 0) {
                yPosition += 5;
                if (yPosition > 270) {
                  doc.addPage();
                  yPosition = margin;
                }
                xPos = margin;
              }
              doc.text(line, xPos, yPosition);
              xPos += doc.getTextWidth(line);
            });
          }
        });

        yPosition += 5;
      }

      // Renderizar tabela final se houver
      if (inTable && tableData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: tableHeaders.length > 0 ? [tableHeaders] : undefined,
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [139, 92, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          margin: { left: margin, right: margin },
        });
      }

      // Salvar PDF com nome sanitizado
      const sanitizedName = sanitizeFileName(patientName);
      const fileName = `resumo_${sanitizedName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      setError("Erro ao gerar PDF. Tente novamente.");
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
            </div>
          )}

          {/* Tags Filter */}
          {!resumo && availableTags.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Tag size={18} />
                <span className="font-medium">Filtrar por Tags (opcional)</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-purple-600 text-white"
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
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Limpar tags ({selectedTags.length})
                </button>
              )}
            </div>
          )}

          {/* Info */}
          {!resumo && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-400">
                {startDate || endDate || selectedTags.length > 0 ? (
                  <>
                    A IA analisará apenas as anotações que correspondem aos filtros selecionados
                    {selectedTags.length > 0 && (
                      <> (tags: {selectedTags.join(", ")})</>
                    )}
                    .
                  </>
                ) : (
                  <>
                    A IA analisará todas as anotações do paciente.
                  </>
                )}
              </p>
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
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  Resumo gerado com base em {notesCount} anotaç{notesCount === 1 ? "ão" : "ões"}
                </p>
                <div className="flex gap-2">
                  {/* Toggle View/Edit */}
                  <div className="flex items-center rounded-lg bg-slate-700 p-1">
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                        !isEditing
                          ? "bg-slate-600 text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Eye size={16} />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                        isEditing
                          ? "bg-slate-600 text-white"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <Edit2 size={16} />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyResumo}
                    className="px-3 py-1.5 text-sm bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                  >
                    Copiar
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Baixar</span> PDF
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                {isEditing ? (
                  // Editor Mode
                  <textarea
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                    className="w-full h-[500px] p-6 bg-slate-900 text-slate-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                    placeholder="Edite o markdown aqui..."
                  />
                ) : (
                  // Preview Mode
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    <div className="prose prose-invert prose-purple max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mt-6 mb-3 text-purple-300 border-b border-purple-800 pb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mt-5 mb-2 text-purple-400">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-bold mt-4 mb-2 text-purple-400">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-base font-bold mt-3 mb-1.5 text-purple-400">
                              {children}
                            </h4>
                          ),
                          p: ({ children }) => (
                            <p className="text-slate-200 mb-3 leading-relaxed">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-slate-100">
                              {children}
                            </strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-none space-y-1.5 mb-3 ml-0">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal space-y-1.5 mb-3 ml-6">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-slate-200 pl-1 before:content-['•'] before:mr-2 before:text-purple-400">
                              {children}
                            </li>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-4">
                              <table className="min-w-full border-collapse border border-slate-700">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-slate-800">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="border border-slate-700 px-4 py-2 text-left font-bold text-purple-300">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-slate-700 px-4 py-2 text-slate-200">
                              {children}
                            </td>
                          ),
                          hr: () => (
                            <hr className="my-6 border-slate-700" />
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 italic text-slate-300 bg-slate-800/50">
                              {children}
                            </blockquote>
                          ),
                          code: ({ inline, children }: any) =>
                            inline ? (
                              <code className="bg-slate-800 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-slate-800 text-slate-200 p-4 rounded my-3 text-sm font-mono overflow-x-auto">
                                {children}
                              </code>
                            )
                        }}
                      >
                        {resumo}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
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
