import { PrismaClient } from "@prisma/client";
import { subDays, format, addHours } from "date-fns";

const prisma = new PrismaClient();

// IMPORTANTE: O userId deve ser o ID do usuário teste@teste.com no Supabase
// Você pode obter este ID após criar o usuário no Supabase Auth
const DEMO_USER_ID = process.env.DEMO_USER_ID || "REPLACE_WITH_SUPABASE_USER_ID";

// Tags comuns para uso nas anotações
const COMMON_TAGS = [
  "ansiedade",
  "irritabilidade",
  "cansaço",
  "insônia",
  "dor de cabeça",
  "náusea",
  "tontura",
  "agitação",
  "tristeza",
  "euforia",
  "apetite aumentado",
  "apetite diminuído",
  "concentração",
  "esquecimento",
  "tremor",
  "sudorese",
];

// Função para gerar uma data aleatória dentro de um dia
function randomTime(hour: number) {
  const minutes = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// Função para selecionar tags aleatórias
function randomTags(count: number = 3) {
  const shuffled = [...COMMON_TAGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * count) + 1);
}

// Função para gerar humor aleatório (1-5, com tendência central)
function randomMood(): number {
  const rand = Math.random();
  if (rand < 0.1) return 1;
  if (rand < 0.25) return 2;
  if (rand < 0.6) return 3;
  if (rand < 0.85) return 4;
  return 5;
}

async function main() {
  console.log("🌱 Starting demo data seeding...");
  console.log(`📋 User ID: ${DEMO_USER_ID}`);

  if (DEMO_USER_ID === "REPLACE_WITH_SUPABASE_USER_ID") {
    console.error(
      "\n❌ ERROR: Please set DEMO_USER_ID environment variable with the Supabase user ID"
    );
    console.error(
      "   You can get this ID from Supabase Dashboard > Authentication > Users"
    );
    console.error(
      "   Run: DEMO_USER_ID=your-user-id npm run seed:demo\n"
    );
    process.exit(1);
  }

  // Limpar dados existentes deste usuário
  console.log("\n🧹 Cleaning existing demo data...");
  const existingPatients = await prisma.patient.findMany({
    where: { userId: DEMO_USER_ID },
  });

  for (const patient of existingPatients) {
    await prisma.patient.delete({ where: { id: patient.id } });
  }

  console.log("✅ Cleaned existing data");

  // Criar 3 pacientes
  console.log("\n👥 Creating patients...");

  const patient1 = await prisma.patient.create({
    data: {
      userId: DEMO_USER_ID,
      nome: "Maria Silva",
      dataNascimento: new Date("2010-03-15"),
    },
  });
  console.log(`   ✓ Created: ${patient1.nome}`);

  const patient2 = await prisma.patient.create({
    data: {
      userId: DEMO_USER_ID,
      nome: "João Santos",
      dataNascimento: new Date("1985-07-22"),
    },
  });
  console.log(`   ✓ Created: ${patient2.nome}`);

  const patient3 = await prisma.patient.create({
    data: {
      userId: DEMO_USER_ID,
      nome: "Ana Costa",
      dataNascimento: new Date("1950-11-08"),
    },
  });
  console.log(`   ✓ Created: ${patient3.nome}`);

  // Criar medicamentos para cada paciente
  console.log("\n💊 Creating medications...");

  // Medicamentos para Maria (TDAH)
  const med1 = await prisma.medication.create({
    data: {
      patientId: patient1.id,
      nome: "Metilfenidato",
      dosagem: "10mg",
      frequencia: "2x ao dia (manhã e meio-dia)",
      observacoes: "Tomar com alimentos",
      ativo: true,
    },
  });

  // Histórico de mudança de dosagem
  await prisma.medicationChange.create({
    data: {
      medicationId: med1.id,
      campo: "dosagem",
      valorAnterior: "5mg",
      valorNovo: "10mg",
      motivo: "Ajuste de dose após 2 semanas",
      createdAt: subDays(new Date(), 15),
    },
  });

  // Medicamentos para João (Ansiedade)
  const med2 = await prisma.medication.create({
    data: {
      patientId: patient2.id,
      nome: "Sertralina",
      dosagem: "50mg",
      frequencia: "1x ao dia (manhã)",
      observacoes: "Pode causar sonolência inicial",
      ativo: true,
    },
  });

  const med3 = await prisma.medication.create({
    data: {
      patientId: patient2.id,
      nome: "Clonazepam",
      dosagem: "0.5mg",
      frequencia: "SOS (em caso de crise)",
      observacoes: "Uso controlado",
      ativo: false,
    },
  });

  await prisma.medicationChange.create({
    data: {
      medicationId: med3.id,
      campo: "ativo",
      valorAnterior: "true",
      valorNovo: "false",
      motivo: "Paciente não apresenta mais crises agudas",
      createdAt: subDays(new Date(), 10),
    },
  });

  // Medicamentos para Ana (Depressão)
  const med4 = await prisma.medication.create({
    data: {
      patientId: patient3.id,
      nome: "Escitalopram",
      dosagem: "10mg",
      frequencia: "1x ao dia (noite)",
      observacoes: "Tomar sempre no mesmo horário",
      ativo: true,
    },
  });

  const med5 = await prisma.medication.create({
    data: {
      patientId: patient3.id,
      nome: "Zolpidem",
      dosagem: "5mg",
      frequencia: "1x ao dia (antes de dormir)",
      observacoes: "Apenas se necessário para dormir",
      ativo: true,
    },
  });

  console.log(`   ✓ Created medications for all patients`);

  // Gerar anotações diárias para os últimos 30 dias
  console.log("\n📝 Creating daily notes for the last 30 days...");

  const today = new Date();
  let totalNotes = 0;
  let totalHourlyNotes = 0;

  for (let i = 29; i >= 0; i--) {
    const noteDate = subDays(today, i);
    const dateStr = format(noteDate, "yyyy-MM-dd");

    // Nem todos os dias têm anotações (mais realista)
    const shouldCreateNote = Math.random() > 0.2; // 80% dos dias

    if (!shouldCreateNote && i > 5) continue; // Sempre criar nos últimos 5 dias

    // Anotação para Maria (mais frequente, criança em tratamento)
    if (Math.random() > 0.1) {
      const mood = randomMood();
      const tags = randomTags(4);

      const note1 = await prisma.dailyNote.create({
        data: {
          patientId: patient1.id,
          data: noteDate,
          horaDormiu: randomTime(21 + Math.floor(Math.random() * 2)),
          horaAcordou: randomTime(6 + Math.floor(Math.random() * 2)),
          humor: mood,
          tags,
          detalhesExtras:
            mood <= 2
              ? "Dia difícil. Dificuldade de concentração na escola."
              : mood >= 4
              ? "Boa evolução. Conseguiu completar as tarefas."
              : "Dia normal. Algumas dificuldades pela tarde.",
        },
      });
      totalNotes++;

      // Adicionar registros horários
      const hourlyCount = Math.floor(Math.random() * 3) + 1;
      for (let h = 0; h < hourlyCount; h++) {
        await prisma.hourlyNote.create({
          data: {
            dailyNoteId: note1.id,
            hora: randomTime(8 + h * 4),
            descricao:
              h === 0
                ? "Tomou medicação com café da manhã"
                : h === 1
                ? "Almoço na escola"
                : "Lanche da tarde",
          },
        });
        totalHourlyNotes++;
      }
    }

    // Anotação para João (regular)
    if (Math.random() > 0.25) {
      const mood = randomMood();
      const tags = randomTags(3);

      const note2 = await prisma.dailyNote.create({
        data: {
          patientId: patient2.id,
          data: noteDate,
          horaDormiu: randomTime(22 + Math.floor(Math.random() * 2)),
          horaAcordou: randomTime(6 + Math.floor(Math.random() * 3)),
          humor: mood,
          tags,
          detalhesExtras:
            mood <= 2
              ? "Ansiedade elevada. Pressão no trabalho."
              : mood >= 4
              ? "Sentindo-se melhor. Praticou exercícios."
              : "Dia equilibrado.",
        },
      });
      totalNotes++;

      // Registros horários
      if (Math.random() > 0.5) {
        await prisma.hourlyNote.create({
          data: {
            dailyNoteId: note2.id,
            hora: randomTime(8),
            descricao: "Tomou Sertralina",
          },
        });
        totalHourlyNotes++;
      }

      if (mood <= 2 && Math.random() > 0.7) {
        await prisma.hourlyNote.create({
          data: {
            dailyNoteId: note2.id,
            hora: randomTime(14),
            descricao: "Episódio de ansiedade no trabalho",
          },
        });
        totalHourlyNotes++;
      }
    }

    // Anotação para Ana (menos frequente, mas regular)
    if (Math.random() > 0.3) {
      const mood = randomMood();
      const tags = randomTags(3);

      const note3 = await prisma.dailyNote.create({
        data: {
          patientId: patient3.id,
          data: noteDate,
          horaDormiu: randomTime(21 + Math.floor(Math.random() * 3)),
          horaAcordou: randomTime(5 + Math.floor(Math.random() * 3)),
          humor: mood,
          tags,
          detalhesExtras:
            mood <= 2
              ? "Dificuldade para dormir. Acordou cansada."
              : mood >= 4
              ? "Dormiu bem. Mais disposta."
              : "Rotina normal.",
        },
      });
      totalNotes++;

      // Registros de medicação
      await prisma.hourlyNote.create({
        data: {
          dailyNoteId: note3.id,
          hora: randomTime(20),
          descricao: "Tomou Escitalopram",
        },
      });
      totalHourlyNotes++;

      if (Math.random() > 0.6) {
        await prisma.hourlyNote.create({
          data: {
            dailyNoteId: note3.id,
            hora: randomTime(22),
            descricao: "Tomou Zolpidem para dormir",
          },
        });
        totalHourlyNotes++;
      }
    }
  }

  console.log(`   ✓ Created ${totalNotes} daily notes`);
  console.log(`   ✓ Created ${totalHourlyNotes} hourly notes`);

  console.log("\n✨ Demo data seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   • 3 Patients created`);
  console.log(`   • 5 Medications created`);
  console.log(`   • ${totalNotes} Daily notes created`);
  console.log(`   • ${totalHourlyNotes} Hourly notes created`);
  console.log("\n🔐 Demo Account:");
  console.log("   Email: teste@teste.com");
  console.log("   Password: 12345678");
  console.log("\n🚀 You can now login and explore the app!");
}

main()
  .catch((e) => {
    console.error("\n❌ Error seeding demo data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
