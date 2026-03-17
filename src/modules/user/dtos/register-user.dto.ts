import {
    IsEmail,
    IsNumberString,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsStrongPassword,
    Length
} from "class-validator";
import { Capitalize } from "src/common";

export class RegisterUserDto {

    @IsEmail()
    email: string;

    @IsStrongPassword()
    password: string;

    @Length(11)
    @IsNumberString()
    @IsOptional()
    bvn?: string;

    @Length(11)
    @IsNumberString()
    @IsOptional()
    nin?: string;

    @IsString()
    @Capitalize()
    firstName: string;

    @IsString()
    @Capitalize()
    lastName: string;

    @IsPhoneNumber()
    phoneNumber: string;
}