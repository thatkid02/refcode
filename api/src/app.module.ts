import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './db/orm.config';

import { ReferralCodeModule } from './referral/referral.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    AuthModule,
    ReferralCodeModule
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule { }
