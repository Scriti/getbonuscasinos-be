import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { BonusesController } from './bonuses/bonuses.controller';
import { GoogleSheetsService } from './google-sheets/google-sheets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Try multiple possible .env file locations
      envFilePath: (() => {
        const possiblePaths = [
          join(process.cwd(), '.env'),
          join(__dirname, '..', '.env'),
          join(__dirname, '..', '..', '.env'),
          '.env',
        ];
        
        for (const path of possiblePaths) {
          if (existsSync(path)) {
            console.log(`[ConfigModule] Loading .env from: ${path}`);
            return path;
          }
        }
        
        console.warn('[ConfigModule] No .env file found, using system environment variables only');
        return undefined;
      })(),
      // System environment variables take precedence over .env file values
    }),
  ],
  controllers: [BonusesController],
  providers: [GoogleSheetsService],
})
export class AppModule {}





