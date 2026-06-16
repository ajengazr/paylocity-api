import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();
// const prismaClient = new PrismaClient({ log: ['error'] });
// export { prismaClient };