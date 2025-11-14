import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Get patient by ID
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
    const patient = await prisma.patient.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        dailyNotes: {
          orderBy: { data: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar paciente" },
      { status: 500 }
    );
  }
}

// PUT - Update patient
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
    const { nome, dataNascimento } = body;

    const existingPatient = await prisma.patient.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        nome,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao atualizar paciente" },
      { status: 500 }
    );
  }
}

// DELETE - Delete patient
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

    const existingPatient = await prisma.patient.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingPatient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar paciente" },
      { status: 500 }
    );
  }
}
