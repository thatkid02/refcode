import { Inject, Injectable } from '@nestjs/common';
import { twitterConfig } from './auth.config';
import { makeSignature, obtainOauthAccessToken, obtainOauthRequestToken, requestTokenSignature } from './twitter/utils';
import { OAuth } from 'oauth';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { AuthProvider } from 'src/db/entities/auth-provider.entity';

interface RequestTokenResponse {
    oauth_token: string;
    oauth_token_secret: string;
    oauth_callback_confirmed?: string;
}
@Injectable()
export class AuthService {

    constructor(
        @Inject(JwtService)
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(AuthProvider)
        private authProviderRepository: Repository<AuthProvider>,
    ) { }

    async generateToken(emailId, provider, providerUserId, providerAccessData): Promise<{ token: string, hasAccess: boolean, userName: string }> {
        let hasAccess = false;

        if (!emailId || !provider || !providerUserId || !providerAccessData) return null
        const user = await this.userRepository.findOne({ where: { email: emailId } });
        if (!user) {
            const customConfig: Config = {
                dictionaries: [adjectives, colors],
                separator: '-',
                length: 2,
            };

            const randomName: string = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals]
            });


            const payload = {
                emailId: emailId,
                username: randomName,
                auth: provider
            }
            const refreshToken = this.generateRefreshToken(payload);
            const accessToken = this.generateAccessToken(payload);

            const newUser = this.userRepository.create({
                email: emailId,
                username: randomName,
                refresh_token: refreshToken,
                access_token: accessToken,
            })

            await this.userRepository.save(newUser);

            const newAuthProvider = this.authProviderRepository.create({
                provider_user_id: providerUserId,
                user_id: newUser.id,
                provider: provider,
                provider_access_data: providerAccessData
            })

            provider == 'metamask' && (hasAccess = true)

            await this.authProviderRepository.save(newAuthProvider);

            return { token: accessToken, hasAccess: hasAccess, userName: randomName }
        } else {
            const authProvider = await this.authProviderRepository.find({ where: { user_id: user.id } });
            authProvider.forEach(async (auth) => {
                if (auth.provider == 'metamask') {
                    hasAccess = true
                }
            })
            if (!authProvider) {
                const newAuthProvider = this.authProviderRepository.create({
                    provider_user_id: providerUserId,
                    user_id: user.id,
                    provider: provider,
                    provider_access_data: providerAccessData
                })

                await this.authProviderRepository.save(newAuthProvider);
            }

            const payload = {
                emailId: emailId,
                username: user.username,
                auth: provider
            }
            const accessToken = this.generateAccessToken(payload);
            return { token: accessToken, hasAccess: hasAccess, userName: user.username }
        }

    }

    async signInWithWallet(email: string, walletAddress: string) {
        const user = await this.userRepository.findOne({ where: { email: email } });
        if (user) {
            const authProvider = await this.authProviderRepository.find({ where: { user_id: user.id, provider: 'metamask' } });
            if (!authProvider || authProvider.length <= 0) {
                const newAuthProvider = this.authProviderRepository.create({
                    user_id: user.id,
                    provider: 'metamask',
                    provider_user_id: walletAddress,
                    provider_access_data: { walletAddress: walletAddress }
                })
                await this.authProviderRepository.save(newAuthProvider);
            }
        } else {
            return { hasAccess: false }
        }

        return { hasAccess: true }
    }

    async verifyToken(token: string): Promise<any> {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        } catch (error) {
            throw new Error(error);
        }
    }

    async signInWithTwitter(userEmail?: { email: string }) {
        const obtainRequestTokenConfig = {
            apiUrl: twitterConfig.request_token_uri,
            callbackUrl: twitterConfig.oauth_redirect_uri,
            consumerKey: twitterConfig['consumer_key'],
            consumerSecret: twitterConfig['consumer_secret'],
            method: "POST"
        };
        const requestTokenData = await obtainOauthRequestToken(
            obtainRequestTokenConfig
        );

        return requestTokenData

    }

    async fetchTwitterUserAccessToken(oauth_token: string, oauth_verifier: string): Promise<any> {
        const accessToken = await obtainOauthAccessToken({
            apiUrl: twitterConfig.access_token_uri,
            consumerKey: twitterConfig.consumer_key,
            consumerSecret: twitterConfig.consumer_secret,
            oauthToken: oauth_token,
            oauthVerifier: oauth_verifier,
            method: "POST"
        })
        return accessToken
    }

    async verifyTwitterUser(oauth_token, oauth_token_secret, user_id, screen_name) {
        const oauth = new OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            twitterConfig['consumer_key'],
            twitterConfig['consumer_secret'],
            '1.0',
            null,
            'HMAC-SHA1'
        );

        const token = oauth_token;
        const tokenSecret = oauth_token_secret;

        return new Promise((resolve, reject) => {
            oauth.get(
                'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
                token,
                tokenSecret,
                (err, data) => {
                    if (err) {
                        console.error('Error verifying credentials:', err);
                        reject(err);
                    } else {
                        const response = JSON.parse(data.toString());
                        resolve({ signin: true, screenName: response.screen_name, emailId: response.email, username: response.name, auth: 'twitter' });
                    }
                }
            );
        });


    }

    signInWithGoogle() {
        return true
    }


    generateRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
    }

    generateAccessToken(payload: any): string {
        return this.jwtService.sign(payload, {
            expiresIn: '1h',
        });
    }

    verifyRefreshToken(refreshToken: string): any {
        try {
            return this.jwtService.verify(refreshToken);
        } catch (error) {
            console.log(error)
            return null
        }
    }

}

