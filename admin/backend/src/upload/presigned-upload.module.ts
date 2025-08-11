import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PresignedUploadService } from "./services/presigned-upload.service";

@Module({
  imports: [ConfigModule],
  providers: [PresignedUploadService],
  exports: [PresignedUploadService],
})
export class PresignedUploadModule {}
