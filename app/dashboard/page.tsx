import { prisma } from "@/lib/prisma";
import { Users, FileText, Clock, TrendingUp, Calendar, Activity } from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Logo } from "@/components/layout/Logo";

export default async function DashboardPage() {
  // Estatísticas gerais
  const totalPatients = await prisma.patient.count();
  const totalNotes = await prisma.dailyNote.count();
  const totalHourlyNotes = await prisma.hourlyNote.count();

  // Anotações dos últimos 7 dias
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const recentNotes = await prisma.dailyNote.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Anotações de hoje
  const today = startOfDay(new Date());
  const todayNotes = await prisma.dailyNote.count({
    where: {
      data: {
        gte: today,
      },
    },
  });

  // Média de humor (últimos 30 dias)
  const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
  const notesWithHumor = await prisma.dailyNote.findMany({
    where: {
      data: {
        gte: thirtyDaysAgo,
      },
      humor: {
        not: null,
      },
    },
    select: {
      humor: true,
    },
  });

  const avgHumor = notesWithHumor.length > 0
    ? (notesWithHumor.reduce((sum, note) => sum + (note.humor || 0), 0) / notesWithHumor.length).toFixed(1)
    : null;

  // Últimas anotações
  const latestNotes = await prisma.dailyNote.findMany({
    take: 5,
    orderBy: { data: 'desc' },
    include: {
      patient: true,
    },
  });

  // Pacientes com mais anotações
  const patientsWithNotes = await prisma.patient.findMany({
    take: 5,
    orderBy: {
      dailyNotes: {
        _count: 'desc',
      },
    },
    include: {
      _count: {
        select: { dailyNotes: true },
      },
    },
  });

  const humorEmojis = ["😢", "😟", "😐", "🙂", "😄"];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header with Logo */}
        <div className="mb-6">
          <Logo />
          <p className="text-slate-400 mt-4">Visão geral do sistema de anotações médicas</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Pacientes */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-950 rounded-lg">
                <Users size={24} className="text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{totalPatients}</span>
            </div>
            <p className="text-sm text-slate-400">Pacientes</p>
            <Link href="/patients" className="text-xs text-blue-400 hover:underline mt-2 block">
              Ver todos →
            </Link>
          </div>

          {/* Total Anotações */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-950 rounded-lg">
                <FileText size={24} className="text-green-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{totalNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Anotações</p>
          </div>

          {/* Registros Horários */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-950 rounded-lg">
                <Clock size={24} className="text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{totalHourlyNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Registros Horários</p>
          </div>

          {/* Anotações de Hoje */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-cyan-950 rounded-lg">
                <Calendar size={24} className="text-cyan-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{todayNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Hoje</p>
          </div>

          {/* Últimos 7 dias */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-amber-950 rounded-lg">
                <TrendingUp size={24} className="text-amber-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{recentNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Últimos 7 dias</p>
          </div>

          {/* Média de Humor */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-pink-950 rounded-lg">
                <Activity size={24} className="text-pink-400" />
              </div>
              {avgHumor ? (
                <span className="text-3xl font-bold text-slate-100">{avgHumor}</span>
              ) : (
                <span className="text-2xl text-slate-500">-</span>
              )}
            </div>
            <p className="text-sm text-slate-400">Humor Médio</p>
            <p className="text-xs text-slate-600 mt-1">últimos 30 dias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Anotações */}
          <div className="bg-slate-800 rounded-lg shadow">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Últimas Anotações</h2>
            </div>
            <div className="p-6">
              {latestNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma anotação ainda</p>
              ) : (
                <div className="space-y-4">
                  {latestNotes.map((note) => (
                    <Link
                      key={note.id}
                      href={`/patients/${note.patientId}/notes/${note.id}`}
                      className="block p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-100">{note.patient.nome}</p>
                          <p className="text-sm text-slate-500">
                            {format(new Date(note.data), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                        {note.humor && (
                          <span className="text-2xl">{humorEmojis[note.humor - 1]}</span>
                        )}
                      </div>
                      {note.detalhesExtras && (
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {note.detalhesExtras}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pacientes com Mais Anotações */}
          <div className="bg-slate-800 rounded-lg shadow">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Pacientes Ativos</h2>
            </div>
            <div className="p-6">
              {patientsWithNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum paciente cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {patientsWithNotes.map((patient) => (
                    <Link
                      key={patient.id}
                      href={`/patients/${patient.id}`}
                      className="flex items-center justify-between p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-slate-100">{patient.nome}</p>
                        {patient.dataNascimento && (
                          <p className="text-xs text-slate-500">
                            {format(new Date(patient.dataNascimento), "dd/MM/yyyy")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">
                          {patient._count.dailyNotes}
                        </p>
                        <p className="text-xs text-slate-500">anotações</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ação Rápida */}
        <div className="mt-6">
          <Link
            href="/patients"
            className="block w-full bg-blue-600 text-white text-center py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Ver Todos os Pacientes
          </Link>
        </div>
      </div>
    </div>
  );
}
