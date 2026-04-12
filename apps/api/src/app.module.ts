import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClassesController } from './classes/classes.controller';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseService } from './auth/supabase-auth.service';
import { AuthController } from './auth/auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ClassesController, AuthController],
  providers: [AppService, PrismaService, SupabaseService],
})
export class AppModule {}
