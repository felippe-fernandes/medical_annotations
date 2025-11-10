import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Tags agora são strings simples armazenadas diretamente nas anotações
  // Não há mais tabela de tags para popular

  console.log("Seeding completed!");
  console.log("Note: Tags are now stored as string arrays in daily_notes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
