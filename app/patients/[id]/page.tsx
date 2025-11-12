import { prisma } from "@/lib/prisma";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StartDailyNote } from "@/components/notes/StartDailyNote";
import { Logo } from "@/components/layout/Logo";
import { ExportPDFButton } from "@/components/pdf/ExportPDFButton";
import { GerarResumoIAButton } from "@/components/ai/GerarResumoIAButton";
import { NotesFilterView } from "@/components/notes/NotesFilterView";
import { createClient } from "@/lib/supabase/server";

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
            <div className="flex gap-3">
              <ExportPDFButton
                patient={{
                  nome: patient.nome,
                  dataNascimento: patient.dataNascimento,
                  dailyNotes: patient.dailyNotes.map((note: any) => ({
                    id: note.id,
                    data: note.data,
                    horaDormiu: note.horaDormiu,
                    horaAcordou: note.horaAcordou,
                    humor: note.humor,
                    detalhesExtras: note.detalhesExtras,
                    tags: note.tags,
                    hourlyNotes: note.hourlyNotes.map((hn: any) => ({
                      hora: hn.hora,
                      descricao: hn.descricao,
                    })),
                  })),
                }}
              />
              <GerarResumoIAButton
                patientId={id}
                patientName={patient.nome}
              />
            </div>
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
          <NotesFilterView
            patientId={id}
            dailyNotes={patient.dailyNotes.map((note: any) => ({
              id: note.id,
              data: note.data,
              horaDormiu: note.horaDormiu,
              horaAcordou: note.horaAcordou,
              humor: note.humor,
              detalhesExtras: note.detalhesExtras,
              tags: note.tags,
              hourlyNotes: note.hourlyNotes.map((hn: any) => ({
                hora: hn.hora,
                descricao: hn.descricao,
              })),
            }))}
          />
        )}
      </div>
    </div>
  );
}
