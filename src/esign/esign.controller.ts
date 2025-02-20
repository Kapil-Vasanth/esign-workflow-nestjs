import { Controller, Post, UploadedFile, UseInterceptors, Body, Param, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EsignService } from './esign.service';

@Controller('esign')
export class EsignController {
  constructor(private readonly esignService: EsignService) {}

  // Step 1: Upload PDF
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPDF(@UploadedFile() file: Express.Multer.File) {
    console.log('Uploaded File:', file); // Debugging line

    if (!file) {
      throw new Error('No file uploaded!');
    }

    const filePath = file.path; // Ensure the file path is set correctly
    return this.esignService.processUpload(file).then(() => ({
      message: 'File uploaded successfully',
      filePath: filePath,
    }));
  }

  // Step 2: Submit PDF for eSign with Role 1 and Role 2 emails
  @Post('submit')
  submitForEsign(@Body() body: { pdfPath: string; role1Email: string }) {
    return this.esignService.submitForEsign(body.pdfPath, body.role1Email);
  }

  // Step 3: Update Role 3 Email after Role 2 signs
  @Put('update-role3')
  updateRole3Email(@Body() body: { pdfPath: string; role3Email: string }) {
    return this.esignService.updateRole3Email(body.pdfPath, body.role3Email);
  }
}
