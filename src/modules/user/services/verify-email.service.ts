import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { VerifyUserEmailDto } from "../dtos";
import { DataSource } from "typeorm";
import { ETokenType } from "src/database/enums";
import { Token, TokenAdapter, User } from "src/database";
import { GetUserService } from "./get-user.service";
import * as argon2 from 'argon2';

@Injectable()
export class VerifyUserEmailService {
    private readonly logger = new Logger(VerifyUserEmailService.name);
    constructor(
        private readonly tokenAdapter: TokenAdapter,
        private readonly dataSource: DataSource,
        private readonly getUserService: GetUserService,
    ) { }

    async execute({ email, token }: VerifyUserEmailDto) {
        const user = await this.getUserService.validateByEmail(email);

        if (user.isEmailVerified) {
            this.logger.log(`Email verification `);
            throw new ConflictException(`Your account is activated already.`);
        }

        const verificationToken = await this.validateVerificationToken(user.id);

        this.checkExpiry(verificationToken.expiryDate, user.id);

        await this.verifyToken(token, verificationToken.token, user.id);

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            await queryRunner.manager.update(User, { id: user.id }, { isEmailVerified: true });

            await queryRunner.manager.delete(Token, { id: verificationToken.id })

            await queryRunner.commitTransaction();
            this.logger.log(`user with id: ${user.id.toString()} successfully verified`);

            return {
                message: "Email verification is successful",
                id: user.id.toString()
            }
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err
        } finally {
            await queryRunner.release();
        }
    }

    async verifyToken(token: string, hasedToken: string, userId: bigint) {
        if (!(await argon2.verify(hasedToken, token))) {
            this.logger.warn(`Invalid user token passed for user with id: ${userId}`);
            throw new UnauthorizedException(
                `Invalid Token Please request a new one.`,
            );
        }
    }

    async validateVerificationToken(
        userId: bigint,
        type: ETokenType = ETokenType.EMAIL_VERIFICATION,
    ) {
        const token = await this.tokenAdapter.findOne({
            userId,
            type,
        });

        if (!token) {
            this.logger.warn(`Email verification token not found for user with id: ${userId}.`);
            throw new UnauthorizedException('Invalid token.');
        }

        return token;
    }


    private checkExpiry(expiresIn: Date, userId: bigint): boolean {
        if (expiresIn.getTime() < Date.now()) {
            this.logger.warn(`Token has expired for user with id: ${userId}`);
            void this.deleteToken(userId);
            throw new UnauthorizedException('Invalid token.');
        }
        return true;
    }

    private async deleteToken(
        userId: bigint,
    ) {
        await this.tokenAdapter.delete({
            userId,
            type: ETokenType.EMAIL_VERIFICATION,
        });

        this.logger.log(
            `Successfully deleted token for user with id: ${userId} and purpose of ${ETokenType.EMAIL_VERIFICATION}`,
        );
    }
}