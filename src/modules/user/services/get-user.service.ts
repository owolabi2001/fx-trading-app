import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { RedisCacheService } from "src/common";
import { User, UserAdapter } from "src/database";
import { FindOneOptions } from "typeorm";

@Injectable()
export class GetUserService {
    private readonly logger = new Logger(GetUserService.name);

    constructor(
        private readonly userAdapter: UserAdapter,
        private readonly redisService: RedisCacheService
    ) { }

    query(id: bigint, options: Omit<FindOneOptions<User>, 'where'> = {}) {
        return this.userAdapter.getOne({ id: BigInt(id) }, options);
    }

    async validate(
        id: bigint,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        const user = await this.query(id, options);

        if (!user) {
            this.logger.warn(`User with id: ${id} not found.`);
            throw new UnauthorizedException();
        }

        this.logger.log(`User with id: ${user.id} successfully retrieved.`);

        return user;
    }


    async validateByEmail(
        email: string,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        const user = await this.userAdapter.getOne({ email }, options);

        if (!user) {
            this.logger.warn(`User with requested email not found.`);
            throw new UnauthorizedException();
        }

        this.logger.log(`Successfully fetch user with id: ${user.id}`);

        return user;
    }


    async userCacheDetail(userId: bigint): Promise<User> {
        let user: User | null = await this.redisService.get(String(userId));
        this.logger.log(`Cache hit for userId ${userId}`);

        if (!user) {
            user = await this.cacheUserData(userId);
            this.logger.debug(`Cache miss for userId ${userId}`);
        }

        if (!user.isEmailVerified) {
            this.logger.warn(
                `User with id: ${userId} is not activated or has no businessId.`,
            );

            this.redisService.del(String(userId));

            user = await this.cacheUserData(userId);
        }

        return user;
    }

    async cacheUserData(userId: bigint) {
        const user = await this.validate(userId, {
            select: {
                id: true,
                email: true,
                isEmailVerified: true
            },
        });

        this.redisService.set(String(userId), user, 3600);

        return user;
    }
}