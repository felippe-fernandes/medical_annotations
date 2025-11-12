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
    const prompt = `Você é um assistente médico. Sua função é APENAS ORGANIZAR e TRANSCREVER fielmente as anotações médicas do paciente "${patient.nome}", sem fazer interpretações, inferências ou sugestões.

INSTRUÇÕES IMPORTANTES:
- NÃO interprete ou infira informações que não estão explícitas nas anotações
- NÃO faça sugestões ou recomendações médicas
- NÃO tire conclusões além do que está escrito
- APENAS organize e estruture as informações existentes de forma clara
- Seja 100% fiel ao conteúdo original

ANOTAÇÕES MÉDICAS:
${JSON.stringify(notesData, null, 2)}

Por favor, organize as informações acima de forma estruturada e fidedigna:

1. **Resumo do Período**: Liste objetivamente as datas e informações registradas
2. **Registro de Sono**: Transcreva os horários de sono e acordar registrados
3. **Registro de Humor**: Transcreva os registros de humor exatamente como registrados
4. **Eventos Médicos**: Liste as tags e eventos registrados (consultas, exames, etc.)
5. **Anotações Detalhadas**: Transcreva fielmente os detalhes extras e observações horárias

IMPORTANTE: Use apenas as informações presentes nas anotações. Não adicione interpretações pessoais ou médicas. Mantenha o texto objetivo e factual.`;

    // Chamar API do Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um assistente de organização de anotações médicas. Sua função é APENAS transcrever e organizar informações fielmente, sem fazer interpretações ou sugestões. Seja 100% fiel ao conteúdo original."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Modelo gratuito e rápido
      temperature: 0.1, // Muito determinístico para contexto médico - transcrição fiel
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
