import { Test, TestingModule } from "@nestjs/testing";
import { SnowflakeService } from "src/common";
import { Transaction, Wallet } from "src/database";
import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { FundWalletService } from "../fund-wallet.service";
import { GetWalletService } from "../get-wallet.service";
import { ECurrencyType } from "src/database/enums";

describe("FundWalletService", () => {
    let service: FundWalletService;
    let getWalletService: jest.Mocked<GetWalletService>;
    let snowflakeService: jest.Mocked<SnowflakeService>;
    let queryRunner: jest.Mocked<QueryRunner>;
    let dataSource: jest.Mocked<DataSource>;

    const userId = BigInt(99);
    const wallet = {
        id: BigInt(1001),
        userId,
        currency: ECurrencyType.Naira,
        balance: 5000,
    } as unknown as Wallet;

    beforeEach(async () => {
        queryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                update: jest.fn(),
                save: jest.fn(),
            } as unknown as jest.Mocked<EntityManager>,
        } as unknown as jest.Mocked<QueryRunner>;

        dataSource = {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
        } as unknown as jest.Mocked<DataSource>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FundWalletService,
                {
                    provide: GetWalletService,
                    useValue: { validate: jest.fn() },
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
                {
                    provide: SnowflakeService,
                    useValue: { generateId: jest.fn() },
                },
            ],
        }).compile();

        service = module.get(FundWalletService);
        getWalletService = module.get(GetWalletService);
        snowflakeService = module.get(SnowflakeService);
    });

    it("should fund wallet, create transaction, and return response", async () => {
        getWalletService.validate.mockResolvedValue({ ...wallet } as Wallet);
        snowflakeService.generateId
            .mockReturnValueOnce(BigInt(1)) // reference
            .mockReturnValueOnce(BigInt(2)); // transaction id

        (queryRunner.manager.update as jest.Mock).mockResolvedValue({});
        (queryRunner.manager.save as jest.Mock).mockResolvedValue({
            id: BigInt(2),
            reference: "FX-TXN-1",
        });

        const result = await service.execute(userId, { amount: 500, currency: ECurrencyType.Naira });

        expect(getWalletService.validate).toHaveBeenCalledWith(userId, ECurrencyType.Naira);
        expect(queryRunner.startTransaction).toHaveBeenCalled();

        expect(queryRunner.manager.update).toHaveBeenCalledWith(Wallet, wallet.id, {
            balance: 5500,
        });

        expect(queryRunner.manager.save).toHaveBeenCalledWith(
            Transaction,
            expect.objectContaining({
                id: BigInt(2),
                userId,
                walletId: wallet.id,
                amount: 500,
                reference: "FX-TXN-1",
            })
        );

        expect(queryRunner.commitTransaction).toHaveBeenCalled();
        expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();

        expect(result).toEqual({
            message: "Wallet funded successfully",
            transactionId: "2",
            reference: "FX-TXN-1",
        });
    });

    it("should rollback and rethrow when an error occurs", async () => {
        getWalletService.validate.mockResolvedValue({ ...wallet } as Wallet);
        (queryRunner.manager.update as jest.Mock).mockRejectedValue(new Error("DB error"));

        await expect(
            service.execute(userId, { amount: 500, currency: ECurrencyType.Naira })
        ).rejects.toThrow("DB error");

        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
    });
});

