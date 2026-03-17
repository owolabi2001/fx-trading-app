import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTableCreation1773755267615 implements MigrationInterface {
    name = 'InitialTableCreation1773755267615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trading"."profile" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedOn" TIMESTAMP WITH TIME ZONE, "id" bigint NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phoneNumber" character varying, "picture" character varying, "bvn" character varying(11), "nin" character varying(11), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trading"."user" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedOn" TIMESTAMP WITH TIME ZONE, "id" bigint NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isEmailVerified" boolean NOT NULL DEFAULT false, "refreshToken" character varying, "lastLogin" TIMESTAMP WITH TIME ZONE, "profileId" bigint, CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "trading"."user" ("email") `);
        await queryRunner.query(`CREATE TYPE "trading"."transaction_type_enum" AS ENUM('CREDIT', 'DEBIT')`);
        await queryRunner.query(`CREATE TYPE "trading"."transaction_purpose_enum" AS ENUM('FUNDING', 'CONVERSION', 'TRADE')`);
        await queryRunner.query(`CREATE TYPE "trading"."transaction_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "trading"."transaction" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedOn" TIMESTAMP WITH TIME ZONE, "id" bigint NOT NULL, "type" "trading"."transaction_type_enum" NOT NULL, "purpose" "trading"."transaction_purpose_enum" NOT NULL, "amount" numeric(15,4) NOT NULL, "rateUsed" numeric(15,4), "status" "trading"."transaction_status_enum" NOT NULL DEFAULT 'PENDING', "reference" uuid NOT NULL, "userId" bigint, "walletId" bigint, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "trading"."wallet_currency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CHF', 'CAD', 'AUD')`);
        await queryRunner.query(`CREATE TABLE "trading"."wallet" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedOn" TIMESTAMP WITH TIME ZONE, "id" bigint NOT NULL, "currency" "trading"."wallet_currency_enum" NOT NULL DEFAULT 'NGN', "balance" numeric(15,4) NOT NULL DEFAULT '0', "userId" bigint, CONSTRAINT "UQ_c8d0130b44210fe9bb058e30c49" UNIQUE ("userId", "currency"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "trading"."token_type_enum" AS ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION')`);
        await queryRunner.query(`CREATE TABLE "trading"."token" ("createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedOn" TIMESTAMP WITH TIME ZONE, "id" bigint NOT NULL, "token" character varying NOT NULL, "type" "trading"."token_type_enum" NOT NULL, "userId" bigint NOT NULL, "expiryDate" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trading"."user" ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES "trading"."profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "trading"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."transaction" ADD CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d" FOREIGN KEY ("walletId") REFERENCES "trading"."wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."wallet" ADD CONSTRAINT "FK_35472b1fe48b6330cd349709564" FOREIGN KEY ("userId") REFERENCES "trading"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading"."wallet" DROP CONSTRAINT "FK_35472b1fe48b6330cd349709564"`);
        await queryRunner.query(`ALTER TABLE "trading"."transaction" DROP CONSTRAINT "FK_900eb6b5efaecf57343e4c0e79d"`);
        await queryRunner.query(`ALTER TABLE "trading"."transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "trading"."user" DROP CONSTRAINT "FK_9466682df91534dd95e4dbaa616"`);
        await queryRunner.query(`DROP TABLE "trading"."token"`);
        await queryRunner.query(`DROP TYPE "trading"."token_type_enum"`);
        await queryRunner.query(`DROP TABLE "trading"."wallet"`);
        await queryRunner.query(`DROP TYPE "trading"."wallet_currency_enum"`);
        await queryRunner.query(`DROP TABLE "trading"."transaction"`);
        await queryRunner.query(`DROP TYPE "trading"."transaction_status_enum"`);
        await queryRunner.query(`DROP TYPE "trading"."transaction_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "trading"."transaction_type_enum"`);
        await queryRunner.query(`DROP INDEX "trading"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "trading"."user"`);
        await queryRunner.query(`DROP TABLE "trading"."profile"`);
    }

}
