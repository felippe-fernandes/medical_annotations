import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PUT - Update medication (logs changes)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { nome, dosagem, frequencia, observacoes, ativo, motivo } = body;

  const existingMed = await prisma.medication.findUnique({
    where: { id },
    include: { patient: true },
  });

  if (!existingMed || existingMed.patient.userId !== user.id) {
    return NextResponse.json({ error: "Medicamento não encontrado" }, { status: 404 });
  }

  const changes: any[] = [];

  if (nome && nome !== existingMed.nome) {
    changes.push({
      campo: "nome",
      valorAnterior: existingMed.nome,
      valorNovo: nome,
      motivo,
    });
  }

  if (dosagem && dosagem !== existingMed.dosagem) {
    changes.push({
      campo: "dosagem",
      valorAnterior: existingMed.dosagem,
      valorNovo: dosagem,
      motivo,
    });
  }

  if (frequencia && frequencia !== existingMed.frequencia) {
    changes.push({
      campo: "frequencia",
      valorAnterior: existingMed.frequencia,
      valorNovo: frequencia,
      motivo,
    });
  }

  if (observacoes !== undefined && observacoes !== existingMed.observacoes) {
    changes.push({
      campo: "observacoes",
      valorAnterior: existingMed.observacoes || "",
      valorNovo: observacoes,
      motivo,
    });
  }

  if (ativo !== undefined && ativo !== existingMed.ativo) {
    changes.push({
      campo: "ativo",
      valorAnterior: existingMed.ativo.toString(),
      valorNovo: ativo.toString(),
      motivo: motivo || (ativo ? "Reativado" : "Desativado"),
    });
  }

  const medication = await prisma.medication.update({
    where: { id },
    data: {
      ...(nome && { nome }),
      ...(dosagem && { dosagem }),
      ...(frequencia && { frequencia }),
      ...(observacoes !== undefined && { observacoes }),
      ...(ativo !== undefined && { ativo }),
      ...(changes.length > 0 && {
        changes: {
          create: changes,
        },
      }),
    },
    include: {
      changes: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json(medication);
}

// DELETE - Delete medication
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const existingMed = await prisma.medication.findUnique({
    where: { id },
    include: { patient: true },
  });

  if (!existingMed || existingMed.patient.userId !== user.id) {
    return NextResponse.json({ error: "Medicamento não encontrado" }, { status: 404 });
  }

  await prisma.medication.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
