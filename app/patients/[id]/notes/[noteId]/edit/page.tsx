import { Logo } from "@/components/layout/Logo";
import { DailyNoteForm } from "@/components/notes/DailyNoteForm";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { id, noteId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const note = await prisma.dailyNote.findUnique({
    where: { id: noteId },
    include: {
      patient: true,
      hourlyNotes: {
        orderBy: { hora: 'asc' },
      },
    },
  });

  if (!note || note.patientId !== id) {
    notFound();
  }

  if (note.patient.userId !== user.id) {
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
            href={`/patients/${id}/notes/${noteId}`}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Editar Anotação</h1>
            <p className="text-sm text-slate-500">{note.patient.nome}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <DailyNoteForm
            patientId={id}
            initialData={{
              id: note.id,
              data: note.data,
              horaDormiu: note.horaDormiu,
              horaAcordou: note.horaAcordou,
              humor: note.humor,
              detalhesExtras: note.detalhesExtras,
              tags: note.tags,
              hourlyNotes: note.hourlyNotes,
            }}
          />
        </div>
      </div>
    </div>
  );
}
