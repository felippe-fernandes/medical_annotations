import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - List all medications for a patient
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json(
      { error: "patientId é obrigatório" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient || patient.userId !== user.id) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const medications = await prisma.medication.findMany({
    where: { patientId },
    include: {
      changes: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: [
      { ativo: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(medications);
}

// POST - Create new medication
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { patientId, nome, dosagem, frequencia, observacoes } = body;

  if (!patientId || !nome || !dosagem || !frequencia) {
    return NextResponse.json(
      { error: "patientId, nome, dosagem e frequencia são obrigatórios" },
      { status: 400 }
    );
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient || patient.userId !== user.id) {
    return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
  }

  const medication = await prisma.medication.create({
    data: {
      patientId,
      nome,
      dosagem,
      frequencia,
      observacoes,
      changes: {
        create: {
          campo: "criacao",
          valorNovo: `${nome} - ${dosagem} - ${frequencia}`,
          motivo: "Medicamento adicionado",
        },
      },
    },
    include: {
      changes: true,
    },
  });

  return NextResponse.json(medication, { status: 201 });
}
