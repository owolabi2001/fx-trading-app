import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { RegisterUserDto } from "../dtos";
import { Profile, Token, User, UserAdapter, Wallet } from "src/database";
import { DataSource, QueryRunner } from "typeorm";
import * as argon2 from 'argon2';
import { generateToken, SnowflakeService } from "src/common";
import { JwtHelperService } from "./jwt-helper.service";
import { EJWTTokenType, ETokenType } from "src/database/enums";
import { SendMailService } from "src/modules/mail/services";

@Injectable()
export class RegisterUserService {
    private readonly logger = new Logger(RegisterUserService.name);
    constructor(
        private readonly userAdapter: UserAdapter,
        private readonly dataSource: DataSource,
        private readonly mailService: SendMailService,
        private readonly jwtHelperService: JwtHelperService,
        private readonly snowflakeService: SnowflakeService,
    ) { }


    async execute({ email, firstName, lastName, password, phoneNumber, bvn, nin }: RegisterUserDto) {
        await this.checkExisitingUserByEmail(email);

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const user = await this.createUser(queryRunner, email, password);

            const profile = await this.createProfile(queryRunner, user, firstName, lastName, phoneNumber, bvn, nin);
            const token = await this.generateVerificationToken(queryRunner, user);

            await this.createNairaWallet(queryRunner, user);

            this.mailService.sendMail(
                email,
                'Email Verification',
                './email-verification.hbs',
                {
                    appName: 'FX trader Pro',
                    firstName: profile.firstName,
                    otp: token,
                    year: new Date().getFullYear(),
                },
            );


            await queryRunner.commitTransaction();
            this.logger.log(`user with id: ${user.id.toString()} successfully created`);

            return {
                message: "User created Successfully",
                id: user.id.toString(),
                accessToken: await this.jwtHelperService.generateToken(user.id.toString(), user.email, EJWTTokenType.access),
            }
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }


    }

    private async checkExisitingUserByEmail(email: string) {
        const doesUserExist = await this.userAdapter.exists({ email })
        if (doesUserExist) {
            this.logger.warn(`user with email already exists`);
            throw new BadRequestException('User already exists');
        }
    }

    private async createUser(queryRunner: QueryRunner, email: string, password: string) {
        const hashedPassword = await argon2.hash(password);
        const user = await queryRunner.manager.save(User, {
            id: this.snowflakeService.generateId(),
            email,
            password: hashedPassword,
        })

        return user;
    }

    private async createProfile(
        queryRunner: QueryRunner,
        user: User,
        firstName: string,
        lastName: string,
        phoneNumber: string,
        bvn?: string,
        nin?: string) {
        const profile = await queryRunner.manager.save(Profile, {
            id: this.snowflakeService.generateId(),
            user,
            firstName,
            lastName,
            phoneNumber,
            bvn,
            nin,
        })

        return profile;
    }

    private async createNairaWallet(queryRunner: QueryRunner, user: User) {
        await queryRunner.manager.save(Wallet, {
            id: this.snowflakeService.generateId(),
            user,
        })
    }

    private async generateVerificationToken(queryRunner: QueryRunner, user: User) {
        const token = generateToken();
        const expiryDate = new Date(Date.now() + 10 * 60 * 1000);
        await queryRunner.manager.save(Token, {
            id: this.snowflakeService.generateId(),
            token: await argon2.hash(token),
            userId: user.id,
            expiryDate,
            type: ETokenType.EMAIL_VERIFICATION
        });

        return token;
    }

}