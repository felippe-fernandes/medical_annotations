import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { startOfDay, subDays } from "date-fns";

export async function GET(request: Request) {
  // Verificar autenticação
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Obter parâmetros de data da URL
  const { searchParams } = new URL(request.url);
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // Definir intervalo de datas (padrão: últimos 30 dias)
  const endDate = endDateParam ? new Date(endDateParam) : new Date();
  const startDate = startDateParam
    ? new Date(startDateParam)
    : startOfDay(subDays(endDate, 30));

  // Estatísticas gerais (sem filtro de data)
  const totalPatients = await prisma.patient.count({
    where: { userId: user.id },
  });

  const totalNotes = await prisma.dailyNote.count({
    where: {
      patient: { userId: user.id },
    },
  });

  const totalHourlyNotes = await prisma.hourlyNote.count({
    where: {
      dailyNote: {
        patient: { userId: user.id },
      },
    },
  });

  // Estatísticas filtradas por data
  const filteredNotes = await prisma.dailyNote.count({
    where: {
      patient: { userId: user.id },
      data: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Anotações de hoje
  const today = startOfDay(new Date());
  const todayNotes = await prisma.dailyNote.count({
    where: {
      patient: { userId: user.id },
      data: {
        gte: today,
      },
    },
  });

  // Últimos 7 dias
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
  const recentNotes = await prisma.dailyNote.count({
    where: {
      patient: { userId: user.id },
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Média de humor no período selecionado
  const notesWithHumor = await prisma.dailyNote.findMany({
    where: {
      patient: { userId: user.id },
      data: {
        gte: startDate,
        lte: endDate,
      },
      humor: {
        not: null,
      },
    },
    select: {
      humor: true,
    },
  });

  const avgHumor =
    notesWithHumor.length > 0
      ? (
          notesWithHumor.reduce((sum, note) => sum + (note.humor || 0), 0) /
          notesWithHumor.length
        ).toFixed(1)
      : null;

  // Últimas anotações (limitado ao período)
  const latestNotes = await prisma.dailyNote.findMany({
    where: {
      patient: { userId: user.id },
      data: {
        gte: startDate,
        lte: endDate,
      },
    },
    take: 5,
    orderBy: { data: "desc" },
    include: {
      patient: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Pacientes com mais anotações no período
  const patientsWithNotes = await prisma.patient.findMany({
    where: {
      userId: user.id,
      dailyNotes: {
        some: {
          data: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
    take: 5,
    orderBy: {
      dailyNotes: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: {
          dailyNotes: {
            where: {
              data: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    totalPatients,
    totalNotes,
    totalHourlyNotes,
    filteredNotes,
    todayNotes,
    recentNotes,
    avgHumor,
    latestNotes,
    patientsWithNotes,
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  });
}
