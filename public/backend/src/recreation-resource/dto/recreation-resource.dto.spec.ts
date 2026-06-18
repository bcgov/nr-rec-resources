import {
  RecreationActivityDto,
  RecreationFeeDto,
  RecreationResourceDetailDto,
  RecreationResourceDistrictDto,
  RecreationResourceReservationInfoDto,
  RecreationResourceSearchDto,
  RecreationStatusDto,
  RecreationStructureDto,
  SiteOperatorDto,
  AdvisoryDto,
} from './recreation-resource.dto';

describe('Recreation DTOs', () => {
  describe('RecreationActivityDto', () => {
    it('should create a valid RecreationActivityDto instance', () => {
      const activity = new RecreationActivityDto();
      activity.recreation_activity_code = 1;
      activity.description = 'Hiking trails available for all skill levels';

      expect(activity instanceof RecreationActivityDto).toBeTruthy();
      expect(activity.recreation_activity_code).toBeDefined();
      expect(activity.description).toBeDefined();
    });
  });

  describe('RecreationStatusDto', () => {
    it('should create a valid RecreationStatusDto', () => {
      const status = new RecreationStatusDto();
      status.status_code = 2;
      status.comment = 'Temporary closure due to weather conditions';
      status.description = 'The facility is currently closed to visitors';

      expect(status.status_code).toBeDefined();
      expect(status.description).toBeDefined();
    });

    it('should allow null comment', () => {
      const status: RecreationStatusDto = {
        status_code: 1,
        comment: null,
        description: 'The facility is open',
      };

      expect(status.comment).toBeNull();
    });
  });

  describe('AdvisoryDto', () => {
    it('should create a valid AdvisoryDto', () => {
      const advisory = new AdvisoryDto();
      advisory.advisory_number = 12345;
      advisory.title = 'Seasonal wildlife migration activity in area';
      advisory.description =
        'A permit is required to access this ecological reserve';
      advisory.submitted_by = 'John Doe, Park Ranger';
      advisory.access_status_grouplabel = 'Information';
      advisory.access_status_name = 'Information';
      advisory.access_status_description = 'General park notice or update.';
      advisory.event_type = 'Fire Management';
      advisory.urgency = 'Low';
      advisory.advisory_status = 'Published';
      advisory.is_reservations_affected = false;
      advisory.is_advisory_date_displayed = false;
      advisory.is_effective_date_displayed = false;
      advisory.is_end_date_displayed = false;
      advisory.is_updated_date_displayed = false;
      advisory.advisory_date = new Date('2024-06-01T12:00:00Z');
      advisory.effective_date = new Date('2024-06-01T12:00:00Z');
      advisory.end_date = new Date('2024-09-30T23:59:00Z');
      advisory.published_at = new Date('2024-06-01T12:00:00Z');

      expect(advisory.advisory_number).toBeDefined();
      expect(advisory.description).toBeDefined();
    });

    it('should allow null comment', () => {
      const status: RecreationStatusDto = {
        status_code: 1,
        comment: null,
        description: 'The facility is open',
      };

      expect(status.comment).toBeNull();
    });
  });

  describe('RecreationResourceDetailDto', () => {
    it('should create a valid RecreationResourceDetailDto', () => {
      const district_code = new RecreationResourceDistrictDto();
      district_code.district_code = 'RDCK';
      district_code.description = 'Chilliwack';

      const resource = new RecreationResourceDetailDto();
      resource.recreation_access = [];
      resource.spatial_feature_geometry = [];
      resource.rec_resource_id = 'rec-123-abc';
      resource.name = 'Evergreen Valley Campground';
      resource.description =
        'A scenic campground nestled in the heart of Evergreen Valley';
      resource.closest_community = '123 Forest Road, Mountain View, CA 94043';
      resource.rec_resource_type = 'RR';
      resource.recreation_activity = [
        {
          recreation_activity_code: 1,
          description: 'Hiking',
          details: '',
          is_accessible: false,
        },
      ];
      resource.recreation_status = {
        status_code: 1,
        comment: null,
        description: 'The facility is open',
      };
      resource.recreation_resource_images = [];
      resource.campsite_count = 0;
      resource.recreation_structure = {
        has_table: true,
        has_toilet: true,
      };
      resource.recreation_fee = [
        {
          fee_amount: 25.0,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'C',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'N',
          sunday_ind: 'N',
          recurring_ind: false,
        },
        {
          fee_amount: 10.0,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'P',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'Y',
          recurring_ind: false,
        },
      ];
      resource.recreation_district = district_code;

      const recreation_resource_reservation_info =
        new RecreationResourceReservationInfoDto();

      recreation_resource_reservation_info.reservation_website =
        'https://accwhistler.ca/WendyThompson.html';
      recreation_resource_reservation_info.reservation_phone_number =
        '1-999-999-9999';
      recreation_resource_reservation_info.reservation_email =
        'email@email.com';

      resource.recreation_resource_reservation_info =
        recreation_resource_reservation_info;

      expect(resource.rec_resource_id).toBeDefined();
      expect(resource.name.length).toBeGreaterThanOrEqual(1);
      expect(resource.name.length).toBeLessThanOrEqual(100);
      expect(Array.isArray(resource.recreation_activity)).toBeTruthy();
      expect(resource.recreation_status).toBeDefined();
      expect(resource.description).toBeDefined();
      expect(resource.closest_community).toBeDefined();
      expect(resource.rec_resource_type).toBeDefined();
      expect(resource.recreation_district).toBeDefined();
      expect(resource.recreation_district.district_code).toBe('RDCK');
      expect(resource.recreation_district.description).toBe('Chilliwack');
      expect(
        resource.recreation_resource_reservation_info.reservation_email,
      ).toBe('email@email.com');
    });

    it('should allow null description', () => {
      const resource = new RecreationResourceDetailDto();
      resource.recreation_access = [];
      resource.rec_resource_id = 'rec-123-abc';
      resource.name = 'Test Resource';
      resource.description = null;
      resource.closest_community = 'Test Location';
      resource.rec_resource_type = 'RR';
      resource.recreation_activity = [];
      resource.recreation_status = {
        status_code: 1,
        comment: null,
        description: 'Open',
      };
      resource.recreation_structure = {
        has_table: true,
        has_toilet: true,
      };
      resource.recreation_resource_images = [];
      resource.campsite_count = 0;
      resource.recreation_fee = [
        {
          fee_amount: 25.0,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'C',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'N',
          sunday_ind: 'N',
          recurring_ind: false,
        },
        {
          fee_amount: 10.0,
          fee_start_date: new Date('2024-06-01'),
          fee_end_date: new Date('2024-09-30'),
          recreation_fee_code: 'P',
          monday_ind: 'Y',
          tuesday_ind: 'Y',
          wednesday_ind: 'Y',
          thursday_ind: 'Y',
          friday_ind: 'Y',
          saturday_ind: 'Y',
          sunday_ind: 'Y',
          recurring_ind: false,
        },
      ];

      expect(resource.description).toBeNull();
    });

    it('should handle empty spatial feature geometry', () => {
      const resource = new RecreationResourceDetailDto();
      resource.recreation_access = [];
      resource.spatial_feature_geometry = [];
      resource.rec_resource_id = 'rec-123-abc';
      resource.name = 'Test Resource';
      resource.description = 'Test description';
      resource.closest_community = 'Test Location';
      resource.rec_resource_type = 'RR';
      resource.recreation_activity = [];
      resource.recreation_status = {
        status_code: 1,
        comment: null,
        description: 'Open',
      };
      resource.recreation_resource_images = [];
      resource.campsite_count = 0;
      resource.recreation_structure = {
        has_table: false,
        has_toilet: false,
      };
      resource.recreation_fee = [];

      expect(Array.isArray(resource.spatial_feature_geometry)).toBeTruthy();
      expect(resource.spatial_feature_geometry.length).toBe(0);
    });
  });

  describe('Recreation DTOs', () => {
    describe('RecreationFeeDto', () => {
      it('should create a valid RecreationFeeDto instance', () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 20.0;
        fee.fee_start_date = new Date('2024-06-01');
        fee.fee_end_date = new Date('2024-09-30');
        fee.recreation_fee_code = 'C';
        fee.monday_ind = 'Y';
        fee.tuesday_ind = 'Y';
        fee.wednesday_ind = 'Y';
        fee.thursday_ind = 'Y';
        fee.friday_ind = 'Y';
        fee.saturday_ind = 'N';
        fee.sunday_ind = 'N';

        expect(fee instanceof RecreationFeeDto).toBeTruthy();
        expect(fee.fee_amount).toBeDefined();
        expect(fee.fee_start_date).toBeInstanceOf(Date);
        expect(fee.fee_end_date).toBeInstanceOf(Date);
        expect(fee.recreation_fee_code).toBe('C');
        expect(fee.monday_ind).toBe('Y');
      });

      it('should allow zero fee amount', () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 0;
        fee.fee_start_date = new Date('2024-06-01');
        fee.fee_end_date = new Date('2024-09-30');
        fee.recreation_fee_code = 'D';
        fee.monday_ind = 'N';
        fee.tuesday_ind = 'N';
        fee.wednesday_ind = 'N';
        fee.thursday_ind = 'N';
        fee.friday_ind = 'N';
        fee.saturday_ind = 'N';
        fee.sunday_ind = 'N';

        expect(fee.fee_amount).toBe(0);
      });

      it('should handle invalid fee code gracefully', () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 10.0;
        fee.fee_start_date = new Date('2024-06-01');
        fee.fee_end_date = new Date('2024-09-30');
        fee.recreation_fee_code = 'X';
        fee.monday_ind = 'Y';
        fee.tuesday_ind = 'Y';
        fee.wednesday_ind = 'Y';
        fee.thursday_ind = 'Y';
        fee.friday_ind = 'Y';
        fee.saturday_ind = 'Y';
        fee.sunday_ind = 'Y';

        expect(fee.recreation_fee_code).toBe('X');
      });

      it('should handle all days being selected', () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 15.0;
        fee.fee_start_date = new Date('2024-06-01');
        fee.fee_end_date = new Date('2024-09-30');
        fee.recreation_fee_code = 'P';
        fee.monday_ind = 'Y';
        fee.tuesday_ind = 'Y';
        fee.wednesday_ind = 'Y';
        fee.thursday_ind = 'Y';
        fee.friday_ind = 'Y';
        fee.saturday_ind = 'Y';
        fee.sunday_ind = 'Y';

        expect(fee.monday_ind).toBe('Y');
        expect(fee.sunday_ind).toBe('Y');
      });
    });
  });

  describe('RecreationStructureDto', () => {
    it('should create a valid RecreationStructureDto with default values', () => {
      const structure = new RecreationStructureDto();
      structure.has_toilet = false;
      structure.has_table = false;

      expect(structure.has_toilet).toBeDefined();
      expect(structure.has_table).toBeDefined();
      expect(structure.has_toilet).toBe(false);
      expect(structure.has_table).toBe(false);
    });

    it('should allow true values for has_toilet and has_table', () => {
      const structure = new RecreationStructureDto();
      structure.has_toilet = true;
      structure.has_table = true;

      expect(structure.has_toilet).toBe(true);
      expect(structure.has_table).toBe(true);
    });

    it('should allow false values for has_toilet and has_table', () => {
      const structure = new RecreationStructureDto();
      structure.has_toilet = false;
      structure.has_table = false;

      expect(structure.has_toilet).toBe(false);
      expect(structure.has_table).toBe(false);
    });
  });

  describe('SiteOperatorDto', () => {
    it('should create a valid SiteOperatorDto', () => {
      const siteOperator = new SiteOperatorDto();

      siteOperator.clientNumber = '';
      siteOperator.clientName = '';
      siteOperator.legalFirstName = '';
      siteOperator.legalMiddleName = '';
      siteOperator.clientStatusCode = '';
      siteOperator.clientTypeCode = '';
      siteOperator.acronym = '';

      expect(siteOperator.clientNumber).toBeDefined();
      expect(siteOperator.clientName).toBeDefined();
      expect(siteOperator.legalFirstName).toBeDefined();
      expect(siteOperator.legalMiddleName).toBeDefined();
      expect(siteOperator.clientStatusCode).toBeDefined();
      expect(siteOperator.clientTypeCode).toBeDefined();
      expect(siteOperator.acronym).toBeDefined();
    });

    it('should allow null properties', () => {
      const siteOperator = new SiteOperatorDto();

      siteOperator.clientNumber = null;
      siteOperator.clientName = null;
      siteOperator.legalFirstName = null;
      siteOperator.legalMiddleName = null;
      siteOperator.clientStatusCode = null;
      siteOperator.clientTypeCode = null;
      siteOperator.acronym = null;

      expect(siteOperator.clientNumber).toBeNull();
      expect(siteOperator.clientName).toBeNull();
      expect(siteOperator.legalFirstName).toBeNull();
      expect(siteOperator.legalMiddleName).toBeNull();
      expect(siteOperator.clientStatusCode).toBeNull();
      expect(siteOperator.clientTypeCode).toBeNull();
      expect(siteOperator.acronym).toBeNull();
    });
  });

  describe('RecreationResourceSearchDto', () => {
    it('should create a valid instance with advisory_count', () => {
      const dto = new RecreationResourceSearchDto();
      dto.advisory_count = 5;

      expect(dto.advisory_count).toBe(5);
    });

    it('should allow advisory_count of zero', () => {
      const dto = new RecreationResourceSearchDto();
      dto.advisory_count = 0;

      expect(dto.advisory_count).toBe(0);
    });

    it('should allow top_access_status_grouplabel to be set', () => {
      const dto = new RecreationResourceSearchDto();
      dto.advisory_count = 1;
      dto.top_access_status_grouplabel = 'Closed';

      expect(dto.top_access_status_grouplabel).toBe('Closed');
    });

    it('should allow top_access_status_grouplabel to be undefined', () => {
      const dto = new RecreationResourceSearchDto();
      dto.advisory_count = 0;

      expect(dto.top_access_status_grouplabel).toBeUndefined();
    });
  });
});
