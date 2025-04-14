import {
  RecreationFeeModel,
  RecreationResourceDetailModel,
} from '@/service/custom-models';
import { RecreationResourceImageDto } from '@/service/recreation-resource';

export const MOCK_RECREATION_SITE: RecreationResourceDetailModel = {
  name: 'Sample Recreation Site',
  rec_resource_type: 'Campground',
  rec_resource_id: 'REC123',
  closest_community: 'Sample City',
  recreation_activity: [],
  recreation_status: {
    status_code: 0,
    comment: null,
    description: '',
  },
  description: 'A beautiful campground located in the heart of nature.',
  driving_directions: 'Follow main highway north for 10 miles.',
  maintenance_standard_code: 'U',
  campsite_count: 10,
  recreation_fee: [],
  recreation_access: [],
  additional_fees: [],
  recreation_structure: {
    has_toilet: true,
    has_table: true,
  },
};

export const MOCK_RECREATION_SITE_IMAGES: RecreationResourceImageDto[] = [
  {
    ref_id: '28597',
    caption: '2010-12-29 10.47.03 - REC160773',
    recreation_resource_image_variants: [
      {
        size_code: 'original',
        url: '/filestore/7/9/5/8/2_29b2662ef242ddd/28597_b6f51e96f04ec60.webp?v=1742964131',
        width: 1024,
        height: 768,
        extension: 'webp',
      },
      {
        size_code: 'scr',
        url: '/filestore/7/9/5/8/2_29b2662ef242ddd/28597scr_591175db36140e6.jpg?v=1742964131',
        width: 1024,
        height: 768,
        extension: 'jpg',
      },
    ],
  },
  {
    ref_id: '27942',
    caption: '10k Cabin - REC160773',
    recreation_resource_image_variants: [
      {
        size_code: 'original',
        url: '/filestore/2/4/9/7/2_b17281a849d9046/27942_cf4a15cd6210971.webp?v=1742962173',
        width: 1024,
        height: 768,
        extension: 'webp',
      },
      {
        size_code: 'scr',
        url: '/filestore/2/4/9/7/2_b17281a849d9046/27942scr_79008d807600b83.jpg?v=1742962174',
        width: 1024,
        height: 768,
        extension: 'jpg',
      },
    ],
  },
];

export const MOCK_CAMPING_FEE_DATA = {
  fee_amount: 10,
  fee_start_date: new Date('2024-01-01'),
  fee_end_date: new Date(),
  recreation_fee_code: 'C',
  monday_ind: 'Y',
  tuesday_ind: 'Y',
  wednesday_ind: 'Y',
} as RecreationFeeModel;
