import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE - Deletar registro horário
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; hourlyId: string }> }
) {
  try {
    const { hourlyId } = await params;

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
