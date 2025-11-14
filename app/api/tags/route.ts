import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This endpoint has been discontinued
// Tags are now simple strings stored as an array in DailyNote.tags
// There is no longer a separate table for tags

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }

  return NextResponse.json([]);
}

export async function POST() {
  return NextResponse.json(
    { error: "Endpoint descontinuado - tags são criadas diretamente nas anotações" },
    { status: 410 }
  );
}
