import { Test, TestingModule } from "@nestjs/testing";
import { SnowflakeService } from "src/common";
import { ECurrencyType, WalletAdapter, Wallet } from "src/database";
import { GetWalletService } from "../get-wallet.service";

describe("GetWalletService", () => {
    let service: GetWalletService;
    let walletAdapter: jest.Mocked<WalletAdapter>;
    let snowflakeService: jest.Mocked<SnowflakeService>;

    const userId = BigInt(99);

    const ngnWallet = {
        id: BigInt(1001),
        userId,
        currency: ECurrencyType.Naira,
        balance: 500000,
    } as unknown as Wallet;

    const usdWallet = {
        id: BigInt(1002),
        userId,
        currency: ECurrencyType.Dollar,
        balance: 100,
    } as unknown as Wallet;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetWalletService,
                {
                    provide: SnowflakeService,
                    useValue: { generateId: jest.fn() },
                },
                {
                    provide: WalletAdapter,
                    useValue: {
                        findMany: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(GetWalletService);
        walletAdapter = module.get(WalletAdapter);
        snowflakeService = module.get(SnowflakeService);
    });

    describe("query", () => {
        it("should return wallets and stringify id fields", async () => {
            walletAdapter.findMany.mockResolvedValue([ngnWallet, usdWallet]);

            const result = await service.query(userId);

            expect(walletAdapter.findMany).toHaveBeenCalledWith({ userId });
            expect(result).toEqual({
                results: [
                    expect.objectContaining({
                        currency: ECurrencyType.Naira,
                        id: ngnWallet.id.toString(),
                        userId: userId.toString(),
                    }),
                    expect.objectContaining({
                        currency: ECurrencyType.Dollar,
                        id: usdWallet.id.toString(),
                        userId: userId.toString(),
                    }),
                ],
            });
        });

        it("should create a new wallet if none exists for a currency", async () => {
            walletAdapter.findMany.mockResolvedValue([]);
            snowflakeService.generateId.mockReturnValue(BigInt(2001));
            walletAdapter.create.mockResolvedValue({
                id: BigInt(2001),
                userId,
                currency: ECurrencyType.Naira,
                balance: 0,
            } as unknown as Wallet);

            const result = await service.query(userId, ECurrencyType.Naira);

            expect(walletAdapter.create).toHaveBeenCalledWith({
                id: BigInt(2001),
                userId,
                currency: ECurrencyType.Naira,
            });
            expect(result.results).toHaveLength(1);
            expect(result.results[0]).toEqual(
                expect.objectContaining({
                    currency: ECurrencyType.Naira,
                    id: "2001",
                    userId: userId.toString(),
                })
            );
        });
    });

    describe("validate", () => {
        it("should return existing wallet if found", async () => {
            walletAdapter.findOne.mockResolvedValue(ngnWallet);

            const result = await service.validate(userId, ECurrencyType.Naira);

            expect(walletAdapter.findOne).toHaveBeenCalledWith({ userId, currency: ECurrencyType.Naira });
            expect(walletAdapter.create).not.toHaveBeenCalled();
            expect(result).toBe(ngnWallet);
        });

        it("should create wallet if not found", async () => {
            walletAdapter.findOne.mockResolvedValue(null as any);
            snowflakeService.generateId.mockReturnValue(BigInt(3001));
            const created = { ...ngnWallet, id: BigInt(3001) } as Wallet;
            walletAdapter.create.mockResolvedValue(created);

            const result = await service.validate(userId, ECurrencyType.Naira);

            expect(walletAdapter.create).toHaveBeenCalledWith({
                id: BigInt(3001),
                userId,
                currency: ECurrencyType.Naira,
            });
            expect(result).toBe(created);
        });
    });

    describe("getCustomerWallets", () => {
        it("should return fromWallet and toWallet when both exist", async () => {
            walletAdapter.findMany.mockResolvedValue([ngnWallet, usdWallet]);

            const result = await service.getCustomerWallets(userId, ECurrencyType.Naira, ECurrencyType.Dollar);

            expect(walletAdapter.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    currency: expect.anything(),
                })
            );
            expect(walletAdapter.create).not.toHaveBeenCalled();
            expect(result).toEqual({
                fromWallet: ngnWallet,
                toWallet: usdWallet,
            });
        });

        it("should create missing wallets and return both", async () => {
            walletAdapter.findMany.mockResolvedValue([ngnWallet]);
            snowflakeService.generateId.mockReturnValue(BigInt(4001));
            const createdUsd = { ...usdWallet, id: BigInt(4001) } as Wallet;
            walletAdapter.create.mockResolvedValue(createdUsd);

            const result = await service.getCustomerWallets(userId, ECurrencyType.Naira, ECurrencyType.Dollar);

            expect(walletAdapter.create).toHaveBeenCalledWith({
                id: BigInt(4001),
                userId,
                currency: ECurrencyType.Dollar,
            });
            expect(result).toEqual({
                fromWallet: ngnWallet,
                toWallet: createdUsd,
            });
        });
    });
});

