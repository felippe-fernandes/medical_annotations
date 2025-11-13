"use client";

import { useState, useEffect } from "react";
import { Plus, Pill, Edit2, Trash2, History, X, Check } from "lucide-react";

interface Medication {
  id: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  changes?: MedicationChange[];
}

interface MedicationChange {
  id: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string;
  motivo: string | null;
  createdAt: string;
}

interface MedicationsManagerProps {
  patientId: string;
  onMedicationAdded?: (medication: Medication) => void;
}

export function MedicationsManager({ patientId, onMedicationAdded }: MedicationsManagerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    dosagem: "",
    frequencia: "",
    observacoes: "",
    motivo: "",
  });

  useEffect(() => {
    fetchMedications();
  }, [patientId]);

  const fetchMedications = async () => {
    try {
      const response = await fetch(`/api/medications?patientId=${patientId}`);

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
      setMedications(data);
    } catch (error) {
      console.error("Erro ao buscar medicamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Atualizar
        const response = await fetch(`/api/medications/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            motivo: formData.motivo || "Atualização de medicamento",
          }),
        });

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

        const updated = await response.json();
        setMedications(meds =>
          meds.map(m => (m.id === editingId ? updated : m))
        );
      } else {
        // Criar
        const response = await fetch("/api/medications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            ...formData,
          }),
        });

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

        const newMed = await response.json();
        setMedications([newMed, ...medications]);
        if (onMedicationAdded) {
          onMedicationAdded(newMed);
        }
      }

      resetForm();
    } catch (error) {
      console.error("Erro ao salvar medicamento:", error);
      alert("Erro ao salvar medicamento");
    }
  };

  const handleEdit = (med: Medication) => {
    setFormData({
      nome: med.nome,
      dosagem: med.dosagem,
      frequencia: med.frequencia,
      observacoes: med.observacoes || "",
      motivo: "",
    });
    setEditingId(med.id);
    setShowForm(true);
  };

  const handleToggleActive = async (med: Medication) => {
    try {
      const response = await fetch(`/api/medications/${med.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ativo: !med.ativo,
          motivo: !med.ativo ? "Reativado" : "Desativado",
        }),
      });

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

      const updated = await response.json();
      setMedications(meds =>
        meds.map(m => (m.id === med.id ? updated : m))
      );
    } catch (error) {
      console.error("Erro ao atualizar medicamento:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar este medicamento?")) return;

    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: "DELETE",
      });

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

      setMedications(meds => meds.filter(m => m.id !== id));
    } catch (error) {
      console.error("Erro ao deletar medicamento:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      dosagem: "",
      frequencia: "",
      observacoes: "",
      motivo: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const activeMedications = medications.filter(m => m.ativo);
  const inactiveMedications = medications.filter(m => !m.ativo);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <p className="text-slate-400">Carregando medicamentos...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill size={24} className="text-green-400" />
            <h2 className="text-xl font-bold text-slate-100">Medicamentos</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? "Cancelar" : "Adicionar"}
          </button>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-slate-700 bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome do Medicamento *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: Paracetamol"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dosagem *
              </label>
              <input
                type="text"
                required
                value={formData.dosagem}
                onChange={(e) => setFormData({ ...formData, dosagem: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 500mg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Frequência *
              </label>
              <input
                type="text"
                required
                value={formData.frequencia}
                onChange={(e) => setFormData({ ...formData, frequencia: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ex: 8 em 8 horas"
              />
            </div>

            {editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Motivo da Alteração
                </label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Ajuste de dosagem"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Observações adicionais..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingId ? "Atualizar" : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de Medicamentos Ativos */}
      <div className="p-6">
        {activeMedications.length === 0 && inactiveMedications.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            Nenhum medicamento cadastrado
          </p>
        ) : (
          <>
            {activeMedications.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-3">
                  Ativos ({activeMedications.length})
                </h3>
                <div className="space-y-3">
                  {activeMedications.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onEdit={handleEdit}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      showHistory={showHistory}
                      setShowHistory={setShowHistory}
                    />
                  ))}
                </div>
              </div>
            )}

            {inactiveMedications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-3">
                  Inativos ({inactiveMedications.length})
                </h3>
                <div className="space-y-3">
                  {inactiveMedications.map((med) => (
                    <MedicationCard
                      key={med.id}
                      medication={med}
                      onEdit={handleEdit}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      showHistory={showHistory}
                      setShowHistory={setShowHistory}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface MedicationCardProps {
  medication: Medication;
  onEdit: (med: Medication) => void;
  onToggleActive: (med: Medication) => void;
  onDelete: (id: string) => void;
  showHistory: string | null;
  setShowHistory: (id: string | null) => void;
}

function MedicationCard({
  medication,
  onEdit,
  onToggleActive,
  onDelete,
  showHistory,
  setShowHistory,
}: MedicationCardProps) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        medication.ativo
          ? "bg-slate-900 border-green-700"
          : "bg-slate-900/50 border-slate-700 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-slate-100">
              {medication.nome}
            </h4>
            {medication.ativo ? (
              <span className="px-2 py-0.5 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-700">
                Ativo
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded-full">
                Inativo
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-slate-300">
              <span className="font-medium">Dosagem:</span> {medication.dosagem}
            </p>
            <p className="text-slate-300">
              <span className="font-medium">Frequência:</span> {medication.frequencia}
            </p>
            {medication.observacoes && (
              <p className="text-slate-400 text-xs mt-2">
                {medication.observacoes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {medication.changes && medication.changes.length > 0 && (
            <button
              onClick={() =>
                setShowHistory(showHistory === medication.id ? null : medication.id)
              }
              className="p-2 text-blue-400 hover:bg-slate-800 rounded transition-colors"
              title="Ver histórico"
            >
              <History size={18} />
            </button>
          )}
          <button
            onClick={() => onEdit(medication)}
            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onToggleActive(medication)}
            className={`p-2 rounded transition-colors ${
              medication.ativo
                ? "text-slate-400 hover:text-orange-400 hover:bg-slate-800"
                : "text-slate-400 hover:text-green-400 hover:bg-slate-800"
            }`}
            title={medication.ativo ? "Desativar" : "Reativar"}
          >
            {medication.ativo ? <X size={18} /> : <Check size={18} />}
          </button>
          <button
            onClick={() => onDelete(medication.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
            title="Deletar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Histórico de Mudanças */}
      {showHistory === medication.id && medication.changes && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h5 className="text-sm font-semibold text-slate-300 mb-2">
            Histórico de Alterações
          </h5>
          <div className="space-y-2">
            {medication.changes.map((change) => (
              <div key={change.id} className="text-xs bg-slate-800 p-2 rounded">
                <p className="text-slate-300">
                  <span className="font-medium capitalize">{change.campo}:</span>{" "}
                  {change.valorAnterior && (
                    <span className="text-slate-500 line-through">
                      {change.valorAnterior}
                    </span>
                  )}{" "}
                  <span className="text-green-400">{change.valorNovo}</span>
                </p>
                {change.motivo && (
                  <p className="text-slate-500 italic mt-1">{change.motivo}</p>
                )}
                <p className="text-slate-600 mt-1">
                  {new Date(change.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
