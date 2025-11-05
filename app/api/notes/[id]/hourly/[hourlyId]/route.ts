import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// DELETE - Deletar registro horário
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; hourlyId: string }> }
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

    const { hourlyId } = await params;

    // Verificar se o registro horário existe e pertence ao usuário
    const hourlyNote = await prisma.hourlyNote.findUnique({
      where: { id: hourlyId },
      include: {
        dailyNote: {
          include: {
            patient: true
          }
        }
      }
    });

    if (!hourlyNote) {
      return NextResponse.json(
        { error: "Registro horário não encontrado" },
        { status: 404 }
      );
    }

    if (hourlyNote.dailyNote.patient.userId !== user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    await prisma.hourlyNote.delete({
      where: { id: hourlyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao deletar registro horário" },
      { status: 500 }
    );
  }
}
