import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DailyNoteForm } from "@/components/notes/DailyNoteForm";
import { Logo } from "@/components/layout/Logo";

export default async function NewNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
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
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Nova Anotação</h1>
            <p className="text-sm text-slate-500">{patient.nome}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-lg shadow p-6">
          <DailyNoteForm patientId={id} />
        </div>
      </div>
    </div>
  );
}
