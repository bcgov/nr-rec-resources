import { Module } from '@nestjs/common';
import { RecreationResourceController } from './recreation-resource.controller';
import { RecreationResourceService } from './recreation-resource.service';
import { RecreationResourceRepository } from './recreation-resource.repository';
import { PrismaService } from '@/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ResourceDocsModule } from '@/resource-docs/resource-docs.module';
import { ResourceImagesModule } from '@/resource-images/resource-images.module';
import { EstablishmentOrderDocsModule } from '@/establishment-order-docs/establishment-order-docs.module';
import { OptionsModule } from './options/options.module';
import { UserContextModule } from '../common/modules/user-context/user-context.module';

@Module({
  imports: [
    ConfigModule,
    ResourceDocsModule,
    ResourceImagesModule,
    EstablishmentOrderDocsModule,
    OptionsModule,
    UserContextModule,
  ],
  controllers: [RecreationResourceController],
  providers: [
    RecreationResourceService,
    RecreationResourceRepository,
    PrismaService,
  ],
  exports: [RecreationResourceService],
})
export class RecreationResourceModule {}
