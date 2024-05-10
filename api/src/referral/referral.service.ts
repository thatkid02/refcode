import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../db/entities/user.entity';
import { generateReferralCode, getUserIdFromReferralCode, verifyExpiration } from './utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ReferralCodeService {
    constructor(
        @Inject(JwtService)
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // async superGen(id: string) {
    //     return generateReferralCode(id, 864000)

    // }

    async referredUser(referralCode: string) {
        const { userId } = await this.verifyRefCode(referralCode)

        if (!userId) {
            return { message: "Invalid Referral Code or Expired" }
        }

        const referredUser = await this.userRepository.findOne({ where: { id: Number(userId) } });

        if (!referredUser) {
            return { message: "Invalid Referral Code or Expired" }
        }

        referredUser.points += 1

        await this.userRepository.save(referredUser);

        return {
            message: "Success", referredUser: referredUser.username, referredUserId: referredUser.id
        }
    }

    async verifyRefCode(referralCode: string) {
        const isValid = verifyExpiration(referralCode)
        return isValid ? { userId: getUserIdFromReferralCode(referralCode) } : { userId: null }
    }


    async generateReferralCode(email: string) {
        const user = await this.userRepository.findOne({ where: { email: email } });

        if (!user) {
            throw new Error('User not found');
        }

        const { refcode } = generateReferralCode((user.id).toString(), 3600);
        user.referral_code = refcode;
        await this.userRepository.save(user);
        return { refCode: refcode, status: "Success" };
    }


    getReferralLeaderboard() {
        const leaderboard = this.getLeaderboardUserCounts();
        return leaderboard
    }


    async countReferredUsers(userId: number): Promise<number> {
        const referredUsersCount = await this.userRepository
            .createQueryBuilder('user')
            .where('user.referredBy = :userId', { userId })
            .getCount();

        return referredUsersCount;
    }

    async getLeaderboardUserCounts(): Promise<{ userId: number, referredUsersCount: number }[]> {
        const leaderboardUserCounts = await this.userRepository
            .createQueryBuilder('user')
            .select(['username as userName', 'COUNT(referred_by) as refferedUsersCount'])
            .groupBy('username')
            .getRawMany();

        return leaderboardUserCounts;
    }

    async getMyReferralCode(emailId: string) {
        const user = await this.userRepository.findOne({ where: { email: emailId } });

        if (!user) {
            return {
                refCode: null,
                message: "Something went wrong. Please try again"
            }
        }

        const { userId } = await this.verifyRefCode(user.referral_code)
        if (!userId) {
            return {
                refCode: null,
                message: "Click Generate to get your referral code"
            }
        }

        return {
            refCode: user.referral_code,
            message: "Success"
        }
    }

    async verifyToken(token: string): Promise<any> {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        } catch (error) {
            throw new Error(error);
        }
    }
}