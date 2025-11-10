import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Este endpoint foi descontinuado
// Tags agora são strings simples armazenadas como array em DailyNote.tags
// Não há mais uma tabela separada para tags

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  // Retornar array vazio para compatibilidade
  // O frontend deve usar tags diretamente dos inputs
  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint descontinuado - tags são criadas diretamente nas anotações" },
    { status: 410 } // 410 Gone
  );
}
