import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Criar nova anotação
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, data, horaDormiu, horaAcordou, humor, detalhesExtras, tags } = body;

    if (!patientId || !data) {
      return NextResponse.json(
        { error: "PatientId e data são obrigatórios" },
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
