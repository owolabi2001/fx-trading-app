import { Module } from "@nestjs/common";
import { ExchangeApiService, FXService } from "./services";
import { FxController } from "./fx.controller";
import { HttpModule } from "@nestjs/axios";
@Module({
    imports: [HttpModule],
    providers: [ExchangeApiService, FXService],
    controllers: [FxController],
    exports: [FXService],
})
export class FxModule { }