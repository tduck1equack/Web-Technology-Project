import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClassesController } from './classes/classes.controller';
@Module({
  imports: [],
  controllers: [AppController, ClassesController],
  providers: [AppService],
})
export class AppModule {}
