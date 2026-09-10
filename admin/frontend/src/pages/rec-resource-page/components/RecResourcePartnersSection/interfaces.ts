import {
  AgreementHolderClientPublicViewDto,
  ClientLocationDto,
} from '@/services/recreation-resource-admin';

export interface PartnerListItem extends AgreementHolderClientPublicViewDto {
  locations: ClientLocationDto[];
}
