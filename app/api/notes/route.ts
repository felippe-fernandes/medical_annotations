import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseLocalDate } from "@/lib/dateUtils";
import { createClient } from "@/lib/supabase/server";

// POST - Criar nova anotação
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patientId, data, horaDormiu, horaAcordou, humor, detalhesExtras, tags } = body;

    if (!patientId || !data) {
      return NextResponse.json(
        { error: "PatientId e data são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar comprimento das tags (máximo 30 caracteres)
    if (tags && Array.isArray(tags)) {
      const invalidTag = tags.find((tag: string) => tag.length > 30);
      if (invalidTag) {
        return NextResponse.json(
          { error: "Cada tag deve ter no máximo 30 caracteres" },
          { status: 400 }
        );
      }
    }

    // Verificar se o paciente pertence ao usuário
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: user.id }
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe uma anotação para este dia
    const noteDate = parseLocalDate(data);
    const startOfDay = new Date(noteDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(noteDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingNote = await prisma.dailyNote.findFirst({
      where: {
        patientId,
        data: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingNote) {
      return NextResponse.json(
        { error: "Já existe uma anotação para este dia. Edite a anotação existente." },
        { status: 400 }
      );
    }

    const note = await prisma.dailyNote.create({
      data: {
        patientId,
        data: noteDate,
        horaDormiu: horaDormiu || null,
        horaAcordou: horaAcordou || null,
        humor: humor || null,
        detalhesExtras: detalhesExtras || null,
        tags: tags || [],
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar anotação" },
      { status: 500 }
    );
  }
}
