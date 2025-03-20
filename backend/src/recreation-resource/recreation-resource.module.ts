import { Module } from "@nestjs/common";
import { RecreationResourceService } from "src/recreation-resource/service/recreation-resource.service";
import { RecreationResourceSearchService } from "src/recreation-resource/service/search.service";
import { RecreationResourceController } from "./recreation-resource.controller";
import { PrismaModule } from "src/prisma.module";

@Module({
  controllers: [RecreationResourceController],
  providers: [RecreationResourceService, RecreationResourceSearchService],
  imports: [PrismaModule],
})
export class RecreationResourceModule {}
