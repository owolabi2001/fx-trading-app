import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { EJWTTokenType } from "src/database/enums";

@Injectable()
export class JwtHelperService {
    private readonly logger = new Logger(JwtHelperService.name);
    constructor(private jwtService: JwtService) { }

    async generateToken(
        userId: string,
        email: string,
        type: EJWTTokenType = EJWTTokenType.access) {
        const token = await this.jwtService.signAsync({
            sub: userId,
            email,
            type
        })

        this.logger.log(`Jwt ${type} token generated for user with id: ${userId}`);

        return token;
    }
}