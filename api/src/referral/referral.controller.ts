import { Controller, Get, UseGuards, Request, Query, Body } from '@nestjs/common';
import { ReferralCodeService } from './referral.service';

@Controller('refcode')
export class ReferralCodeController {
    constructor(private referralCodeService: ReferralCodeService) { }

    @Get()
    async verifyReferralCode(@Query('ref') referralCode: string) {
        const verification = await this.referralCodeService.referredUser(referralCode);
        return verification;
    }

    // @Get('gen')
    // async gen() {
    //     return this.referralCodeService.superGen("1");
    // }

    // @Get('verify')
    // async ver(@Query('ref') referralCode: string) {
    //     return this.referralCodeService.verifyRefCode(referralCode);
    // }

    @Get('generate')
    async generateReferralCode(@Request() req) {
        const userId = req.user.id;
        const referralCode = await this.referralCodeService.generateReferralCode(userId);
        return { referralCode };
    }

}