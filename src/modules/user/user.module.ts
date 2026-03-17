import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import {
    JwtHelperService,
    JwtStrategy,
    LoginService,
    RegisterUserService,
    VerifyUserEmailService
} from "./services";
import { GetUserService } from "./services/get-user.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { EEnvironmentConstants } from "src/common";

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>(EEnvironmentConstants.jwtSecret),
                signOptions: {
                    expiresIn: '1h',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [UserController],
    providers: [
        RegisterUserService,
        LoginService,
        JwtHelperService,
        GetUserService,
        VerifyUserEmailService,
        JwtStrategy
    ]
})
export class UserModule { }