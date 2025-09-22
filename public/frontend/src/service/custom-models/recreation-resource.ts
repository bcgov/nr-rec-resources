import {
  AlphabeticalRecreationResourceDto,
  PaginatedRecreationResourceDto,
  RecreationFeeDto,
  RecreationResourceDetailDto,
  RecreationResourceDocDto,
  RecreationResourceImageVariantDtoSizeCodeEnum,
  RecreationResourceSearchDto,
} from '@/service/recreation-resource';

export type RecreationResourceBaseModel = RecreationResourceSearchDto;
export type RecreationResourceSearchModel = RecreationResourceSearchDto;
export type RecreationResourceDetailModel = RecreationResourceDetailDto;
export type PaginatedRecreationResourceModel =
  PaginatedRecreationResourceDto & {
    data: Array<RecreationResourceSearchModel>;
  };
export type AlphabeticalRecreationResourceModel =
  AlphabeticalRecreationResourceDto;
export type RecreationFeeModel = RecreationFeeDto;
export type RecreationResourceImageVariantSizeCode =
  RecreationResourceImageVariantDtoSizeCodeEnum;
export type RecreationResourceDocModel = RecreationResourceDocDto;
