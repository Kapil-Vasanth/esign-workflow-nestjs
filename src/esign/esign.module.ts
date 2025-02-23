import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

import { EsignService } from './esign.service';
import { EsignController } from './esign.controller';

@Module({
  imports: [
    ConfigModule.forRoot(), // ✅ Loads .env for OpenSignLabs API keys
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // ✅ Stores uploaded files temporarily
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  ],
  controllers: [EsignController],
  providers: [EsignService],
  exports: [EsignService], // ✅ Makes available to other modules
})
export class EsignModule {}
