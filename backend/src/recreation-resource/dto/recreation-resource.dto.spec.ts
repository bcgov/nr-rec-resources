import {
  RecreationActivityDto,
  RecreationCampsiteDto,
  RecreationFeeDto,
  RecreationResourceDto,
  RecreationStatusDto,
} from "./recreation-resource.dto";

describe("Recreation DTOs", () => {
  describe("RecreationActivityDto", () => {
    it("should create a valid RecreationActivityDto instance", () => {
      const activity = new RecreationActivityDto();
      activity.recreation_activity_code = 1;
      activity.description = "Hiking trails available for all skill levels";

      expect(activity instanceof RecreationActivityDto).toBeTruthy();
      expect(activity.recreation_activity_code).toBeDefined();
      expect(activity.description).toBeDefined();
    });
  });

  describe("RecreationStatusDto", () => {
    it("should create a valid RecreationStatusDto", () => {
      const status = new RecreationStatusDto();
      status.status_code = 2;
      status.comment = "Temporary closure due to weather conditions";
      status.description = "The facility is currently closed to visitors";

      expect(status.status_code).toBeDefined();
      expect(status.description).toBeDefined();
    });

    it("should allow null comment", () => {
      const status: RecreationStatusDto = {
        status_code: 1,
        comment: null,
        description: "The facility is open",
      };

      expect(status.comment).toBeNull();
    });
  });

  describe("RecreationResourceDto", () => {
    it("should create a valid RecreationResourceDto", () => {
      const resource: RecreationResourceDto = {
        rec_resource_id: "rec-123-abc",
        name: "Evergreen Valley Campground",
        description:
          "A scenic campground nestled in the heart of Evergreen Valley",
        closest_community: "123 Forest Road, Mountain View, CA 94043",
        rec_resource_type: "RR",
        recreation_activity: [
          {
            recreation_activity_code: 1,
            description: "Hiking",
          },
        ],
        recreation_status: {
          status_code: 1,
          comment: null,
          description: "The facility is open",
        },
        recreation_resource_images: [],
        recreation_campsite: {
          rec_resource_id: "123",
          campsite_count: 2,
        },
        recreation_structure: {
          has_table: true,
          has_toilet: true,
        },
        recreation_fee: [
          {
            fee_amount: 25.0,
            fee_start_date: new Date("2024-06-01"),
            fee_end_date: new Date("2024-09-30"),
            recreation_fee_code: "C",
            monday_ind: "Y",
            tuesday_ind: "Y",
            wednesday_ind: "Y",
            thursday_ind: "Y",
            friday_ind: "Y",
            saturday_ind: "N",
            sunday_ind: "N",
          },
          {
            fee_amount: 10.0,
            fee_start_date: new Date("2024-06-01"),
            fee_end_date: new Date("2024-09-30"),
            recreation_fee_code: "P",
            monday_ind: "Y",
            tuesday_ind: "Y",
            wednesday_ind: "Y",
            thursday_ind: "Y",
            friday_ind: "Y",
            saturday_ind: "Y",
            sunday_ind: "Y",
          },
        ],
      };

      expect(resource.rec_resource_id).toBeDefined();
      expect(resource.name.length).toBeGreaterThanOrEqual(1);
      expect(resource.name.length).toBeLessThanOrEqual(100);
      expect(Array.isArray(resource.recreation_activity)).toBeTruthy();
      expect(resource.recreation_status).toBeDefined();
      expect(resource.description).toBeDefined();
      expect(resource.closest_community).toBeDefined();
      expect(resource.rec_resource_type).toBeDefined();
    });

    it("should allow null description", () => {
      const resource: RecreationResourceDto = {
        rec_resource_id: "rec-123-abc",
        name: "Test Resource",
        description: null,
        closest_community: "Test Location",
        rec_resource_type: "RR",
        recreation_activity: [],
        recreation_status: {
          status_code: 1,
          comment: null,
          description: "Open",
        },
        recreation_structure: {
          has_table: true,
          has_toilet: true,
        },
        recreation_resource_images: [],
        recreation_campsite: {
          rec_resource_id: "123",
          campsite_count: 2,
        },
        recreation_fee: [
          {
            fee_amount: 25.0,
            fee_start_date: new Date("2024-06-01"),
            fee_end_date: new Date("2024-09-30"),
            recreation_fee_code: "C",
            monday_ind: "Y",
            tuesday_ind: "Y",
            wednesday_ind: "Y",
            thursday_ind: "Y",
            friday_ind: "Y",
            saturday_ind: "N",
            sunday_ind: "N",
          },
          {
            fee_amount: 10.0,
            fee_start_date: new Date("2024-06-01"),
            fee_end_date: new Date("2024-09-30"),
            recreation_fee_code: "P",
            monday_ind: "Y",
            tuesday_ind: "Y",
            wednesday_ind: "Y",
            thursday_ind: "Y",
            friday_ind: "Y",
            saturday_ind: "Y",
            sunday_ind: "Y",
          },
        ],
      };

      expect(resource.description).toBeNull();
    });
  });

  describe("Recreation DTOs", () => {
    describe("RecreationFeeDto", () => {
      it("should create a valid RecreationFeeDto instance", () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 20.0;
        fee.fee_start_date = new Date("2024-06-01");
        fee.fee_end_date = new Date("2024-09-30");
        fee.recreation_fee_code = "C";
        fee.monday_ind = "Y";
        fee.tuesday_ind = "Y";
        fee.wednesday_ind = "Y";
        fee.thursday_ind = "Y";
        fee.friday_ind = "Y";
        fee.saturday_ind = "N";
        fee.sunday_ind = "N";

        expect(fee instanceof RecreationFeeDto).toBeTruthy();
        expect(fee.fee_amount).toBeDefined();
        expect(fee.fee_start_date).toBeInstanceOf(Date);
        expect(fee.fee_end_date).toBeInstanceOf(Date);
        expect(fee.recreation_fee_code).toBe("C");
        expect(fee.monday_ind).toBe("Y");
      });

      it("should allow zero fee amount", () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 0;
        fee.fee_start_date = new Date("2024-06-01");
        fee.fee_end_date = new Date("2024-09-30");
        fee.recreation_fee_code = "D";
        fee.monday_ind = "N";
        fee.tuesday_ind = "N";
        fee.wednesday_ind = "N";
        fee.thursday_ind = "N";
        fee.friday_ind = "N";
        fee.saturday_ind = "N";
        fee.sunday_ind = "N";

        expect(fee.fee_amount).toBe(0);
      });

      it("should handle invalid fee code gracefully", () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 10.0;
        fee.fee_start_date = new Date("2024-06-01");
        fee.fee_end_date = new Date("2024-09-30");
        fee.recreation_fee_code = "X";
        fee.monday_ind = "Y";
        fee.tuesday_ind = "Y";
        fee.wednesday_ind = "Y";
        fee.thursday_ind = "Y";
        fee.friday_ind = "Y";
        fee.saturday_ind = "Y";
        fee.sunday_ind = "Y";

        expect(fee.recreation_fee_code).toBe("X");
      });

      it("should handle all days being selected", () => {
        const fee = new RecreationFeeDto();
        fee.fee_amount = 15.0;
        fee.fee_start_date = new Date("2024-06-01");
        fee.fee_end_date = new Date("2024-09-30");
        fee.recreation_fee_code = "P";
        fee.monday_ind = "Y";
        fee.tuesday_ind = "Y";
        fee.wednesday_ind = "Y";
        fee.thursday_ind = "Y";
        fee.friday_ind = "Y";
        fee.saturday_ind = "Y";
        fee.sunday_ind = "Y";

        expect(fee.monday_ind).toBe("Y");
        expect(fee.sunday_ind).toBe("Y");
      });
    });

    describe("RecreationCampsiteDto", () => {
      it("should create a valid RecreationCampsiteDto instance", () => {
        const campsite = new RecreationCampsiteDto();
        campsite.rec_resource_id = "rec-123-abc";
        campsite.campsite_count = 15;

        expect(campsite instanceof RecreationCampsiteDto).toBeTruthy();
        expect(campsite.rec_resource_id).toBeDefined();
        expect(campsite.campsite_count).toBeGreaterThanOrEqual(0);
      });

      it("should allow zero campsite count", () => {
        const campsite = new RecreationCampsiteDto();
        campsite.rec_resource_id = "rec-456-def";
        campsite.campsite_count = 0;

        expect(campsite.campsite_count).toBe(0);
      });

      it("should allow negative campsite count (invalid case)", () => {
        const campsite = new RecreationCampsiteDto();
        campsite.rec_resource_id = "rec-789-ghi";
        campsite.campsite_count = -1;

        expect(campsite.campsite_count).toBeLessThan(0);
      });
    });
  });
});
