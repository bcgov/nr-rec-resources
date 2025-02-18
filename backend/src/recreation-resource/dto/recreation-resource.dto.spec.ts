import {
  RecreationActivityDto,
  RecreationStatusDto,
  RecreationResourceDto,
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
        campsite_count: 2,
        recreation_fee: {
          fee_amount: 25.0,
          fee_start_date: new Date("2024-06-01"),
          fee_end_date: new Date("2024-09-30"),
          recreation_fee_code: 2,
          monday_ind: "Y",
          tuesday_ind: "Y",
          wednesday_ind: "Y",
          thursday_ind: "Y",
          friday_ind: "Y",
          saturday_ind: "N",
          sunday_ind: "N",
        },
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
        campsite_count: 2,
        recreation_fee: {
          fee_amount: 25.0,
          fee_start_date: new Date("2024-06-01"),
          fee_end_date: new Date("2024-09-30"),
          recreation_fee_code: 2,
          monday_ind: "Y",
          tuesday_ind: "Y",
          wednesday_ind: "Y",
          thursday_ind: "Y",
          friday_ind: "Y",
          saturday_ind: "N",
          sunday_ind: "N",
        },
      };

      expect(resource.description).toBeNull();
    });
  });
});
