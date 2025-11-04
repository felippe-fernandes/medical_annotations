import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar nova anotação
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, data, horaDormiu, horaAcordou, humor, detalhesExtras, tagIds } = body;

    if (!patientId || !data) {
      return NextResponse.json(
        { error: "PatientId e data são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe uma anotação para este dia
    const noteDate = new Date(data);
    const startOfDay = new Date(noteDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(noteDate.setHours(23, 59, 59, 999));

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
        data: new Date(data),
        horaDormiu: horaDormiu || null,
        horaAcordou: horaAcordou || null,
        humor: humor || null,
        detalhesExtras: detalhesExtras || null,
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
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
