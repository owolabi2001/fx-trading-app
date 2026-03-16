import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profile, User } from "./entities";
import { ProfileAdapter, UserAdapter } from "./adapters";

const entities = [User, Profile];
const adapters = [UserAdapter, ProfileAdapter];

@Global()
@Module({
    imports: [TypeOrmModule.forFeature(entities)],
    providers: adapters,
    exports: adapters,
})
export class DatabaseModule { }