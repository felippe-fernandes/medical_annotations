import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

// POST - Gerar resumo com IA das anotações de um paciente
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
    const { patientId, startDate, endDate } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o paciente pertence ao usuário
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: user.id
      },
      include: {
        dailyNotes: {
          where: {
            ...(startDate && endDate ? {
              data: {
                gte: new Date(startDate),
                lte: new Date(endDate)
              }
            } : {})
          },
          orderBy: { data: 'desc' },
          include: {
            hourlyNotes: {
              orderBy: { hora: 'asc' }
            },
            tags: {
              include: {
                tag: true
              }
            }
          }
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      );
    }

    if (patient.dailyNotes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma anotação encontrada para o período selecionado" },
        { status: 400 }
      );
    }

    // Verificar se a chave da API está configurada
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Chave da API do Groq não configurada. Configure GROQ_API_KEY no arquivo .env" },
        { status: 500 }
      );
    }

    // Preparar dados para a IA
    const notesData = patient.dailyNotes.map((note: any) => ({
      data: note.data.toISOString().split('T')[0],
      horaDormiu: note.horaDormiu,
      horaAcordou: note.horaAcordou,
      humor: note.humor ? ["Muito Ruim", "Ruim", "Neutro", "Bom", "Muito Bom"][note.humor - 1] : null,
      tags: note.tags.map((t: any) => t.tag.nome),
      detalhesExtras: note.detalhesExtras,
      hourlyNotes: note.hourlyNotes.map((h: any) => ({
        hora: h.hora,
        descricao: h.descricao
      }))
    }));

    // Inicializar cliente Groq
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Criar prompt para a IA
    const prompt = `Você é um assistente médico especializado em análise de anotações clínicas. Analise as seguintes anotações do paciente "${patient.nome}" e forneça um resumo clínico detalhado e profissional.

ANOTAÇÕES:
${JSON.stringify(notesData, null, 2)}

Por favor, forneça um resumo estruturado contendo:

1. **Resumo Geral**: Um parágrafo resumindo o estado geral do paciente no período
2. **Padrões de Sono**: Análise dos horários de sono e acordar
3. **Estado Emocional**: Análise dos registros de humor
4. **Eventos Importantes**: Lista dos principais eventos médicos (consultas, exames, etc.) baseado nas tags
5. **Observações Relevantes**: Destaques das anotações horárias e detalhes extras
6. **Recomendações**: Sugestões para acompanhamento (se aplicável)

Formato: Use markdown para estruturar o resumo. Seja conciso mas informativo. Foque em aspectos clinicamente relevantes.`;

    // Chamar API do Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Modelo gratuito e rápido
      temperature: 0.3, // Mais determinístico para contexto médico
      max_tokens: 2000,
    });

    const resumo = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({
      resumo,
      patientName: patient.nome,
      notesCount: patient.dailyNotes.length,
      period: startDate && endDate ? {
        start: startDate,
        end: endDate
      } : null
    });

  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return NextResponse.json(
      { error: "Erro ao gerar resumo com IA" },
      { status: 500 }
    );
  }
}
