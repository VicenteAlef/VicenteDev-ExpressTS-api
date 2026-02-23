import { prisma } from "../src/lib/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  // Gerando o hash da senha padrão (ex: 'root1234')
  const hashedPassword = await bcrypt.hash("Leffdev@2025", 10);

  const rootUser = await prisma.user.upsert({
    where: { email: "ildealef@outlook.com" },
    update: {}, // Se já existir, não faz nada
    create: {
      name: "Vicente (Root)",
      email: "ildealef@outlook.com",
      password: hashedPassword,
      role: "ROOT",
      isActive: true,
    },
  });

  console.log("🌱 Seed executado com sucesso!");
  console.log(`Usuário Root criado/verificado: ${rootUser.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
