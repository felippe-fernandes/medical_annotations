import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar novo registro horário
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hora, descricao } = body;

    if (!hora || !descricao) {
      return NextResponse.json(
        { error: "Hora e descrição são obrigatórios" },
        { status: 400 }
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
