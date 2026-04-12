import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to set RLS context for a user
  async setUserContext(authUserId: string) {
    await this.$executeRaw`
      SELECT set_config('request.jwt.claim.sub', ${authUserId}, TRUE)
    `;
  }

  // Helper method to execute queries with user context
  async withUserContext<T>(
    authUserId: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      await (prisma as PrismaService).setUserContext(authUserId);
      return operation();
    });
  }
}
