import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EsignModule } from './esign/esign.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ Make ConfigModule globally available
    MulterModule.register({ dest: './uploads' }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'uploads') }),
    EsignModule, // ✅ Ensure EsignModule is imported
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
