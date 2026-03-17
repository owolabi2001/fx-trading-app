import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EEnvironmentConstants } from 'src/common';
import { User } from 'src/database';
import { EJWTTokenType } from 'src/database/enums';
import { GetUserService } from '../get-user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'fx-user-strategy') {
    constructor(
        configService: ConfigService,
        private readonly getUserService: GetUserService,
    ) {
        const jwtSecret = configService.get<string>(
            EEnvironmentConstants.jwtSecret,
        );

        if (!jwtSecret) {
            throw new Error('JWT secret is not defined in the environment variables');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: { sub: string; email: string; type: EJWTTokenType }) {
        try {
            if (payload.type !== EJWTTokenType.access) {
                throw new Error('Invalid token type');
            }

            const user: User | null =
                await this.getUserService.userCacheDetail(BigInt(payload.sub));

            if (!user) {
                throw new Error('User not found');
            }

            if (!user.isEmailVerified) {
                throw new Error(`Your email is not verified`);
            }

            return user;
        } catch (error: any) {
            throw new UnauthorizedException(error.message);
        }
    }
}
