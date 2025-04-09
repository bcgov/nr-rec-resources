import {
  PaginatedRecreationResourceDto,
  RecreationFeeDto,
  RecreationResourceDetailDto,
  RecreationResourceDocDto,
  RecreationResourceImageVariantDtoSizeCodeEnum,
  RecreationResourceSearchDto,
  SiteOperatorDto,
} from '@/service/recreation-resource';

export type RecreationResourceBaseModel = RecreationResourceSearchDto;
export type RecreationResourceSearchModel = RecreationResourceSearchDto;
export type RecreationResourceDetailModel = RecreationResourceDetailDto;
export type SiteOperatorModel = SiteOperatorDto;
export type PaginatedRecreationResourceModel =
  PaginatedRecreationResourceDto & {
    data: Array<RecreationResourceSearchModel>;
  };
export type RecreationFeeModel = RecreationFeeDto;
export type RecreationResourceImageVariantSizeCode =
  RecreationResourceImageVariantDtoSizeCodeEnum;
export type RecreationResourceDocModel = RecreationResourceDocDto;
