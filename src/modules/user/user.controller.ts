import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto, RegisterUserDto, VerifyUserEmailDto } from "./dtos";
import { GetUserService, LoginService, RegisterUserService, VerifyUserEmailService } from "./services";
import { SkipAuth } from "src/common";
import { FXUser } from "src/common/decorators/fx-user.decorator";
import { IFXUser } from "src/common/interfaces";

@Controller('auth')
@ApiTags('auth')
export class UserController {
    constructor(
        private readonly registerUserService: RegisterUserService,
        private readonly loginService: LoginService,
        private readonly verifyEmailService: VerifyUserEmailService,
        private readonly getUserService: GetUserService,

    ) { }

    @SkipAuth()
    @Post('register')
    register(@Body() data: RegisterUserDto) {
        return this.registerUserService.execute(data);
    }


    @Post('verify')
    @SkipAuth()
    @ApiOperation({ summary: 'Verify email with otp sent.' })
    verfiyEmail(@Body() data: VerifyUserEmailDto) {
        return this.verifyEmailService.execute(data)
    }


    @Post('resend-otp')
    @SkipAuth()
    @ApiOperation({ summary: 'Resend OTP to email' })
    resendOtp() { }


    @Post('login')
    @SkipAuth()
    @ApiOperation({ summary: 'Login and receive JWT' })
    @ApiResponse({ status: 200, description: 'Login successful, JWT returned' })
    @ApiResponse({ status: 401, description: 'Invalid email/password combination.' })
    login(@Body() data: LoginDto) {
        return this.loginService.execute(data);
    }

    @Get('profile')
    @ApiBearerAuth()
    getProfile(@FXUser() { id }: IFXUser) {
        return this.getUserService.validate(id, { select: { profile: true } });
    }
}