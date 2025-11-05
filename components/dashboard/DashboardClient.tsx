"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Users, FileText, Clock, TrendingUp, Calendar, Activity, Filter } from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalPatients: number;
  totalNotes: number;
  totalHourlyNotes: number;
  filteredNotes: number;
  todayNotes: number;
  recentNotes: number;
  avgHumor: string | null;
  latestNotes: any[];
  patientsWithNotes: any[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export function DashboardClient() {
  const [startDate, setStartDate] = useState<Date>(startOfDay(subDays(new Date(), 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const humorEmojis = ["😢", "😟", "😐", "🙂", "😄"];

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/dashboard/stats?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto p-4">
        {/* Filtro de Data */}
        <div className="bg-slate-800 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-slate-100">Filtrar Período</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Inicial
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => date && setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Data Final
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => date && setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Mostrando dados de{" "}
            <span className="font-medium text-slate-400">
              {format(startDate, "dd/MM/yyyy")}
            </span>{" "}
            até{" "}
            <span className="font-medium text-slate-400">
              {format(endDate, "dd/MM/yyyy")}
            </span>
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {/* Total Pacientes */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-950 rounded-lg">
                <Users size={24} className="text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{stats.totalPatients}</span>
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
              <span className="text-3xl font-bold text-slate-100">{stats.totalNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Anotações</p>
            <p className="text-xs text-slate-600 mt-1">total geral</p>
          </div>

          {/* Registros Horários */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-950 rounded-lg">
                <Clock size={24} className="text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{stats.totalHourlyNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Registros Horários</p>
            <p className="text-xs text-slate-600 mt-1">total geral</p>
          </div>

          {/* Anotações de Hoje */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-cyan-950 rounded-lg">
                <Calendar size={24} className="text-cyan-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{stats.todayNotes}</span>
            </div>
            <p className="text-sm text-slate-400">Hoje</p>
          </div>

          {/* No Período Selecionado */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-amber-950 rounded-lg">
                <TrendingUp size={24} className="text-amber-400" />
              </div>
              <span className="text-3xl font-bold text-slate-100">{stats.filteredNotes}</span>
            </div>
            <p className="text-sm text-slate-400">No Período</p>
          </div>

          {/* Média de Humor */}
          <div className="bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-pink-950 rounded-lg">
                <Activity size={24} className="text-pink-400" />
              </div>
              {stats.avgHumor ? (
                <span className="text-3xl font-bold text-slate-100">{stats.avgHumor}</span>
              ) : (
                <span className="text-2xl text-slate-500">-</span>
              )}
            </div>
            <p className="text-sm text-slate-400">Humor Médio</p>
            <p className="text-xs text-slate-600 mt-1">no período</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Anotações */}
          <div className="bg-slate-800 rounded-lg shadow">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-slate-100">Últimas Anotações</h2>
              <p className="text-xs text-slate-500 mt-1">no período selecionado</p>
            </div>
            <div className="p-6">
              {stats.latestNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhuma anotação no período</p>
              ) : (
                <div className="space-y-4">
                  {stats.latestNotes.map((note) => (
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
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.tags.map((dailyNoteTag: any) => (
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
              <p className="text-xs text-slate-500 mt-1">no período selecionado</p>
            </div>
            <div className="p-6">
              {stats.patientsWithNotes.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum paciente no período</p>
              ) : (
                <div className="space-y-3">
                  {stats.patientsWithNotes.map((patient) => (
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
