import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SupabaseService } from '../src/auth/supabase-auth.service';

async function verify() {
  console.log('--- BẮT ĐẦU KIỂM TRA KẾT NỐI ---');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const supabase = app.get(SupabaseService);

  console.log('\n[1/2] Kiểm tra kết nối Cơ sở dữ liệu (Prisma)...');
  try {
    const userCount = await prisma.user.count();
    console.log('✅ KẾT NỐI DATABASE THÀNH CÔNG!');
    console.log(`📊 Số lượng người dùng hiện tại: ${userCount}`);
  } catch (error) {
    console.error('❌ LỖI KẾT NỐI DATABASE:');
    console.error(error.message);
  }

  console.log('\n[2/2] Kiểm tra kết nối Supabase API...');
  try {
    const { data, error } = await supabase.client.auth.admin.listUsers();
    if (error) throw error;
    console.log('✅ KẾT NỐI SUPABASE API THÀNH CÔNG!');
    console.log(`👥 Số lượng người dùng trong Auth: ${data.users.length}`);
  } catch (error) {
    console.error('❌ LỖI KẾT NỐI SUPABASE API:');
    console.error(error.message);
    console.log('\n💡 Gợi ý: Kiểm tra file .env xem URL và SERVICE_ROLE_KEY đã đúng chưa.');
  }

  console.log('\n--- KẾT THÚC KIỂM TRA ---');
  await app.close();
}

verify().catch((err) => {
  console.error('Lỗi nghiêm trọng khi chạy script:');
  console.error(err);
  process.exit(1);
});
