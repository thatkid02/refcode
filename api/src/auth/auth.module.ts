import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { AuthProvider } from 'src/db/entities/auth-provider.entity';
import { ReferralCodeService } from 'src/referral/referral.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthProvider]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    })],
  providers: [AuthService, ReferralCodeService],
  controllers: [AuthController]
})
export class AuthModule { }

