"use client";

import { format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronDown, ChevronRight, Moon, Search, Sun, Tag, X, List, Calendar } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { NotesCalendarView } from "./NotesCalendarView";
import { parseDateToLocal } from "@/lib/dateUtils";
import type { DailyNote } from "@/lib/types";

interface NotesFilterViewProps {
  patientId: string;
  dailyNotes: DailyNote[];
}

const humorEmojis = ["😢", "😟", "😐", "🙂", "😄"];

export function NotesFilterView({ patientId, dailyNotes }: NotesFilterViewProps) {
  const today = startOfDay(new Date());
  const currentMonthKey = format(today, "yyyy-MM");

  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([currentMonthKey]));
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Extrair todas as tags únicas
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    dailyNotes.forEach((note) => {
      note.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [dailyNotes]);

  // Filtrar notas
  const filteredNotes = useMemo(() => {
    return dailyNotes.filter((note) => {
      // Filtro de tag
      if (selectedTag && !note.tags.includes(selectedTag)) {
        return false;
      }

      // Filtro de busca de texto
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesDetails = note.detalhesExtras?.toLowerCase().includes(searchLower);
        const matchesHourly = note.hourlyNotes.some((hn) =>
          hn.descricao.toLowerCase().includes(searchLower)
        );
        const matchesTags = note.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );

        if (!matchesDetails && !matchesHourly && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [dailyNotes, selectedTag, searchText]);

  // Agrupar notas por mês
  const notesByMonth = useMemo(() => {
    const grouped = new Map<string, DailyNote[]>();

    filteredNotes.forEach((note) => {
      const noteDate = parseDateToLocal(note.data);
      const monthKey = format(noteDate, "yyyy-MM");

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(note);
    });

    // Converter para array e ordenar por mês (mais recente primeiro)
    return Array.from(grouped.entries())
      .map(([key, notes]) => {
        // Usar a primeira nota do mês para gerar o label (evita problemas de timezone)
        const firstNote = notes[0];
        const noteDate = parseDateToLocal(firstNote.data);
        const month = format(noteDate, "MMMM", { locale: ptBR }).toLowerCase();
        const year = format(noteDate, "yyyy", { locale: ptBR });
        const monthLabel = `${month} de ${year}`;

        return {
          monthKey: key,
          monthLabel,
          notes,
        };
      })
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredNotes]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedMonths(new Set(notesByMonth.map((m) => m.monthKey)));
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
  };

  const hasActiveFilters = searchText || selectedTag;

  return (
    <div className="space-y-4">
      {/* Barra de visualização */}
      <div className="flex items-center justify-between bg-slate-800 rounded-lg shadow px-4 py-3">
        <h3 className="text-sm font-medium text-slate-300">Visualização</h3>
        <div className="flex items-center rounded-lg bg-slate-700 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <List size={16} />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Calendário</span>
          </button>
        </div>
      </div>

      {/* Filtros - apenas para listagem */}
      {viewMode === "list" && (
        <div className="bg-slate-800 rounded-lg shadow p-4 space-y-3">
        {/* Busca de texto */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Buscar em anotações..."
            className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filtro de tag */}
        {allTags.length > 0 && (
          <div className="relative">
            <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Botão para limpar filtros */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchText("");
              setSelectedTag("");
            }}
            className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Limpar filtros
          </button>
        )}

        {/* Contador de resultados */}
        <div className="text-sm text-slate-400 text-center">
          {filteredNotes.length} {filteredNotes.length === 1 ? "anotação encontrada" : "anotações encontradas"}
        </div>
        </div>
      )}

      {/* Visualização de calendário */}
      {viewMode === "calendar" && (
        <NotesCalendarView patientId={patientId} dailyNotes={dailyNotes} />
      )}

      {/* Controles de expansão - apenas para listagem */}
      {viewMode === "list" && notesByMonth.length > 1 && (
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="flex-1 py-2 text-sm text-slate-400 hover:text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Expandir todos
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 py-2 text-sm text-slate-400 hover:text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Recolher todos
          </button>
        </div>
      )}

      {/* Lista de anotações agrupadas por mês - apenas para listagem */}
      {viewMode === "list" && filteredNotes.length === 0 ? (
        <div className="bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-slate-500 mb-2">
            {hasActiveFilters ? "Nenhuma anotação encontrada" : "Nenhuma anotação ainda"}
          </p>
          {hasActiveFilters && (
            <p className="text-slate-400 text-sm">Tente ajustar os filtros</p>
          )}
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {notesByMonth.map(({ monthKey, monthLabel, notes }) => {
            const isExpanded = expandedMonths.has(monthKey);

            return (
              <div key={monthKey} className="bg-slate-800 rounded-lg shadow overflow-hidden">
                {/* Cabeçalho do mês */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={20} className="text-slate-400" />
                    )}
                    <h3 className="text-lg font-semibold text-slate-100 capitalize">
                      {monthLabel}
                    </h3>
                  </div>
                  <span className="text-sm text-slate-400">
                    {notes.length} {notes.length === 1 ? "anotação" : "anotações"}
                  </span>
                </button>

                {/* Anotações do mês */}
                {isExpanded && (
                  <div className="border-t border-slate-700">
                    {notes.map((note) => {
                      const noteDate = parseDateToLocal(note.data);
                      const noteDateStartOfDay = startOfDay(noteDate);
                      const isToday = noteDateStartOfDay.getTime() === today.getTime();

                      return (
                        <Link
                          key={note.id}
                          href={`/patients/${patientId}/notes/${note.id}`}
                          className={`block p-4 hover:bg-slate-700 transition-colors border-l-4 ${isToday ? "border-blue-500 bg-slate-750" : "border-transparent"
                            }`}
                        >
                          {/* Data */}
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-semibold text-slate-100">
                              {format(noteDate, "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(noteDate, "EEEE", { locale: ptBR })}
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
                              {note.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs ${tag === selectedTag
                                    ? "bg-blue-500 text-white"
                                    : "bg-blue-600 text-white"
                                    }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Registros Horários */}
                          {note.hourlyNotes.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                              <p className="text-xs text-slate-500">
                                {note.hourlyNotes.length}{" "}
                                {note.hourlyNotes.length === 1 ? "registro horário" : "registros horários"}
                              </p>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
