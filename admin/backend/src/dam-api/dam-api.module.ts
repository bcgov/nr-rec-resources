import { AppConfigModule } from "@/app-config/app-config.module";
import { Module } from "@nestjs/common";
import { DamApiService } from "./dam-api.service";

@Module({
  imports: [AppConfigModule],
  providers: [DamApiService],
  exports: [DamApiService],
})
export class DamApiModule {}
