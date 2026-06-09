const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: passwordHash,
      fullName: 'Administrator',
      role: 'admin',
    },
    create: {
      username: 'admin',
      password: passwordHash,
      fullName: 'Administrator',
      role: 'admin',
    },
  });

  await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Minuman',
      description: 'Kategori awal untuk development lokal.',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
