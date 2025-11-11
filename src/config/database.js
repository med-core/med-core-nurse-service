import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  
  try {
    await prisma.$connect();
    isConnected = true;
    console.log('Prisma conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando Prisma a MongoDB:', error);
    throw error;
  }
}

export function getPrismaClient() {
  return prisma;
}

export default prisma;