import { Module } from "@nestjs/common";
import { DamApiService } from "./dam-api.service";

@Module({
  providers: [DamApiService],
  exports: [DamApiService],
})
export class DamApiModule {}
