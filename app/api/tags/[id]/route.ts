import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/tags/[id] - Deletar tag
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tag deletada com sucesso" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Erro ao deletar tag" },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Atualizar tag
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, cor } = body;

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        nome: nome || undefined,
        cor: cor || undefined,
      },
    });

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error("Error updating tag:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma tag com este nome" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar tag" },
      { status: 500 }
    );
  }
}
