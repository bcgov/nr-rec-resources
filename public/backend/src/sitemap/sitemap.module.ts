import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma.module';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
