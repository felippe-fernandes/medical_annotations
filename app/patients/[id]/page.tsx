import { prisma } from "@/lib/prisma";
import { ArrowLeft, Plus, Calendar, Moon, Sun, Smile, Settings } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StartDailyNote } from "@/components/notes/StartDailyNote";
import { Logo } from "@/components/layout/Logo";
import { ExportPDFButton } from "@/components/pdf/ExportPDFButton";
import { createClient } from "@/lib/supabase/server";

const humorEmojis = ["😢", "😟", "😐", "🙂", "😄"];

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      dailyNotes: {
        orderBy: { data: 'desc' },
        include: {
          hourlyNotes: {
            orderBy: { hora: 'asc' }
          },
          tags: {
            include: {
              tag: true,
            },
          },
        }
      },
    },
  });

  if (!patient) {
    notFound();
  }

  // Verificar se o paciente pertence ao usuário
  if (patient.userId !== user.id) {
    notFound();
  }

  // Check if there's already a note for today (for visual highlighting)
  const today = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Logo */}
        <div className="mb-4">
          <Logo />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/patients"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100">{patient.nome}</h1>
            {patient.dataNascimento && (
              <p className="text-sm text-slate-500">
                {format(new Date(patient.dataNascimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
          <DeleteButton
            itemType="patient"
            itemId={patient.id}
            itemName={patient.nome}
            redirectTo="/patients"
          />
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 mb-6">
          <StartDailyNote patientId={id} />

          {patient.dailyNotes.length > 0 && (
            <ExportPDFButton
              patient={{
                nome: patient.nome,
                dataNascimento: patient.dataNascimento,
                dailyNotes: patient.dailyNotes.map((note) => ({
                  data: note.data,
                  horaDormiu: note.horaDormiu,
                  horaAcordou: note.horaAcordou,
                  humor: note.humor,
                  detalhesExtras: note.detalhesExtras,
                  tags: note.tags.map((t) => t.tag.nome),
                  hourlyNotes: note.hourlyNotes.map((hn) => ({
                    hora: hn.hora,
                    descricao: hn.descricao,
                  })),
                })),
              }}
            />
          )}
        </div>

        {/* Lista de Anotações */}
        {patient.dailyNotes.length === 0 ? (
          <div className="bg-slate-800 rounded-lg shadow p-8 text-center">
            <Calendar size={48} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 mb-2">Nenhuma anotação ainda</p>
            <p className="text-slate-400 text-sm">Clique no botão acima para iniciar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patient.dailyNotes.map((note) => {
              const noteDate = startOfDay(new Date(note.data));
              const isToday = noteDate.getTime() === today.getTime();

              return (
                <Link
                  key={note.id}
                  href={`/patients/${id}/notes/${note.id}`}
                  className={`block bg-slate-800 rounded-lg shadow p-4 hover:shadow-md transition-all ${
                    isToday ? 'border-2 border-blue-500' : 'border-2 border-transparent'
                  }`}
                >
                  {/* Data */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-slate-100">
                      {format(new Date(note.data), "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(note.data), "EEEE", { locale: ptBR })}
                    </p>
                  </div>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {/* Hora Acordou */}
                  {note.horaAcordou && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sun size={16} className="text-amber-400" />
                      <span className="text-slate-300">{note.horaAcordou}</span>
                    </div>
                  )}

                  {/* Hora Dormiu */}
                  {note.horaDormiu && (
                    <div className="flex items-center gap-2 text-sm">
                      <Moon size={16} className="text-indigo-400" />
                      <span className="text-slate-300">{note.horaDormiu}</span>
                    </div>
                  )}

                  {/* Humor */}
                  {note.humor && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">{humorEmojis[note.humor - 1]}</span>
                    </div>
                  )}
                </div>

                {/* Detalhes Extras */}
                {note.detalhesExtras && (
                  <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                    {note.detalhesExtras}
                  </p>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {note.tags.map((dailyNoteTag) => (
                      <span
                        key={dailyNoteTag.tag.id}
                        style={{ backgroundColor: dailyNoteTag.tag.cor }}
                        className="inline-block px-2 py-0.5 text-white rounded-full text-xs"
                      >
                        {dailyNoteTag.tag.nome}
                      </span>
                    ))}
                  </div>
                )}

                  {/* Registros Horários */}
                  {note.hourlyNotes.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-500">
                        {note.hourlyNotes.length} {note.hourlyNotes.length === 1 ? 'registro horário' : 'registros horários'}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
