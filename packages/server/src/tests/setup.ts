import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'file:./dev.db';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.flight.deleteMany();
  await prisma.monitor.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
