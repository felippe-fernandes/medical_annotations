"use client";

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface HourlyNote {
  hora: string;
  descricao: string;
}

interface DailyNote {
  id: string;
  data: Date;
  horaDormiu: string | null;
  horaAcordou: string | null;
  humor: number | null;
  detalhesExtras: string | null;
  tags: string[];
  hourlyNotes: HourlyNote[];
}

interface NotesCalendarViewProps {
  patientId: string;
  dailyNotes: DailyNote[];
}

// Função helper para parsear datas evitando problemas de timezone
function parseLocalDate(date: Date | string): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(year, month, day);
  }

  const dateStr = date.toString();
  if (dateStr.includes('-') && dateStr.includes('T')) {
    const [datePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}

// Helper para calcular informações do dia
function getDayInfo(notes: DailyNote[]) {
  if (notes.length === 0) return null;

  // Calcular humor médio
  const humoresValidos = notes.filter(n => n.humor !== null).map(n => n.humor!);
  const humorMedio = humoresValidos.length > 0
    ? Math.round(humoresValidos.reduce((sum, h) => sum + h, 0) / humoresValidos.length)
    : null;

  // Pegar horários de sono (primeira nota com horários)
  const notaComSono = notes.find(n => n.horaAcordou || n.horaDormiu);
  const horaAcordou = notaComSono?.horaAcordou;
  const horaDormiu = notaComSono?.horaDormiu;

  return { humorMedio, horaAcordou, horaDormiu };
}

// Emoji de humor baseado no valor
function getHumorEmoji(humor: number): string {
  const emojis = ["😢", "😟", "😐", "🙂", "😄"];
  return emojis[humor - 1] || "😐";
}

export function NotesCalendarView({ patientId, dailyNotes }: NotesCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  // Criar mapa de notas por data
  const notesByDate = useMemo(() => {
    const map = new Map<string, DailyNote[]>();
    dailyNotes.forEach((note) => {
      const noteDate = parseLocalDate(note.data);
      const dateKey = format(noteDate, "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(note);
    });
    return map;
  }, [dailyNotes]);

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-100">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md bg-slate-700 border border-slate-600">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-9 w-12 items-center justify-center rounded-l-md text-slate-400 hover:text-slate-100 hover:bg-slate-600 transition-colors"
            >
              <span className="sr-only">Mês anterior</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="hidden px-3.5 text-sm font-semibold text-slate-100 hover:bg-slate-600 transition-colors md:block"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-12 items-center justify-center rounded-r-md text-slate-400 hover:text-slate-100 hover:bg-slate-600 transition-colors"
            >
              <span className="sr-only">Próximo mês</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 bg-slate-900">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-px border-b border-slate-700 bg-slate-800 text-center text-xs font-semibold text-slate-400">
          <div className="bg-slate-900 py-2">Dom</div>
          <div className="bg-slate-900 py-2">Seg</div>
          <div className="bg-slate-900 py-2">Ter</div>
          <div className="bg-slate-900 py-2">Qua</div>
          <div className="bg-slate-900 py-2">Qui</div>
          <div className="bg-slate-900 py-2">Sex</div>
          <div className="bg-slate-900 py-2">Sáb</div>
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-slate-800 text-xs text-slate-300">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayNotes = notesByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const dayInfo = getDayInfo(dayNotes);

            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] bg-slate-900 px-2 py-2 ${
                  !isCurrentMonth ? "relative before:absolute before:inset-0 before:bg-slate-800/50" : ""
                }`}
              >
                <time
                  dateTime={format(day, "yyyy-MM-dd")}
                  className={`relative inline-flex items-center justify-center w-6 h-6 ${
                    isToday
                      ? "rounded-full bg-blue-500 font-semibold text-white"
                      : isCurrentMonth
                      ? "text-slate-100"
                      : "text-slate-500"
                  }`}
                >
                  {format(day, "d")}
                </time>

                {dayNotes.length > 0 && dayInfo && (
                  <div className="mt-1 space-y-1">
                    {/* Humor médio */}
                    {dayInfo.humorMedio && (
                      <Link
                        href={`/patients/${patientId}/notes/${dayNotes[0].id}`}
                        className="block rounded px-1.5 py-0.5 text-xs font-medium bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                      >
                        <span className="mr-1">{getHumorEmoji(dayInfo.humorMedio)}</span>
                        Humor: {dayInfo.humorMedio}/5
                      </Link>
                    )}

                    {/* Horários de sono */}
                    {(dayInfo.horaAcordou || dayInfo.horaDormiu) && (
                      <Link
                        href={`/patients/${patientId}/notes/${dayNotes[0].id}`}
                        className="block rounded px-1.5 py-0.5 text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                      >
                        {dayInfo.horaAcordou && (
                          <div className="flex items-center gap-1 truncate">
                            <Sun size={12} className="text-amber-300 flex-shrink-0" />
                            <span>{dayInfo.horaAcordou}</span>
                          </div>
                        )}
                        {dayInfo.horaDormiu && (
                          <div className="flex items-center gap-1 truncate">
                            <Moon size={12} className="text-blue-200 flex-shrink-0" />
                            <span>{dayInfo.horaDormiu}</span>
                          </div>
                        )}
                      </Link>
                    )}

                    {/* Indicador de múltiplas notas */}
                    {dayNotes.length > 1 && (
                      <div className="text-xs text-slate-400 px-1.5">
                        {dayNotes.length} anotações
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
