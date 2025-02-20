import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class EsignService {
  private documents = new Map<string, { role1Email: string; role2Email: string; role3Email?: string }>();

  constructor(private readonly configService: ConfigService) {}

  // Step 1: Process file upload
  async processUpload(file: Express.Multer.File) {
    if (!file) {
        throw new Error('File upload failed: No file received.');
      }
    const filePath = `uploads/${file.filename}`;
    return { message: 'File uploaded successfully', filePath };
  }

  // Step 2: Submit for eSign with Role 1 and a placeholder for Role 2
  async submitForEsign(pdfPath: string, role1Email: string) {
    const apiUrl = this.configService.get<string>('OPENSIGNLABS_API_URL');
    const apiKey = this.configService.get<string>('OPENSIGNLABS_API_KEY');

    const role2Email = "placeholder_role2@example.com"; // Placeholder email

    // Save to in-memory storage
    this.documents.set(pdfPath, { role1Email, role2Email });

    const requestBody = {
      document: pdfPath,
      signers: [
        { email: role1Email, role: "Role 1", tags: [{ type: "signature", page: 1, x: 100, y: 200 }] },
        { email: role2Email, role: "Role 2", tags: [{ type: "signature", page: 2, x: 150, y: 250 }] },
      ]
    };

    try {
      const response = await axios.post(`${apiUrl}/submit-esign`, requestBody, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Step 3: Update Role 3 Email After Role 2 Signs
  async updateRole3Email(pdfPath: string, role3Email: string) {
    const document = this.documents.get(pdfPath);
    if (!document) {
      return { error: 'Document not found' };
    }

    const apiUrl = this.configService.get<string>('OPENSIGNLABS_API_URL');
    const apiKey = this.configService.get<string>('OPENSIGNLABS_API_KEY');

    document.role3Email = role3Email;
    this.documents.set(pdfPath, document);

    const requestBody = {
      document: pdfPath,
      signers: [
        { email: document.role1Email, role: "Role 1" },
        { email: document.role2Email, role: "Role 2" },
        { email: role3Email, role: "Role 3", tags: [{ type: "signature", page: 3, x: 200, y: 300 }] }
      ]
    };

    try {
      const response = await axios.post(`${apiUrl}/update-signers`, requestBody, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.data;
    } catch (error) {
      return { error: error.message };
    }
  }
}
