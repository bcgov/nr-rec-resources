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

    it('accepts public_access_status:asc and public_access_status:desc as valid sorts', async () => {
      const dtoAsc = plainToInstance(AdminSearchQueryDto, {
        sort: 'public_access_status:asc',
      });
      const dtoDesc = plainToInstance(AdminSearchQueryDto, {
        sort: 'public_access_status:desc',
      });

      expect(await validate(dtoAsc)).toHaveLength(0);
      expect(await validate(dtoDesc)).toHaveLength(0);
    });

    it('accepts and transforms public_access_status as an array of strings', async () => {
      const dto = plainToInstance(AdminSearchQueryDto, {
        public_access_status: ['Open', 'Closed'],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.public_access_status).toEqual(['Open', 'Closed']);
    });

    it('accepts public_access_status as an underscore-delimited string', async () => {
      const dto = plainToInstance(AdminSearchQueryDto, {
        public_access_status: 'Open_Closed',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.public_access_status).toEqual(['Open', 'Closed']);
    });

    it('omits public_access_status when not provided', async () => {
      const dto = plainToInstance(AdminSearchQueryDto, {});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.public_access_status).toBeUndefined();
    });

    it('includes public_access_status:asc and public_access_status:desc in ADMIN_SEARCH_SORT_VALUES', () => {
      expect(ADMIN_SEARCH_SORT_VALUES).toContain('public_access_status:asc');
      expect(ADMIN_SEARCH_SORT_VALUES).toContain('public_access_status:desc');
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

    it('assigns access_status_grouplabel on AdminSearchResultRowDto', () => {
      const row = new AdminSearchResultRowDto();
      row.access_status_grouplabel = 'Closed';

      expect(row.access_status_grouplabel).toBe('Closed');
    });

    it('allows access_status_grouplabel to be null', () => {
      const row = new AdminSearchResultRowDto();
      row.access_status_grouplabel = null;

      expect(row.access_status_grouplabel).toBeNull();
    });

    it('allows access_status_grouplabel to be undefined when not set', () => {
      const row = new AdminSearchResultRowDto();

      expect(row.access_status_grouplabel).toBeUndefined();
    });
  });
});
