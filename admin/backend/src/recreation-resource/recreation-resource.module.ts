import { Module } from "@nestjs/common";
import { RecreationResourceController } from "./recreation-resource.controller";
import { RecreationResourceService } from "./recreation-resource.service";
import { RecreationResourceRepository } from "./recreation-resource.repository";
import { PrismaService } from "@/prisma.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [RecreationResourceController],
  providers: [
    RecreationResourceService,
    RecreationResourceRepository,
    PrismaService,
  ],
  exports: [RecreationResourceService],
})
export class RecreationResourceModule {}
