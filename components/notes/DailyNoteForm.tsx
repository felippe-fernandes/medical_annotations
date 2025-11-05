"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Trash2, Clock } from "lucide-react";
import { formatLocalDate } from "@/lib/dateUtils";

const dailyNoteSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  horaDormiu: z.string().optional(),
  horaAcordou: z.string().optional(),
  humor: z.string().optional(),
  detalhesExtras: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type DailyNoteFormData = z.infer<typeof dailyNoteSchema>;

interface Tag {
  id: string;
  nome: string;
  cor: string;
}

interface HourlyNote {
  id?: string;
  hora: string;
  descricao: string;
}

interface DailyNoteFormProps {
  patientId: string;
  initialData?: {
    id: string;
    data: Date;
    horaDormiu: string | null;
    horaAcordou: string | null;
    humor: number | null;
    detalhesExtras: string | null;
    tags: { tag: Tag }[];
    hourlyNotes?: HourlyNote[];
  };
}

const humorOptions = [
  { value: "1", emoji: "😢", label: "Muito Ruim" },
  { value: "2", emoji: "😟", label: "Ruim" },
  { value: "3", emoji: "😐", label: "Neutro" },
  { value: "4", emoji: "🙂", label: "Bom" },
  { value: "5", emoji: "😄", label: "Muito Bom" },
];

export function DailyNoteForm({ patientId, initialData }: DailyNoteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHumor, setSelectedHumor] = useState<string>(
    initialData?.humor?.toString() || ""
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map(t => t.tag.id) || []
  );
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Função para obter hora atual no timezone GMT-3 (Brasil)
  const getCurrentBrazilTime = () => {
    const now = new Date();
    // Ajustar para GMT-3
    const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    const hours = brazilTime.getUTCHours().toString().padStart(2, '0');
    const minutes = brazilTime.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Anotações horárias
  const [hourlyNotes, setHourlyNotes] = useState<HourlyNote[]>(
    initialData?.hourlyNotes || []
  );
  const [newHourlyHora, setNewHourlyHora] = useState(getCurrentBrazilTime());
  const [newHourlyDesc, setNewHourlyDesc] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DailyNoteFormData>({
    resolver: zodResolver(dailyNoteSchema),
    defaultValues: {
      data: initialData?.data
        ? formatLocalDate(new Date(initialData.data))
        : formatLocalDate(new Date()),
      horaDormiu: initialData?.horaDormiu || "",
      horaAcordou: initialData?.horaAcordou || "",
      humor: initialData?.humor?.toString() || "",
      detalhesExtras: initialData?.detalhesExtras || "",
    },
  });

  // Carregar tags disponíveis
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(tags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const createNewTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: newTagName.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        setAvailableTags((prev) => [...prev, newTag]);
        setSelectedTagIds((prev) => [...prev, newTag.id]);
        setNewTagName("");
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao criar tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      alert("Erro ao criar tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  };

  // Funções para anotações horárias
  const addHourlyNote = () => {
    if (!newHourlyHora || !newHourlyDesc.trim()) {
      alert("Preencha hora e descrição");
      return;
    }

    setHourlyNotes((prev) => [
      ...prev,
      { hora: newHourlyHora, descricao: newHourlyDesc.trim() },
    ]);
    setNewHourlyHora("");
    setNewHourlyDesc("");
  };

  const removeHourlyNote = (index: number) => {
    setHourlyNotes((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteHourlyNoteFromServer = async (id: string) => {
    if (!confirm("Deseja realmente deletar este registro?")) return;

    try {
      const response = await fetch(`/api/notes/${initialData!.id}/hourly/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHourlyNotes((prev) => prev.filter((note) => note.id !== id));
      } else {
        alert("Erro ao deletar registro");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar registro");
    }
  };

  const onSubmit = async (data: DailyNoteFormData) => {
    setIsLoading(true);
    try {
      const url = initialData
        ? `/api/notes/${initialData.id}`
        : "/api/notes";

      const method = initialData ? "PUT" : "POST";

      // Salvar anotação diária
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          data: data.data,
          horaDormiu: data.horaDormiu || null,
          horaAcordou: data.horaAcordou || null,
          humor: data.humor ? parseInt(data.humor) : null,
          detalhesExtras: data.detalhesExtras || null,
          tagIds: selectedTagIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao salvar anotação");
      }

      const result = await response.json();

      // Salvar anotações horárias novas (que não têm ID)
      const newHourlyNotes = hourlyNotes.filter((note) => !note.id);
      for (const hourlyNote of newHourlyNotes) {
        await fetch(`/api/notes/${result.id}/hourly`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hora: hourlyNote.hora,
            descricao: hourlyNote.descricao,
          }),
        });
      }

      router.push(`/patients/${patientId}/notes/${result.id}`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao salvar anotação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Data */}
      <div>
        <label htmlFor="data" className="block text-sm font-medium text-slate-300 mb-1">
          Data da Anotação *
        </label>
        <input
          {...register("data")}
          type="date"
          id="data"
          required
          className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-slate-100"
        />
        {errors.data && (
          <p className="mt-1 text-sm text-red-400">{errors.data.message}</p>
        )}
      </div>

      {/* Sono */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="horaAcordou" className="block text-sm font-medium text-slate-300 mb-1">
            Hora que Acordou
          </label>
          <input
            {...register("horaAcordou")}
            type="time"
            id="horaAcordou"
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="horaDormiu" className="block text-sm font-medium text-slate-300 mb-1">
            Hora que Dormiu
          </label>
          <input
            {...register("horaDormiu")}
            type="time"
            id="horaDormiu"
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Humor */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Humor
        </label>
        <div className="flex gap-2 justify-between">
          {humorOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSelectedHumor(option.value);
                setValue("humor", option.value);
              }}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                selectedHumor === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-700 hover:border-slate-600"
              }`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <span className="text-xs text-slate-400">{option.label}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("humor")} />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Tags (marcar eventos importantes)
        </label>

        {/* Tags disponíveis */}
        <div className="flex flex-wrap gap-2 mb-3">
          {availableTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              style={{
                backgroundColor: selectedTagIds.includes(tag.id) ? tag.cor : undefined,
                borderColor: tag.cor,
              }}
              className={`px-3 py-1 rounded-full text-sm transition-all border-2 ${
                selectedTagIds.includes(tag.id)
                  ? "text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {tag.nome}
            </button>
          ))}
        </div>

        {/* Tags selecionadas */}
        {selectedTagIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-slate-900 rounded-lg">
            <p className="w-full text-xs text-slate-400 mb-1">Tags selecionadas:</p>
            {selectedTagIds.map((tagId) => {
              const tag = availableTags.find(t => t.id === tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  style={{ backgroundColor: tag.cor }}
                  className="inline-flex items-center gap-1 px-3 py-1 text-white rounded-full text-sm"
                >
                  {tag.nome}
                  <button
                    type="button"
                    onClick={() => removeTag(tagId)}
                    className="hover:opacity-80 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Criar nova tag */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createNewTag();
              }
            }}
            placeholder="Criar nova tag..."
            className="flex-1 px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            type="button"
            onClick={createNewTag}
            disabled={isCreatingTag || !newTagName.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-1"
          >
            <Plus size={16} />
            {isCreatingTag ? "..." : "Criar"}
          </button>
        </div>
      </div>

      {/* Anotações Horárias */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Clock size={16} className="inline mr-2" />
          Registros Horários
        </label>

        {/* Lista de anotações horárias */}
        {hourlyNotes.length > 0 && (
          <div className="space-y-2 mb-3">
            {hourlyNotes.map((note, index) => (
              <div
                key={note.id || index}
                className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-400">{note.hora}</p>
                  <p className="text-sm text-slate-300">{note.descricao}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    note.id
                      ? deleteHourlyNoteFromServer(note.id)
                      : removeHourlyNote(index)
                  }
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Adicionar nova anotação horária */}
        <div className="space-y-2 p-3 bg-slate-900 rounded-lg">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="time"
              value={newHourlyHora}
              onChange={(e) => setNewHourlyHora(e.target.value)}
              className="px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Hora"
            />
            <input
              type="text"
              value={newHourlyDesc}
              onChange={(e) => setNewHourlyDesc(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHourlyNote();
                }
              }}
              className="col-span-2 px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Descrição do registro..."
            />
          </div>
          <button
            type="button"
            onClick={addHourlyNote}
            className="w-full px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Adicionar Registro
          </button>
        </div>
      </div>

      {/* Detalhes Extras */}
      <div>
        <label htmlFor="detalhesExtras" className="block text-sm font-medium text-slate-300 mb-1">
          Detalhes Extras
        </label>
        <textarea
          {...register("detalhesExtras")}
          id="detalhesExtras"
          rows={4}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Observações adicionais..."
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Anotação"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-3 border border-slate-600 rounded-lg hover:bg-slate-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
