// api/context.ts
import { PrismaClient } from "@prisma/client";

export interface Context {
  db: PrismaClient;
}
