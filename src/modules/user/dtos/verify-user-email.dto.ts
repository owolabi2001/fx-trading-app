import { IsEmail, IsNumberString, Length } from "class-validator";

export class VerifyUserEmailDto {
    @IsEmail() email: string;

    @IsNumberString() @Length(6) token: string;
}