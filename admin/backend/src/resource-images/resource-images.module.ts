import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { ResourceImagesController } from "./resource-images.controller";
import { ResourceImagesService } from "./service/resource-images.service";

@Module({
  providers: [ResourceImagesService, PrismaService],
  controllers: [ResourceImagesController],
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10.5 * 1024 * 1024, // 10 MB limit, adjust as needed
      },
    }),
    PrismaModule,
  ],
})
export class ResourceImagesModule {}
