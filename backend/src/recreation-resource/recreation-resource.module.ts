import { Module } from "@nestjs/common";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceController } from "./recreation-resource.controller";

@Module({
  controllers: [RecreationResourceController],
  providers: [RecreationResourceService],
})
export class RecreationResourceModule {}
