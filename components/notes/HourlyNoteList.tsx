"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface HourlyNote {
  id: string;
  hora: string;
  descricao: string;
}

interface HourlyNoteListProps {
  noteId: string;
  patientId: string;
  initialNotes: HourlyNote[];
}

export function HourlyNoteList({ noteId, patientId, initialNotes }: HourlyNoteListProps) {
  const router = useRouter();
  const [notes, setNotes] = useState<HourlyNote[]>(initialNotes);
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ hora: "", descricao: "" });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newNote.hora || !newNote.descricao) {
      alert("Preencha hora e descrição");
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}/hourly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error("Erro ao adicionar registro");

      const createdNote = await response.json();
      setNotes([...notes, createdNote].sort((a, b) => a.hora.localeCompare(b.hora)));
      setNewNote({ hora: "", descricao: "" });
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar registro");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/notes/${noteId}/hourly/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar registro");

      setNotes(notes.filter((n) => n.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar registro");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Lista de Registros */}
      {notes.length === 0 && !isAdding ? (
        <p className="text-slate-500 text-center py-4">Nenhum registro por hora ainda</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg"
          >
            <div className="flex-shrink-0 pt-0.5">
              <span className="inline-block px-2 py-1 bg-blue-950 text-blue-300 text-sm font-medium rounded">
                {note.hora}
              </span>
            </div>
            <p className="flex-1 text-slate-300">{note.descricao}</p>
            <button
              onClick={() => handleDelete(note.id)}
              disabled={isDeleting === note.id}
              className="flex-shrink-0 p-1 text-red-400 hover:bg-red-950 rounded transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))
      )}

      {/* Formulário de Adição */}
      {isAdding ? (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hora</label>
              <input
                type="time"
                value={newNote.hora}
                onChange={(e) => setNewNote({ ...newNote, hora: e.target.value })}
                className="w-full px-2 py-1.5 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Descrição</label>
              <input
                type="text"
                value={newNote.descricao}
                onChange={(e) => setNewNote({ ...newNote, descricao: e.target.value })}
                placeholder="O que aconteceu..."
                className="w-full px-2 py-1.5 border border-slate-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote({ hora: "", descricao: "" });
              }}
              className="px-3 py-2 border border-slate-600 rounded text-sm hover:bg-slate-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
        >
          <Plus size={20} />
          <span>Adicionar Registro</span>
        </button>
      )}
    </div>
  );
}
