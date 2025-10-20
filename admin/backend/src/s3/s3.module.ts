import { Module } from '@nestjs/common';
import { AppConfigModule } from '@/app-config/app-config.module';
import { S3Service } from './s3.service';

@Module({
  imports: [AppConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
