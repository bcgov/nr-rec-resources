import { Module } from "@nestjs/common";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceController } from "./recreation-resource.controller";
import { PrismaModule } from "src/prisma.module";

@Module({
  controllers: [RecreationResourceController],
  providers: [RecreationResourceService],
  imports: [PrismaModule],
})
export class RecreationResourceModule {}
