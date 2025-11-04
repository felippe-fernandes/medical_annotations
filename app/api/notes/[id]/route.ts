import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar anotação por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const note = await prisma.dailyNote.findUnique({
      where: { id },
      include: {
        patient: true,
        hourlyNotes: {
          orderBy: { hora: 'asc' }
        }
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar anotação" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar anotação
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, horaDormiu, horaAcordou, humor, detalhesExtras, tags } = body;

    const note = await prisma.dailyNote.update({
      where: { id },
      data: {
        data: data ? new Date(data) : undefined,
        horaDormiu: horaDormiu || null,
        horaAcordou: horaAcordou || null,
        humor: humor || null,
        detalhesExtras: detalhesExtras || null,
        tags: tags !== undefined ? tags : undefined,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar anotação" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar anotação
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dailyNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar anotação" },
      { status: 500 }
    );
  }
}
