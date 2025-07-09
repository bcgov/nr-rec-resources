import { Module } from "@nestjs/common";
import { ResourceImagesService } from "./service/resource-images.service";
import { ResourceImagesController } from "./resource-images.controller";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ConfigService } from "@nestjs/config";

@Module({
  providers: [ResourceImagesService, PrismaService, ConfigService],
  controllers: [ResourceImagesController],
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
export class ResourceImagesModule {}
