import { prisma } from "@/lib/db";


async function main() {
  const count = await prisma.token.count();
  console.log("Tokens in DB:", count);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
