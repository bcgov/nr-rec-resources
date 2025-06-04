import { Module } from "@nestjs/common";
import { ResourceDocsService } from "./service/resource-docs.service";
import { ResourceDocsController } from "./resource-docs.controller";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";

@Module({
  providers: [ResourceDocsService, PrismaService],
  controllers: [ResourceDocsController],
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    PrismaModule,
  ],
})
export class ResourceDocsModule {}
