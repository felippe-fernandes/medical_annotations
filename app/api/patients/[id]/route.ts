import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar paciente por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
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

// PUT - Atualizar paciente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, dataNascimento } = body;

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

// DELETE - Deletar paciente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
