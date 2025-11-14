import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sanitizeUserInput, validateHumor, validateTags } from "@/lib/utils/security";
import { NextResponse } from "next/server";

// GET - Get note by ID
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

    if (note.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("[API] Erro ao buscar anotação:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Erro ao buscar anotação" },
      { status: 500 }
    );
  }
}

// PUT - Update note
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

    if (tags && Array.isArray(tags)) {
      const validation = validateTags(tags);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    if (humor !== undefined && humor !== null && !validateHumor(humor)) {
      return NextResponse.json(
        { error: "Humor deve ser um número entre 1 e 5" },
        { status: 400 }
      );
    }

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
      detalhesExtras: detalhesExtras !== undefined ? sanitizeUserInput(detalhesExtras) : undefined,
      tags: tags !== undefined ? tags.map((tag: string) => sanitizeUserInput(tag)) : undefined,
    };

    const note = await prisma.dailyNote.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[API] Erro ao atualizar anotação:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Erro ao atualizar anotação" },
      { status: 500 }
    );
  }
}

// DELETE - Delete note
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
    console.error("[API] Erro ao deletar anotação:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json(
      { error: "Erro ao deletar anotação" },
      { status: 500 }
    );
  }
}
