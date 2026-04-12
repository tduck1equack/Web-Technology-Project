import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule.forRoot()],
})
class TestModule {}

async function checkEnv() {
  const app = await NestFactory.createApplicationContext(TestModule);
  const config = app.get(ConfigService);
  const url = config.get('NEXT_PUBLIC_SUPABASE_URL');
  const dbUrl = config.get('DATABASE_URL');
  console.log('--- VERIFICATION RESULT ---');
  console.log('DATABASE_URL:', dbUrl ? 'Found' : 'Missing');
  if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.log('ERROR: DATABASE_URL is invalid format:', dbUrl);
  }
  if (url && url !== 'https://your-project-ref.supabase.co') {
    console.log('SUCCESS: .env is connected and reading actual values.');
  } else if (url === 'https://your-project-ref.supabase.co') {
    console.log('NOTICE: .env is connected, but still using placeholder values.');
  } else {
    console.log('FAILURE: Could not read NEXT_PUBLIC_SUPABASE_URL from .env');
  }
  console.log('Value read:', url);
  console.log('---------------------------');
  await app.close();
}

checkEnv();
