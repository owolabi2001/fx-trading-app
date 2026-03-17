import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "../dtos";
import * as argon2 from 'argon2';
import { GetUserService } from "./get-user.service";
import { JwtHelperService } from "./jwt-helper.service";
import { EJWTTokenType } from "src/database/enums";
import { UserAdapter } from "src/database";

@Injectable()
export class LoginService {
    private readonly logger = new Logger(LoginService.name);

    constructor(
        private readonly getUserService: GetUserService,
        private readonly jwtHelperService: JwtHelperService,
        private readonly userAdapter: UserAdapter,
    ) { }

    async execute({ email, password }: LoginDto) {
        const user = await this.getUserService.validateByEmail(email, {
            select: {
                password: true,
                id: true,
                email: true,
                isEmailVerified: true,
                profile: true
            },
            relations: {
                profile: true
            }
        });


        if (!(await argon2.verify(user.password, password))) {
            this.logger.warn(
                `User with id: ${user.id} provided an incorrect password.`,
            );
            throw new UnauthorizedException(`Invalid email/password combination.`);
        }

        const {
            password: _password,
            ...userDetails
        } = user;

        this.userAdapter.update({ id: user.id }, { lastLogin: new Date() });

        return {
            accessToken: await this.jwtHelperService.generateToken(user.id.toString(), user.email, EJWTTokenType.access),
            ...userDetails,
        }
    }
}