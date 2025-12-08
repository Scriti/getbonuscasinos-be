import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';
import { BonusDto } from '../bonuses/dto/bonus.dto';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
  private sheets: any;
  private spreadsheetId: string;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
  }

  async onModuleInit() {
    await this.initializeSheets();
  }

  private async initializeSheets() {
    // Option 1: Use JSON credentials file (preferred - simpler and avoids key parsing issues)
    const credentialsPath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    
    if (credentialsPath && fs.existsSync(credentialsPath)) {
      try {
        // Use GoogleAuth with credentials file - handles all key format issues automatically
        const auth = new google.auth.GoogleAuth({
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        this.isInitialized = true;
        return;
      } catch (error) {
        console.error('Error initializing with credentials file:', error.message);
        throw new Error(`Failed to initialize Google Sheets with credentials file: ${error.message}`);
      }
    }

    // Option 2: Fallback to environment variables (if JSON file not provided)
    const privateKey = this.configService.get<string>('GOOGLE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');

    if (!privateKey || !clientEmail) {
      throw new Error(
        'Either GOOGLE_APPLICATION_CREDENTIALS (path to JSON file) or both GOOGLE_PRIVATE_KEY and GOOGLE_CLIENT_EMAIL must be set'
      );
    }

    try {
      // Handle private key formatting
      let formattedKey = privateKey.trim().replace(/^["']|["']$/g, '');
      formattedKey = formattedKey.replace(/\\n/g, '\n').trim();

      const jwtClient = new google.auth.JWT({
        email: clientEmail,
        key: formattedKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: jwtClient });
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing Google Sheets auth:', error);
      throw new Error(`Failed to initialize Google Sheets authentication: ${error.message}`);
    }
  }

  async getBonuses(): Promise<BonusDto[]> {
    if (!this.isInitialized) {
      await this.initializeSheets();
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Entries!A2:G', // Skip header row, read from row 2 onwards
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      const bonuses: BonusDto[] = rows
        .filter((row) => row && row[0]) // Filter out empty rows
        .map((row) => ({
          brandName: row[0] || '',
          logo: row[1] || '',
          welcomeBonus: row[2] || '',
          bonusDetails: row[3] || '',
          wager: row[4] || '',
          minDeposit: row[5] || '',
          trackingLink: row[6] || '',
        }));

      return bonuses;
    } catch (error) {
      console.error('Error reading from Google Sheets:', error);
      throw new Error('Failed to read bonuses from Google Sheets');
    }
  }
}

