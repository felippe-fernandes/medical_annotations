import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os pacientes
export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { dailyNotes: true }
        }
      }
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar pacientes" },
      { status: 500 }
    );
  }
}

// POST - Criar novo paciente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, dataNascimento } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.create({
      data: {
        nome,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar paciente" },
      { status: 500 }
    );
  }
}
