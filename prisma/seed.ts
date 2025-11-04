import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Tags padrão
  const defaultTags = [
    { nome: "consulta", cor: "#3B82F6" }, // azul
    { nome: "doente", cor: "#EF4444" }, // vermelho
    { nome: "exame", cor: "#8B5CF6" }, // roxo
    { nome: "internação", cor: "#F59E0B" }, // amarelo
    { nome: "cirurgia", cor: "#EC4899" }, // rosa
    { nome: "emergência", cor: "#F97316" }, // laranja
  ];

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { nome: tag.nome },
      update: {},
      create: tag,
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
