import { UnprocessableEntityException } from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { SnowflakeService } from "../../../../common";
import { ECurrencyType, ETransactionPurpose, ETransactionStatus, ETransactionType, Transaction, Wallet } from "../../../../database";
import { FXService } from "../../../fx/services";
import { QueryRunner, DataSource, EntityManager } from "typeorm";
import { ConvertCurrencyService } from "../convert-currency.service";
import { GetWalletService } from "../get-wallet.service";


const mockFromWallet: Partial<Wallet> = {
    id: BigInt(1001),
    currency: ECurrencyType.Naira,
    balance: 500000,
    userId: BigInt(99),
};

const mockToWallet: Partial<Wallet> = {
    id: BigInt(1002),
    currency: ECurrencyType.Dollar,
    balance: 100,
    userId: BigInt(99),
};

describe('ConvertCurrencyService', () => {
    let service: ConvertCurrencyService;
    let fxService: jest.Mocked<FXService>;
    let getWalletService: jest.Mocked<GetWalletService>;
    let snowflakeService: jest.Mocked<SnowflakeService>;
    let queryRunner: jest.Mocked<QueryRunner>;
    let dataSource: jest.Mocked<DataSource>;

    beforeEach(async () => {
        queryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                findOneOrFail: jest.fn(),
                update: jest.fn(),
                save: jest.fn(),
            } as unknown as jest.Mocked<EntityManager>,
        } as unknown as jest.Mocked<QueryRunner>;

        dataSource = {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
        } as unknown as jest.Mocked<DataSource>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConvertCurrencyService,
                {
                    provide: FXService,
                    useValue: { getPairConversions: jest.fn() },
                },
                {
                    provide: GetWalletService,
                    useValue: { getCustomerWallets: jest.fn() },
                },
                {
                    provide: SnowflakeService,
                    useValue: { generateId: jest.fn() },
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();

        service = module.get<ConvertCurrencyService>(ConvertCurrencyService);
        fxService = module.get(FXService);
        getWalletService = module.get(GetWalletService);
        snowflakeService = module.get(SnowflakeService);
    });

    const userId = '99';
    const dto = { fromCurrency: ECurrencyType.Naira, toCurrency: ECurrencyType.Dollar, amount: 1000 };

    describe('execute', () => {
        it('should convert currency successfully and return a success message', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);
            snowflakeService.generateId
                .mockReturnValueOnce(BigInt(1))
                .mockReturnValueOnce(BigInt(2))
                .mockReturnValueOnce(BigInt(3))
                .mockReturnValueOnce(BigInt(4));

            (queryRunner.manager.findOneOrFail as jest.Mock)
                .mockResolvedValueOnce(mockFromWallet)
                .mockResolvedValueOnce(mockToWallet);

            (queryRunner.manager.update as jest.Mock).mockResolvedValue({});
            (queryRunner.manager.save as jest.Mock).mockResolvedValue({});

            const result = await service.execute(userId, dto);

            expect(result).toEqual({
                message: 'Currency conversion successful',
                from: { currency: ECurrencyType.Naira, debited: 1000 },
                to: { currency: ECurrencyType.Dollar, credited: 0.65 },
                rate: 0.00065,
            });
        });

        it('should throw UnprocessableEntityException if balance is insufficient (after lock)', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);

            (queryRunner.manager.findOneOrFail as jest.Mock)
                .mockResolvedValueOnce({ ...mockFromWallet, balance: 50 })
                .mockResolvedValueOnce(mockToWallet);

            await expect(service.execute(userId, dto)).rejects.toThrow(
                new UnprocessableEntityException(`Insufficient balance in ${ECurrencyType.Naira} wallet`)
            );

            expect(queryRunner.startTransaction).toHaveBeenCalled();
            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
            expect(queryRunner.release).toHaveBeenCalled();
        });

        it('should rollback transaction and rethrow if an unexpected error occurs', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);

            (queryRunner.manager.findOneOrFail as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

            await expect(service.execute(userId, dto)).rejects.toThrow('DB connection lost');

            expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
        });

        it('should always release the queryRunner even if an error is thrown', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);
            (queryRunner.manager.findOneOrFail as jest.Mock).mockRejectedValue(new Error('DB error'));

            await expect(service.execute(userId, dto)).rejects.toThrow();

            expect(queryRunner.release).toHaveBeenCalled();
        });

        it('should debit fromWallet and credit toWallet with correct amounts', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);
            snowflakeService.generateId.mockReturnValue(BigInt(1));

            (queryRunner.manager.findOneOrFail as jest.Mock)
                .mockResolvedValueOnce(mockFromWallet)
                .mockResolvedValueOnce(mockToWallet);
            (queryRunner.manager.update as jest.Mock).mockResolvedValue({});
            (queryRunner.manager.save as jest.Mock).mockResolvedValue({});

            await service.execute(userId, dto);

            expect(queryRunner.manager.update).toHaveBeenNthCalledWith(1, Wallet, mockFromWallet.id, {
                balance: Number(mockFromWallet.balance) - dto.amount,
            });

            expect(queryRunner.manager.update).toHaveBeenNthCalledWith(2, Wallet, mockToWallet.id, {
                balance: Number(mockToWallet.balance) + (0.00065 * dto.amount),
            });
        });

        it('should save a DEBIT and CREDIT transaction record', async () => {
            getWalletService.getCustomerWallets.mockResolvedValue({
                fromWallet: mockFromWallet as Wallet,
                toWallet: mockToWallet as Wallet,
            });
            fxService.getPairConversions.mockResolvedValue({ conversion_rate: 0.00065 } as any);
            snowflakeService.generateId.mockReturnValue(BigInt(1));

            (queryRunner.manager.findOneOrFail as jest.Mock)
                .mockResolvedValueOnce(mockFromWallet)
                .mockResolvedValueOnce(mockToWallet);
            (queryRunner.manager.update as jest.Mock).mockResolvedValue({});
            (queryRunner.manager.save as jest.Mock).mockResolvedValue({});

            await service.execute(userId, dto);

            expect(queryRunner.manager.save).toHaveBeenCalledWith(
                Transaction,
                expect.objectContaining({
                    type: ETransactionType.DEBIT,
                    purpose: ETransactionPurpose.CONVERSION,
                    status: ETransactionStatus.SUCCESS,
                    walletId: mockFromWallet.id,
                    amount: dto.amount,
                    rateUsed: 0.00065,
                })
            );

            expect(queryRunner.manager.save).toHaveBeenCalledWith(
                Transaction,
                expect.objectContaining({
                    type: ETransactionType.CREDIT,
                    purpose: ETransactionPurpose.CONVERSION,
                    status: ETransactionStatus.SUCCESS,
                    walletId: mockToWallet.id,
                    amount: 0.00065 * dto.amount,
                    rateUsed: 0.00065,
                })
            );
        });
    });
});