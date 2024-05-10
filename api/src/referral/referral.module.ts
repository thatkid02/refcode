import { Module } from '@nestjs/common';
import { ReferralCodeController } from './referral.controller';
import { ReferralCodeService } from './referral.service';
import { User } from 'src/db/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthProvider } from 'src/db/entities/auth-provider.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';


@Module({
    imports: [TypeOrmModule.forFeature([User, AuthProvider]),
    JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
    })],
    providers: [ReferralCodeService, JwtService],
    controllers: [ReferralCodeController]
})
export class ReferralCodeModule { }
