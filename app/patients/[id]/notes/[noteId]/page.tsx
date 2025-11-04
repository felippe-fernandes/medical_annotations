import { prisma } from "@/lib/prisma";
import { ArrowLeft, Moon, Sun, Plus, Clock, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HourlyNoteList } from "@/components/notes/HourlyNoteList";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Logo } from "@/components/layout/Logo";

const humorEmojis = ["😢", "😟", "😐", "🙂", "😄"];
const humorLabels = ["Muito Ruim", "Ruim", "Neutro", "Bom", "Muito Bom"];

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { id, noteId } = await params;

  const note = await prisma.dailyNote.findUnique({
    where: { id: noteId },
    include: {
      patient: true,
      hourlyNotes: {
        orderBy: { hora: 'asc' }
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!note || note.patientId !== id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Logo */}
        <div className="mb-4">
          <Logo />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/patients/${id}`}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100">
              {format(new Date(note.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h1>
            <p className="text-sm text-slate-500">{note.patient.nome}</p>
          </div>
          <Link
            href={`/patients/${id}/notes/${noteId}/edit`}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit size={20} />
          </Link>
          <DeleteButton
            itemType="note"
            itemId={noteId}
            itemName={format(new Date(note.data), "dd/MM/yyyy")}
            redirectTo={`/patients/${id}`}
          />
        </div>

        {/* Card Principal */}
        <div className="bg-slate-800 rounded-lg shadow p-6 mb-6">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="mb-6 pb-6 border-b border-slate-700">
              <p className="text-sm text-slate-500 mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((dailyNoteTag) => (
                  <span
                    key={dailyNoteTag.tag.id}
                    style={{ backgroundColor: dailyNoteTag.tag.cor }}
                    className="inline-flex items-center px-3 py-1 text-white rounded-full text-sm"
                  >
                    {dailyNoteTag.tag.nome}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sono */}
          {(note.horaDormiu || note.horaAcordou) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {note.horaAcordou && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-950 rounded-lg">
                    <Sun size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Acordou</p>
                    <p className="text-lg font-semibold text-slate-100">{note.horaAcordou}</p>
                  </div>
                </div>
              )}
              {note.horaDormiu && (
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-950 rounded-lg">
                    <Moon size={24} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Dormiu</p>
                    <p className="text-lg font-semibold text-slate-100">{note.horaDormiu}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Humor */}
          {note.humor && (
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-2">Humor</p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{humorEmojis[note.humor - 1]}</span>
                <span className="text-lg font-medium text-slate-100">
                  {humorLabels[note.humor - 1]}
                </span>
              </div>
            </div>
          )}

          {/* Detalhes Extras */}
          {note.detalhesExtras && (
            <div>
              <p className="text-sm text-slate-500 mb-2">Detalhes</p>
              <p className="text-slate-300 whitespace-pre-wrap">{note.detalhesExtras}</p>
            </div>
          )}
        </div>

        {/* Registros Horários */}
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Registros por Hora</h2>
          </div>

          <HourlyNoteList
            noteId={noteId}
            patientId={id}
            initialNotes={note.hourlyNotes}
          />
        </div>
      </div>
    </div>
  );
}
