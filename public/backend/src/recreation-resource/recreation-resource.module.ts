import { Module } from '@nestjs/common';
import { RecreationResourceService } from 'src/recreation-resource/service/recreation-resource.service';
import { RecreationResourceSearchService } from 'src/recreation-resource/service/recreation-resource-search.service';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { RecreationResourceAlphabeticalService } from 'src/recreation-resource/service/recreation-resource-alphabetical.service';
import { RecreationResourceController } from './recreation-resource.controller';
import { PrismaModule } from 'src/prisma.module';
import { ApiModule } from 'src/service/fsa-resources';
import { FsaResourceService } from './service/fsa-resource.service';

@Module({
  controllers: [RecreationResourceController],
  providers: [
    RecreationResourceService,
    RecreationResourceSearchService,
    RecreationResourceSuggestionsService,
    RecreationResourceAlphabeticalService,
    FsaResourceService,
  ],
  imports: [PrismaModule, ApiModule],
})
export class RecreationResourceModule {}
