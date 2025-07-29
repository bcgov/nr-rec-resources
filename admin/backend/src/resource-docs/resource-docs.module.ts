import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DamApiModule } from "src/dam-api/dam-api.module";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { ResourceDocsController } from "./resource-docs.controller";
import { ResourceDocsService } from "./service/resource-docs.service";

@Module({
  providers: [ResourceDocsService, PrismaService],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 1.5 * 1024 * 1024 }, // ~1 MB limit
    }),
    PrismaModule,
    DamApiModule,
  ],
})
export class ResourceDocsModule {}
