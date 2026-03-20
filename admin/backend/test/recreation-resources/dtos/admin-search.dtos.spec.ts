import {
  ADMIN_SEARCH_PAGE_SIZE_VALUES,
  ADMIN_SEARCH_SORT_VALUES,
  AdminSearchQueryDto,
} from '@/recreation-resources/dtos/admin-search-query.dto';
import {
  AdminSearchResponseDto,
  AdminSearchResultRowDto,
} from '@/recreation-resources/dtos/admin-search-response.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('Admin Search DTOs', () => {
  describe('AdminSearchQueryDto', () => {
    it('transforms underscore-delimited and repeated query values', async () => {
      const dto = plainToInstance(AdminSearchQueryDto, {
        q: 'tamihi',
        sort: ADMIN_SEARCH_SORT_VALUES[0],
        page: '2',
        page_size: String(ADMIN_SEARCH_PAGE_SIZE_VALUES[1]),
        type: 'SIT_RTR',
        district: ['CHWK_RDCK'],
        activities: ['1_22'],
        access: ['R_B'],
        establishment_date_from: '2020-01-01',
        establishment_date_to: '2025-12-31',
      });

      expect(await validate(dto)).toHaveLength(0);
      expect(dto.page).toBe(2);
      expect(dto.page_size).toBe(50);
      expect(dto.type).toEqual(['SIT', 'RTR']);
      expect(dto.district).toEqual(['CHWK', 'RDCK']);
      expect(dto.activities).toEqual(['1', '22']);
      expect(dto.access).toEqual(['R', 'B']);
    });

    it('rejects invalid page and sort values', async () => {
      const dto = plainToInstance(AdminSearchQueryDto, {
        page: '0',
        page_size: '75',
        sort: 'invalid:asc',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('AdminSearchResponseDto', () => {
    it('assigns response properties', () => {
      const row = new AdminSearchResultRowDto();
      row.rec_resource_id = 'REC204118';
      row.name = 'Tamihi East Campground';
      row.recreation_resource_type = 'Campground';
      row.recreation_resource_type_code = 'S';
      row.district_description = 'Chilliwack Natural Resource District';
      row.display_on_public_site = true;
      row.closest_community = 'Hope';
      row.activities = ['Hiking', 'Fishing'];
      row.access_types = ['Road', '4WD'];
      row.fee_indicators = ['Reservable', 'Has fees'];
      row.established_date = '2021-05-12';
      row.campsite_count = 24;

      const response = new AdminSearchResponseDto();
      response.data = [row];
      response.total = 137;
      response.page = 1;
      response.page_size = 25;

      expect(response.data[0]?.name).toBe('Tamihi East Campground');
      expect(response.data[0]?.activities).toEqual(['Hiking', 'Fishing']);
      expect(response.data[0]?.access_types).toEqual(['Road', '4WD']);
      expect(response.total).toBe(137);
      expect(response.page).toBe(1);
      expect(response.page_size).toBe(25);
    });
  });
});
