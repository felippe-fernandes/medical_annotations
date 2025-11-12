import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";
import { sanitizeUserInput } from "@/lib/utils/security";

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
    const { patientId, startDate, endDate, tags } = body;

    if (!patientId) {
      return NextResponse.json(
        { error: "ID do paciente é obrigatório" },
        { status: 400 }
      );
    }

    // Construir filtros para a query
    const dateFilter = startDate && endDate ? {
      data: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    // Verificar se o paciente pertence ao usuário
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: user.id
      },
      include: {
        dailyNotes: {
          where: dateFilter,
          orderBy: { data: 'desc' },
          include: {
            hourlyNotes: {
              orderBy: { hora: 'asc' }
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

    // Filtrar notas por tags (se especificado)
    let filteredNotes = patient.dailyNotes;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      filteredNotes = filteredNotes.filter((note: any) => {
        // Incluir a nota se ela tiver pelo menos uma das tags selecionadas
        return note.tags.some((tag: string) => tags.includes(tag));
      });
    }

    if (filteredNotes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma anotação encontrada para os filtros selecionados" },
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

    // Preparar dados para a IA com sanitização (usando notas filtradas)
    const notesData = filteredNotes.map((note: any) => ({
      data: note.data.toISOString().split('T')[0],
      horaDormiu: note.horaDormiu,
      horaAcordou: note.horaAcordou,
      humor: note.humor ? ["Muito Ruim", "Ruim", "Neutro", "Bom", "Muito Bom"][note.humor - 1] : null,
      tags: note.tags.map((tag: string) => sanitizeUserInput(tag)),
      detalhesExtras: note.detalhesExtras ? sanitizeUserInput(note.detalhesExtras) : null,
      hourlyNotes: note.hourlyNotes.map((h: any) => ({
        hora: h.hora,
        descricao: sanitizeUserInput(h.descricao)
      }))
    }));

    // Inicializar cliente Groq
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    // Criar prompt para a IA com nome sanitizado
    const sanitizedPatientName = sanitizeUserInput(patient.nome);
    const prompt = `Você é um assistente médico especializado em organizar anotações neurológicas. Gere um relatório profissional e detalhado baseado nas anotações do paciente "${sanitizedPatientName}".

FORMATO DO RELATÓRIO (siga este modelo):

## RELATÓRIO DE ACOMPANHAMENTO NEUROLÓGICO

**Paciente:** ${sanitizedPatientName}
**Período:** [primeira data] a [última data]

---

### MINI RESUMO DO PERÍODO

| Métrica | Dados do Período |
| :--- | :--- |
| **Total de Dias com Registros** | X dias |
| **Padrão de Humor** | Descreva o padrão geral observado (ex: "Predomínio de humor bom/neutro"). Se não houver dados de humor, OMITA esta linha. |
| **Padrão de Sono** | Descreva os horários típicos de dormir e acordar. Se não houver dados, OMITA esta linha. |
| **Ajustes Medicamentosos** | Liste qualquer menção a medicamentos ou ajustes. Se não houver, OMITA esta linha completamente. |
| **Eventos Críticos** | Destaque APENAS eventos realmente importantes/críticos mencionados. Se não houver eventos críticos, OMITA esta linha completamente. |
| **Comportamento Geral** | Resumo objetivo do comportamento no período |

---

### DIÁRIO DE ACOMPANHAMENTO DETALHADO

Para cada dia com anotações, crie uma seção estruturada assim:

#### **[DD/MM]**
* **Rotina:** [Descreva horários de acordar, refeições, atividades do dia]
* **Comportamento:** [Descreva estados emocionais, interações, particularidades - APENAS se houver informações relevantes]
* **Saúde/Consultas:** [INCLUA esta seção APENAS se houver menções explícitas a consultas médicas, exames ou saúde]
* **Crises/Eventos:** [INCLUA esta seção APENAS se houver menção a crises, convulsões ou eventos médicos importantes]
* **Sono:** [Horário que dormiu e/ou acordou - APENAS se registrado]
* **Observações:** [INCLUA APENAS se houver observações adicionais relevantes das anotações horárias]

INSTRUÇÕES CRÍTICAS:
- **REGRA DE OURO**: NÃO inclua uma seção/linha se não houver dados para ela
- **Saúde/Consultas**: APENAS se o dia tiver consulta médica, exame ou evento de saúde
- **Eventos Críticos**: APENAS se houver algo realmente relevante (crises, surtos, etc)
- **Ajustes Medicamentosos**: APENAS se medicação for mencionada
- Use APENAS informações presentes nas anotações fornecidas
- Seja fiel ao conteúdo original, organize mas não invente
- Se uma seção inteira não tiver dados em NENHUM dia, OMITA o título da seção
- Mantenha o tom profissional mas humano
- Organize as informações horárias dentro do contexto do dia
- Use as tags para identificar eventos especiais (consulta médica, exames, etc)
- Formate datas no padrão brasileiro (DD/MM)

ANOTAÇÕES DO PACIENTE:
${JSON.stringify(notesData, null, 2)}

Gere o relatório completo seguindo o formato acima, sendo fiel às informações registradas.`;

    // Chamar API do Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um assistente médico especializado em gerar relatórios neurológicos profissionais. Organize as informações de forma clara, estruturada e fiel ao conteúdo original. Use formato markdown para melhor legibilidade."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Modelo gratuito e rápido
      temperature: 0.3, // Ligeiramente criativo para organização mas fiel aos dados
      max_tokens: 4000, // Aumentado para relatórios mais completos
    });

    const resumo = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({
      resumo,
      patientName: patient.nome,
      notesCount: filteredNotes.length,
      period: startDate && endDate ? {
        start: startDate,
        end: endDate
      } : null,
      filters: {
        tags: tags && tags.length > 0 ? tags : null
      }
    });

  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return NextResponse.json(
      { error: "Erro ao gerar resumo com IA" },
      { status: 500 }
    );
  }
}
