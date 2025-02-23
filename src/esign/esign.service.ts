import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EsignService {
  private readonly logger = new Logger(EsignService.name);

  private readonly apiUrl = process.env.OPENSIGNLABS_API_URL;
  private readonly apiKey = process.env.OPENSIGNLABS_API_KEY;

  constructor() {
    if (!this.apiUrl || !this.apiKey) {
      throw new Error('❌ Missing API configuration for OpenSignLabs');
    }
  }

  // ✅ Step 1: Upload PDF and create a signing template
  async uploadTemplate(data: { 
    file: string; 
    filename: string; 
    role1Email: string;
    title: string;
    description?: string;
    note?: string;
  }) {
    try {
      if (!data.file || !data.filename || !data.role1Email || !data.title) {
        throw new InternalServerErrorException('Invalid input data for template upload');
      }
  
      this.logger.log(`Uploading draft template: ${data.filename} for ${data.role1Email}`);
  
      const requestBody = {
        file: data.file,
        title: data.title,
        description: data.description || '',
        note: data.note || '',
        signers: [
          {
            email: data.role1Email,
            role: 'HR',
            name: '',
            phone: '',
            widgets: [
              {
                type: 'signature',
                "page":1, "x": 8, "y": 6, "w": 0, "h": 0,
          
              },
              {
                "type": "email",
                "page":1, "x": 8, "y": 63, "w": 0, "h": 0,
                "options": {
                  "required": true,
                  "name": "email",
                  "default": data.role1Email,
                  "color": "black",
                  "fontsize": 12
                },
          
              }
            ]
          },
          {
            email: data.role1Email,
            role: 'Manager',
            name: '',
            phone: '',
            widgets: [
              {
                type: 'signature',
                "page":1, "x": 418, "y": 7, "w": 0, "h": 0,
          
              },
              {
                "type": "email",
                "page":1, "x": 418, "y": 65, "w": 0, "h": 0,
                "options": {
                  "required": true,
                  "name": "email",
                  "default": data.role1Email,
                  "color": "black",
                  "fontsize": 12
                },
          
              }
            ]
          },
        ],
        sendInOrder: true,
        enableOTP: false,
        enableTour: false,
        sender_name: 'OpenSign™',
        sender_email: 'mailer@opensignlabs.com',
  
      };
  
      const response = await axios.post(`${this.apiUrl}/drafttemplate`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-token': this.apiKey,
        },
      });
  
      if (!response.data || !response.data.objectId || !response.data.url) {  
        this.logger.error('Failed to upload draft template', JSON.stringify(response.data, null, 2));
        throw new InternalServerErrorException('Draft template upload failed');
      }
  
      return { 
        message: 'Draft template uploaded successfully', 
        template_id: response.data.objectId,  // ✅ Return template_id
        url: response.data.url  // ✅ Return edit URL
      };
    } catch (error) {
      this.logger.error('Error in uploadTemplate:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to upload and create draft template');
    }
  }
  
  

  // ✅ Step 2: Submit document for signing (Role 1 & Role 2)
  async submitForEsign(documentId: string, role1Email: string, role2Email: string) {
    if (!documentId || !role1Email || !role2Email) {
      throw new BadRequestException('documentId, role1Email, and role2Email are required');
    }

    try {
      const requestBody = {
        documentId,
        signers: [
          { email: role1Email, role: 'role1', widgets: [{ type: 'signature', page: 1, x: 100, y: 200 }] },
          { email: role2Email, role: 'role2', widgets: [{ type: 'signature', page: 2, x: 150, y: 250 }] },
        ],
        sendInOrder: true,
      };

      const response = await axios.post(`${this.apiUrl}/v1/templates/submit`, requestBody, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Error submitting for eSign:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to submit document for e-signing');
    }
  }

  // ✅ Step 3: Update Role 3 Email after Role 2 signs
  async updateRole3Email(documentId: string, role3Email: string) {
    if (!documentId || !role3Email) {
      throw new BadRequestException('documentId and role3Email are required');
    }

    try {
      const requestBody = { documentId, role3Email };
      const response = await axios.put(`${this.apiUrl}/v1/templates/update-role3`, requestBody, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Error updating Role 3 email:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to update Role 3 email');
    }
  }

  // ✅ Retrieve signing URL for a document
  async getSignUrl(documentId: string) {
    if (!documentId) {
      throw new BadRequestException('documentId is required');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/v1/templates/sign-url/${documentId}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error('❌ Error retrieving sign URL:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to retrieve sign URL');
    }
  }
}
