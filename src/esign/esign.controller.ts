import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Body, 
  Param, 
  Put, 
  Get, 
  BadRequestException, 
  InternalServerErrorException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EsignService } from './esign.service';
import * as multer from 'multer';
import * as fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFileAsync: (path: string) => Promise<Buffer> = promisify(fs.readFile);

@Controller('esign')
export class EsignController {
  constructor(private readonly esignService: EsignService) {}

  // ✅ Step 1: Upload PDF and create signing template
  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // ✅ Uses MulterModule's configured storage
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { role1Email: string; title: string; description?: string; note?: string }
  ) {
    if (!file) {
      throw new BadRequestException('File is required and must be a valid PDF');
    }

    if (!body?.role1Email || !body?.title) {
      throw new BadRequestException('Role1 email and title are required');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    try {
      const fileBuffer: Buffer = await readFileAsync(file.path);
      const base64File: string = fileBuffer.toString('base64');

      const response = await this.esignService.uploadTemplate({
        file: base64File,
        filename: file.originalname,
        role1Email: body.role1Email,
        title: body.title,
        description: body.description || '',
        note: body.note || '',
      });

      // ✅ Cleanup: Remove file after successful upload
      fs.unlinkSync(file.path);

      return response;
    } catch (error) {
      console.error('Error processing file:', error);
      throw new InternalServerErrorException('Failed to process and upload file');
    }
  }
  

  // ✅ Step 2: Submit document for signing (Role 1 & Role 2)
  @Post('submit')
  async submitForEsign(@Body() body: { documentId: string; role1Email: string; role2Email: string }) {
    if (!body.documentId || !body.role1Email || !body.role2Email) {
      throw new BadRequestException('documentId, role1Email, and role2Email are required');
    }

    return this.esignService.submitForEsign(body.documentId, body.role1Email, body.role2Email);
  }

  // ✅ Step 3: Update Role 3 Email after Role 2 signs
  @Put('update-role3')
  async updateRole3Email(@Body() body: { documentId: string; role3Email: string }) {
    if (!body.documentId || !body.role3Email) {
      throw new BadRequestException('documentId and role3Email are required');
    }

    return this.esignService.updateRole3Email(body.documentId, body.role3Email);
  }

  // ✅ Get all stored documents
  // @Get('documents')
  // async getDocuments() {
  //   return this.esignService.getDocuments();
  // }

  // ✅ Step 4: Retrieve the signing URL for a document
  @Get('sign-url/:documentId')
  async getSignUrl(@Param('documentId') documentId: string) {
    if (!documentId) {
      throw new BadRequestException('documentId is required');
    }
    return this.esignService.getSignUrl(documentId);
  }
}


