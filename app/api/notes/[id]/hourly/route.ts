import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// POST - Criar novo registro horário
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { hora, descricao } = body;

    if (!hora || !descricao) {
      return NextResponse.json(
        { error: "Hora e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a anotação diária existe e pertence ao usuário
    const dailyNote = await prisma.dailyNote.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!dailyNote) {
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    }

    if (dailyNote.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const hourlyNote = await prisma.hourlyNote.create({
      data: {
        dailyNoteId: id,
        hora,
        descricao,
      },
    });

    return NextResponse.json(hourlyNote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar registro horário" },
      { status: 500 }
    );
  }
}
