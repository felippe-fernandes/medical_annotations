import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET - Buscar anotação por ID
export async function GET(
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
    const note = await prisma.dailyNote.findUnique({
      where: { id },
      include: {
        patient: true,
        hourlyNotes: {
          orderBy: { hora: 'asc' }
        },
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se o paciente pertence ao usuário
    if (note.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
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
    const { data, horaDormiu, horaAcordou, humor, detalhesExtras, tags } = body;

    // Verificar se a nota existe e pertence ao usuário
    const existingNote = await prisma.dailyNote.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    }

    if (existingNote.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const updateData: any = {
      data: data ? new Date(data) : undefined,
      horaDormiu: horaDormiu !== undefined ? horaDormiu : undefined,
      horaAcordou: horaAcordou !== undefined ? horaAcordou : undefined,
      humor: humor !== undefined ? humor : undefined,
      detalhesExtras: detalhesExtras !== undefined ? detalhesExtras : undefined,
      tags: tags !== undefined ? tags : undefined,
    };

    const note = await prisma.dailyNote.update({
      where: { id },
      data: updateData,
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verificar se a nota existe e pertence ao usuário
    const existingNote = await prisma.dailyNote.findUnique({
      where: { id },
      include: { patient: true }
    });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Anotação não encontrada" },
        { status: 404 }
      );
    }

    if (existingNote.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

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
