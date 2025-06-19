import { Module } from "@nestjs/common";
import { ResourceDocsService } from "./service/resource-docs.service";
import { ResourceDocsController } from "./resource-docs.controller";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@Module({
  providers: [ResourceDocsService, PrismaService],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
    PrismaModule,
  ],
})
export class ResourceDocsModule {}
