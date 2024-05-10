import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthGuard } from './auth.guard';
import { ReferralCodeService } from 'src/referral/referral.service';

@Controller('auth')
export class AuthController {

    constructor(private readonly auth: AuthService,
        private readonly referralCodeService: ReferralCodeService
    ) { }

    @Post('login')
    async login(
        @Body('provider') provider: string,
        @Body('providerUserId') providerUserId: string,
        @Body('provider_access_data') providerAccessData: object,
        @Body('email') email: string,
        @Res({ passthrough: true }) response: Response,
    ): Promise<{ token: string, hasAccess: boolean, userName: string }> {
        const { token, hasAccess, userName } = await this.auth.generateToken(email, provider, providerUserId, providerAccessData);
        response.cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000,
        });
        return { token, hasAccess, userName };
    }

    @Post('/twitter')
    signInWithTwitter(@Body() userEmail?) {
        return this.auth.signInWithTwitter(userEmail);
    }

    @Post('/twitter/accessToken')
    fetchTwitterUserAccessToken(@Body() { oauth_token, oauth_verifier }: { oauth_token: string, oauth_verifier: string }) {
        return this.auth.fetchTwitterUserAccessToken(oauth_token, oauth_verifier);
    }

    @Post('/twitter/verify')
    verifyTwitterUser(@Body() { oauth_token, oauth_token_secret, user_id, screen_name }: { oauth_token: string, oauth_token_secret: string, user_id: string, screen_name: string }) {
        return this.auth.verifyTwitterUser(oauth_token, oauth_token_secret, user_id, screen_name);
    }

    @Get('/google')
    signInWithGoogle() {
        return this.auth.signInWithGoogle();
    }

    @UseGuards(AuthGuard)
    @Post('/wallet')
    async signInWithWallet(
        @Body('emailId') email: string,
        @Body('walletAddress') walletAddress: string
    ) {
        return this.auth.signInWithWallet(email, walletAddress);
    }

    @UseGuards(AuthGuard)
    @Post('myrefcode')
    async getMyReferralCode(@Body('emailId') emailId: string) {
        return this.referralCodeService.getMyReferralCode(emailId)
    }

    @UseGuards(AuthGuard)
    @Post('referral/generate')
    async generateReferralCode(@Body('emailId') emailId: string) {
        return this.referralCodeService.generateReferralCode(emailId)
    }

    @UseGuards(AuthGuard)
    @Get('score')
    async getReferralLeaderboard() {
        return this.referralCodeService.getReferralLeaderboard();
    }
}

