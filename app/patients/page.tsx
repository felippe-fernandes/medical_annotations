import { Logo } from "@/components/layout/Logo";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PatientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const patients = await prisma.patient.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { dailyNotes: true }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header with Logo */}
        <div className="mb-6">
          <Logo />
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">Pacientes</h1>
          <Link
            href="/patients/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Novo</span>
          </Link>
        </div>

        {/* Patients List */}
        {patients.length === 0 ? (
          <div className="bg-slate-800 rounded-lg shadow p-8 text-center">
            <p className="text-slate-500 mb-4">Nenhum paciente cadastrado ainda</p>
            <Link
              href="/patients/new"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <Plus size={20} />
              <span>Adicionar primeiro paciente</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient: any) => (
              <Link
                key={patient.id}
                href={`/patients/${patient.id}`}
                className="block bg-slate-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100">{patient.nome}</h3>
                    {patient.dataNascimento && (
                      <p className="text-sm text-slate-500">
                        {new Date(patient.dataNascimento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      {patient._count.dailyNotes} {patient._count.dailyNotes === 1 ? 'anotação' : 'anotações'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
