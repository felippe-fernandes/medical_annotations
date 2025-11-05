import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// GET /api/tags - Listar todas as tags
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const tags = await prisma.tag.findMany({
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { dailyNotes: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Criar nova tag
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, cor } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Nome da tag é obrigatório" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        nome,
        cor: cor || "#3B82F6",
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);

    // Verificar se é erro de duplicação
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe uma tag com este nome" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar tag" },
      { status: 500 }
    );
  }
}
