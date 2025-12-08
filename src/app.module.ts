import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BonusesController } from './bonuses/bonuses.controller';
import { GoogleSheetsService } from './google-sheets/google-sheets.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [BonusesController],
  providers: [GoogleSheetsService],
})
export class AppModule {}



