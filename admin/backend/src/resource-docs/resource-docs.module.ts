import { Module } from "@nestjs/common";
import { ResourceDocsService } from "./service/resource-docs.service";
import { ResourceDocsController } from "./resource-docs.controller";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [ResourceDocsService, PrismaService, ConfigService],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit, adjust as needed
      },
    }),
    PrismaModule,
  ],
})
export class ResourceDocsModule {}
