# RST schema table export

- Source:
  `/Users/ayeshaayesha/nr-rec-resources/admin/backend/prisma/schema.prisma`
- Total tables: 97
- Base tables: 47
- History tables: 50
- Total exported columns: 884

## Files

- CSV: `/Users/ayeshaayesha/nr-rec-resources/rst-schema-tables-export.csv`
- This summary:
  `/Users/ayeshaayesha/nr-rec-resources/rst-schema-tables-export.md`

## Tables

### `recreation_resource` (21 columns)

|   # | Column                       | Prisma type   | DB type         | Nullable |
| --: | ---------------------------- | ------------- | --------------- | -------- |
|   1 | `rec_resource_id`            | `String`      | `VarChar(20)`   | NO       |
|   2 | `name`                       | `String`      | `VarChar(200)`  | YES      |
|   3 | `description`                | `String`      | `String`        | YES      |
|   4 | `closest_community`          | `String`      | `VarChar(200)`  | YES      |
|   5 | `display_on_public_site`     | `Boolean`     | `Boolean`       | YES      |
|   6 | `district_code`              | `String`      | `VarChar(4)`    | YES      |
|   7 | `maintenance_standard_code`  | `String`      | `VarChar(1)`    | YES      |
|   8 | `updated_at`                 | `DateTime`    | `Timestamp(6)`  | YES      |
|   9 | `updated_by`                 | `String`      | `String`        | YES      |
|  10 | `created_at`                 | `DateTime`    | `Timestamp(6)`  | YES      |
|  11 | `created_by`                 | `String`      | `String`        | YES      |
|  12 | `sys_period`                 | `Unsupported` | `tstzrange`     | NO       |
|  13 | `project_established_date`   | `DateTime`    | `Date`          | YES      |
|  14 | `control_access_code`        | `String`      | `VarChar(1)`    | YES      |
|  15 | `risk_rating_code`           | `String`      | `VarChar(2)`    | YES      |
|  16 | `right_of_way`               | `Decimal`     | `Decimal(7, 1)` | YES      |
|  17 | `rec_status_code`            | `String`      | `VarChar(50)`   | YES      |
|  18 | `arch_impact_assess_ind`     | `String`      | `VarChar(1)`    | YES      |
|  19 | `resource_feature_ind`       | `String`      | `VarChar(1)`    | YES      |
|  20 | `last_rec_inspection_date`   | `DateTime`    | `Date`          | YES      |
|  21 | `last_hzrd_tree_assess_date` | `DateTime`    | `Date`          | YES      |

### `recreation_activity` (7 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`          | `String`      | `VarChar(200)` | NO       |
|   2 | `recreation_activity_code` | `Int`         | `Int`          | NO       |
|   3 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`               | `String`      | `String`       | YES      |
|   5 | `created_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`               | `String`      | `String`       | YES      |
|   7 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |

### `recreation_activity_code` (6 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_activity_code` | `Int`         | `Int`          | NO       |
|   2 | `description`              | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |
|   5 | `details`                  | `String`      | `String`       | YES      |
|   6 | `is_accessible`            | `Boolean`     | `Boolean`      | YES      |

### `recreation_status` (9 columns)

|   # | Column            | Prisma type   | DB type         | Nullable |
| --: | ----------------- | ------------- | --------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(200)`  | NO       |
|   2 | `status_code`     | `Int`         | `Int`           | NO       |
|   3 | `comment`         | `String`      | `VarChar(5000)` | NO       |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)`  | YES      |
|   5 | `updated_by`      | `String`      | `String`        | YES      |
|   6 | `created_at`      | `DateTime`    | `Timestamp(6)`  | YES      |
|   7 | `created_by`      | `String`      | `String`        | YES      |
|   8 | `sys_period`      | `Unsupported` | `tstzrange`     | NO       |
|   9 | `comment_date`    | `DateTime`    | `Date`          | YES      |

### `recreation_status_code` (4 columns)

|   # | Column        | Prisma type   | DB type        | Nullable |
| --: | ------------- | ------------- | -------------- | -------- |
|   1 | `status_code` | `Int`         | `Int`          | NO       |
|   2 | `description` | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_type_code` (4 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `rec_resource_type_code` | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`            | `String`      | `VarChar(200)` | NO       |
|   3 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_district_code` (5 columns)

|   # | Column          | Prisma type   | DB type        | Nullable |
| --: | --------------- | ------------- | -------------- | -------- |
|   1 | `district_code` | `String`      | `VarChar(4)`   | NO       |
|   2 | `description`   | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`    | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`    | `Unsupported` | `tstzrange`    | NO       |
|   5 | `is_archived`   | `Boolean`     | `Boolean`      | NO       |

### `recreation_fee` (25 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`         | `String`      | `VarChar(200)` | NO       |
|   2 | `fee_amount`              | `Int`         | `Int`          | YES      |
|   3 | `fee_start_date`          | `DateTime`    | `Date`         | YES      |
|   4 | `fee_end_date`            | `DateTime`    | `Date`         | YES      |
|   5 | `monday_ind`              | `String`      | `VarChar(1)`   | YES      |
|   6 | `tuesday_ind`             | `String`      | `VarChar(1)`   | YES      |
|   7 | `wednesday_ind`           | `String`      | `VarChar(1)`   | YES      |
|   8 | `thursday_ind`            | `String`      | `VarChar(1)`   | YES      |
|   9 | `friday_ind`              | `String`      | `VarChar(1)`   | YES      |
|  10 | `saturday_ind`            | `String`      | `VarChar(1)`   | YES      |
|  11 | `sunday_ind`              | `String`      | `VarChar(1)`   | YES      |
|  12 | `recreation_fee_code`     | `String`      | `VarChar(1)`   | NO       |
|  13 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|  14 | `updated_by`              | `String`      | `String`       | YES      |
|  15 | `created_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|  16 | `created_by`              | `String`      | `String`       | YES      |
|  17 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |
|  18 | `fee_id`                  | `Int`         | `Int`          | NO       |
|  19 | `recurring_ind`           | `Boolean`     | `Boolean`      | NO       |
|  20 | `recurring_start_mmdd`    | `String`      | `String`       | YES      |
|  21 | `recurring_end_mmdd`      | `String`      | `String`       | YES      |
|  22 | `is_deleted`              | `Boolean`     | `Boolean`      | NO       |
|  23 | `deleted_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|  24 | `deleted_by`              | `String`      | `String`       | YES      |
|  25 | `recreation_fee_sub_code` | `String`      | `VarChar(30)`  | YES      |

### `recreation_fee_fdl_log` (4 columns)

|   # | Column         | Prisma type | DB type          | Nullable |
| --: | -------------- | ----------- | ---------------- | -------- |
|   1 | `id`           | `BigInt`    | `BigInt`         | NO       |
|   2 | `fee_id`       | `Int`       | `Int`            | NO       |
|   3 | `confirmed_by` | `String`    | `String`         | NO       |
|   4 | `confirmed_at` | `DateTime`  | `Timestamptz(6)` | NO       |

### `recreation_fee_code` (4 columns)

|   # | Column                | Prisma type   | DB type        | Nullable |
| --: | --------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_fee_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`         | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`          | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`          | `Unsupported` | `tstzrange`    | NO       |

### `recreation_fee_sub_code` (5 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_fee_code`     | `String`      | `VarChar(1)`   | NO       |
|   2 | `recreation_fee_sub_code` | `String`      | `VarChar(30)`  | NO       |
|   3 | `description`             | `String`      | `VarChar(120)` | NO       |
|   4 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_structure` (7 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(20)`  | NO       |
|   2 | `structure_code`  | `Int`         | `Int`          | NO       |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`      | `String`      | `String`       | YES      |
|   5 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`      | `String`      | `String`       | YES      |
|   7 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_structure_code` (4 columns)

|   # | Column           | Prisma type   | DB type        | Nullable |
| --: | ---------------- | ------------- | -------------- | -------- |
|   1 | `structure_code` | `Int`         | `Int`          | NO       |
|   2 | `description`    | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`     | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_access` (9 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `id`              | `Int`         | `Int`          | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(20)`  | NO       |
|   3 | `access_code`     | `String`      | `VarChar(3)`   | NO       |
|   4 | `sub_access_code` | `String`      | `VarChar(3)`   | YES      |
|   5 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `updated_by`      | `String`      | `String`       | YES      |
|   7 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `created_by`      | `String`      | `String`       | YES      |
|   9 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_access_code` (5 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `access_code`     | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`     | `String`      | `VarChar(120)` | YES      |
|   3 | `sub_description` | `String`      | `VarChar(120)` | YES      |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_sub_access_code` (4 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `sub_access_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`     | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_map_feature` (15 columns)

|   # | Column                        | Prisma type   | DB type        | Nullable |
| --: | ----------------------------- | ------------- | -------------- | -------- |
|   1 | `rmf_skey`                    | `Int`         | `Int`          | NO       |
|   2 | `rec_resource_id`             | `String`      | `VarChar(10)`  | YES      |
|   3 | `section_id`                  | `String`      | `VarChar(30)`  | YES      |
|   4 | `amendment_id`                | `Int`         | `Int`          | YES      |
|   5 | `amend_status_code`           | `String`      | `VarChar(3)`   | YES      |
|   6 | `recreation_resource_type`    | `String`      | `VarChar(3)`   | YES      |
|   7 | `amend_status_date`           | `DateTime`    | `Date`         | YES      |
|   8 | `retirement_date`             | `DateTime`    | `Date`         | YES      |
|   9 | `revision_count`              | `Int`         | `Int`          | YES      |
|  10 | `recreation_map_feature_guid` | `String`      | `VarChar(36)`  | YES      |
|  11 | `updated_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|  12 | `updated_by`                  | `String`      | `String`       | YES      |
|  13 | `created_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|  14 | `created_by`                  | `String`      | `String`       | YES      |
|  15 | `sys_period`                  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_map_feature_geom` (13 columns)

|   # | Column               | Prisma type   | DB type          | Nullable |
| --: | -------------------- | ------------- | ---------------- | -------- |
|   1 | `rmf_skey`           | `Int`         | `Int`            | NO       |
|   2 | `map_feature_id`     | `Int`         | `Int`            | YES      |
|   3 | `geometry_type_code` | `String`      | `VarChar(3)`     | YES      |
|   4 | `geometry`           | `Unsupported` | `geometry`       | YES      |
|   5 | `feature_area`       | `Decimal`     | `Decimal(11, 4)` | YES      |
|   6 | `feature_length`     | `Decimal`     | `Decimal(11, 4)` | YES      |
|   7 | `feature_perimeter`  | `Decimal`     | `Decimal(11, 4)` | YES      |
|   8 | `revision_count`     | `Int`         | `Int`            | YES      |
|   9 | `updated_at`         | `DateTime`    | `Timestamp(6)`   | YES      |
|  10 | `updated_by`         | `String`      | `String`         | YES      |
|  11 | `created_at`         | `DateTime`    | `Timestamp(6)`   | YES      |
|  12 | `created_by`         | `String`      | `String`         | YES      |
|  13 | `sys_period`         | `Unsupported` | `tstzrange`      | NO       |

### `recreation_access_code_history` (5 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `access_code`     | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`     | `String`      | `VarChar(120)` | YES      |
|   3 | `sub_description` | `String`      | `VarChar(120)` | YES      |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_access_history` (9 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `id`              | `Int`         | `Int`          | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(20)`  | NO       |
|   3 | `access_code`     | `String`      | `VarChar(3)`   | NO       |
|   4 | `sub_access_code` | `String`      | `VarChar(3)`   | YES      |
|   5 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `updated_by`      | `String`      | `String`       | YES      |
|   7 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `created_by`      | `String`      | `String`       | YES      |
|   9 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_activity_code_history` (4 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_activity_code` | `Int`         | `Int`          | NO       |
|   2 | `description`              | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |

### `recreation_activity_history` (7 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`          | `String`      | `VarChar(200)` | NO       |
|   2 | `recreation_activity_code` | `Int`         | `Int`          | NO       |
|   3 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`               | `String`      | `String`       | YES      |
|   5 | `created_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`               | `String`      | `String`       | YES      |
|   7 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |

### `recreation_district_code_history` (5 columns)

|   # | Column          | Prisma type   | DB type        | Nullable |
| --: | --------------- | ------------- | -------------- | -------- |
|   1 | `district_code` | `String`      | `VarChar(4)`   | NO       |
|   2 | `description`   | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`    | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`    | `Unsupported` | `tstzrange`    | NO       |
|   5 | `is_archived`   | `Boolean`     | `Boolean`      | NO       |

### `recreation_fee_code_history` (4 columns)

|   # | Column                | Prisma type   | DB type        | Nullable |
| --: | --------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_fee_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`         | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`          | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`          | `Unsupported` | `tstzrange`    | NO       |

### `recreation_fee_history` (24 columns)

|   # | Column                 | Prisma type   | DB type        | Nullable |
| --: | ---------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`      | `String`      | `VarChar(200)` | NO       |
|   2 | `fee_amount`           | `Int`         | `Int`          | YES      |
|   3 | `fee_start_date`       | `DateTime`    | `Date`         | YES      |
|   4 | `fee_end_date`         | `DateTime`    | `Date`         | YES      |
|   5 | `monday_ind`           | `String`      | `VarChar(1)`   | YES      |
|   6 | `tuesday_ind`          | `String`      | `VarChar(1)`   | YES      |
|   7 | `wednesday_ind`        | `String`      | `VarChar(1)`   | YES      |
|   8 | `thursday_ind`         | `String`      | `VarChar(1)`   | YES      |
|   9 | `friday_ind`           | `String`      | `VarChar(1)`   | YES      |
|  10 | `saturday_ind`         | `String`      | `VarChar(1)`   | YES      |
|  11 | `sunday_ind`           | `String`      | `VarChar(1)`   | YES      |
|  12 | `recreation_fee_code`  | `String`      | `VarChar(1)`   | NO       |
|  13 | `updated_at`           | `DateTime`    | `Timestamp(6)` | YES      |
|  14 | `updated_by`           | `String`      | `String`       | YES      |
|  15 | `created_at`           | `DateTime`    | `Timestamp(6)` | YES      |
|  16 | `created_by`           | `String`      | `String`       | YES      |
|  17 | `sys_period`           | `Unsupported` | `tstzrange`    | NO       |
|  18 | `recurring_ind`        | `Boolean`     | `Boolean`      | YES      |
|  19 | `recurring_start_mmdd` | `String`      | `String`       | YES      |
|  20 | `recurring_end_mmdd`   | `String`      | `String`       | YES      |
|  21 | `fee_id`               | `Int`         | `Int`          | YES      |
|  22 | `is_deleted`           | `Boolean`     | `Boolean`      | YES      |
|  23 | `deleted_at`           | `DateTime`    | `Timestamp(6)` | YES      |
|  24 | `deleted_by`           | `String`      | `String`       | YES      |

### `recreation_map_feature_geom_history` (13 columns)

|   # | Column               | Prisma type   | DB type          | Nullable |
| --: | -------------------- | ------------- | ---------------- | -------- |
|   1 | `rmf_skey`           | `Int`         | `Int`            | NO       |
|   2 | `map_feature_id`     | `Int`         | `Int`            | YES      |
|   3 | `geometry_type_code` | `String`      | `VarChar(3)`     | YES      |
|   4 | `geometry`           | `Unsupported` | `geometry`       | YES      |
|   5 | `feature_area`       | `Decimal`     | `Decimal(11, 4)` | YES      |
|   6 | `feature_length`     | `Decimal`     | `Decimal(11, 4)` | YES      |
|   7 | `feature_perimeter`  | `Decimal`     | `Decimal(11, 4)` | YES      |
|   8 | `revision_count`     | `Int`         | `Int`            | YES      |
|   9 | `updated_at`         | `DateTime`    | `Timestamp(6)`   | YES      |
|  10 | `updated_by`         | `String`      | `String`         | YES      |
|  11 | `created_at`         | `DateTime`    | `Timestamp(6)`   | YES      |
|  12 | `created_by`         | `String`      | `String`         | YES      |
|  13 | `sys_period`         | `Unsupported` | `tstzrange`      | NO       |

### `recreation_map_feature_history` (15 columns)

|   # | Column                        | Prisma type   | DB type        | Nullable |
| --: | ----------------------------- | ------------- | -------------- | -------- |
|   1 | `rmf_skey`                    | `Int`         | `Int`          | NO       |
|   2 | `rec_resource_id`             | `String`      | `VarChar(10)`  | YES      |
|   3 | `section_id`                  | `String`      | `VarChar(30)`  | YES      |
|   4 | `amendment_id`                | `Int`         | `Int`          | YES      |
|   5 | `amend_status_code`           | `String`      | `VarChar(3)`   | YES      |
|   6 | `recreation_resource_type`    | `String`      | `VarChar(3)`   | YES      |
|   7 | `amend_status_date`           | `DateTime`    | `Date`         | YES      |
|   8 | `retirement_date`             | `DateTime`    | `Date`         | YES      |
|   9 | `revision_count`              | `Int`         | `Int`          | YES      |
|  10 | `recreation_map_feature_guid` | `String`      | `VarChar(36)`  | YES      |
|  11 | `updated_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|  12 | `updated_by`                  | `String`      | `String`       | YES      |
|  13 | `created_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|  14 | `created_by`                  | `String`      | `String`       | YES      |
|  15 | `sys_period`                  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_history` (21 columns)

|   # | Column                       | Prisma type   | DB type         | Nullable |
| --: | ---------------------------- | ------------- | --------------- | -------- |
|   1 | `rec_resource_id`            | `String`      | `VarChar(20)`   | NO       |
|   2 | `name`                       | `String`      | `VarChar(200)`  | YES      |
|   3 | `description`                | `String`      | `String`        | YES      |
|   4 | `closest_community`          | `String`      | `VarChar(200)`  | YES      |
|   5 | `display_on_public_site`     | `Boolean`     | `Boolean`       | YES      |
|   6 | `district_code`              | `String`      | `VarChar(4)`    | YES      |
|   7 | `maintenance_standard_code`  | `String`      | `VarChar(1)`    | YES      |
|   8 | `updated_at`                 | `DateTime`    | `Timestamp(6)`  | YES      |
|   9 | `updated_by`                 | `String`      | `String`        | YES      |
|  10 | `created_at`                 | `DateTime`    | `Timestamp(6)`  | YES      |
|  11 | `created_by`                 | `String`      | `String`        | YES      |
|  12 | `sys_period`                 | `Unsupported` | `tstzrange`     | NO       |
|  13 | `project_established_date`   | `DateTime`    | `Date`          | YES      |
|  14 | `control_access_code`        | `String`      | `VarChar(1)`    | YES      |
|  15 | `risk_rating_code`           | `String`      | `VarChar(2)`    | YES      |
|  16 | `right_of_way`               | `Decimal`     | `Decimal(7, 1)` | YES      |
|  17 | `rec_status_code`            | `String`      | `VarChar(50)`   | YES      |
|  18 | `arch_impact_assess_ind`     | `String`      | `VarChar(1)`    | YES      |
|  19 | `resource_feature_ind`       | `String`      | `VarChar(1)`    | YES      |
|  20 | `last_rec_inspection_date`   | `DateTime`    | `Date`          | YES      |
|  21 | `last_hzrd_tree_assess_date` | `DateTime`    | `Date`          | YES      |

### `recreation_resource_type_code_history` (4 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `rec_resource_type_code` | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`            | `String`      | `VarChar(200)` | NO       |
|   3 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_status_code_history` (4 columns)

|   # | Column        | Prisma type   | DB type        | Nullable |
| --: | ------------- | ------------- | -------------- | -------- |
|   1 | `status_code` | `Int`         | `Int`          | NO       |
|   2 | `description` | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_status_history` (9 columns)

|   # | Column            | Prisma type   | DB type         | Nullable |
| --: | ----------------- | ------------- | --------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(200)`  | NO       |
|   2 | `status_code`     | `Int`         | `Int`           | NO       |
|   3 | `comment`         | `String`      | `VarChar(5000)` | NO       |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)`  | YES      |
|   5 | `updated_by`      | `String`      | `String`        | YES      |
|   6 | `created_at`      | `DateTime`    | `Timestamp(6)`  | YES      |
|   7 | `created_by`      | `String`      | `String`        | YES      |
|   8 | `sys_period`      | `Unsupported` | `tstzrange`     | NO       |
|   9 | `comment_date`    | `DateTime`    | `Date`          | YES      |

### `recreation_structure_code_history` (4 columns)

|   # | Column           | Prisma type   | DB type        | Nullable |
| --: | ---------------- | ------------- | -------------- | -------- |
|   1 | `structure_code` | `Int`         | `Int`          | NO       |
|   2 | `description`    | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`     | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_structure_history` (7 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(20)`  | NO       |
|   2 | `structure_code`  | `Int`         | `Int`          | NO       |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`      | `String`      | `String`       | YES      |
|   5 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`      | `String`      | `String`       | YES      |
|   7 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_sub_access_code_history` (4 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `sub_access_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`     | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_doc_code` (7 columns)

|   # | Column        | Prisma type   | DB type        | Nullable |
| --: | ------------- | ------------- | -------------- | -------- |
|   1 | `doc_code`    | `String`      | `VarChar`      | NO       |
|   2 | `description` | `String`      | `VarChar`      | YES      |
|   3 | `updated_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`  | `String`      | `String`       | YES      |
|   5 | `created_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`  | `String`      | `String`       | YES      |
|   7 | `sys_period`  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_establishment_order_docs` (10 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `s3_key`          | `String`      | `VarChar`      | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | YES      |
|   3 | `title`           | `String`      | `VarChar`      | YES      |
|   4 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   5 | `extension`       | `String`      | `VarChar`      | YES      |
|   6 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`      | `String`      | `String`       | YES      |
|   8 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`      | `String`      | `String`       | YES      |
|  10 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `flyway_schema_history` (10 columns)

|   # | Column           | Prisma type | DB type         | Nullable |
| --: | ---------------- | ----------- | --------------- | -------- |
|   1 | `installed_rank` | `Int`       | `Int`           | NO       |
|   2 | `version`        | `String`    | `VarChar(50)`   | YES      |
|   3 | `description`    | `String`    | `VarChar(200)`  | NO       |
|   4 | `type`           | `String`    | `VarChar(20)`   | NO       |
|   5 | `script`         | `String`    | `VarChar(1000)` | NO       |
|   6 | `checksum`       | `Int`       | `Int`           | YES      |
|   7 | `installed_by`   | `String`    | `VarChar(100)`  | NO       |
|   8 | `installed_on`   | `DateTime`  | `Timestamp(6)`  | NO       |
|   9 | `execution_time` | `Int`       | `Int`           | NO       |
|  10 | `success`        | `Boolean`   | `Boolean`       | NO       |

### `recreation_resource_doc_code_history` (7 columns)

|   # | Column        | Prisma type   | DB type        | Nullable |
| --: | ------------- | ------------- | -------------- | -------- |
|   1 | `doc_code`    | `String`      | `VarChar`      | NO       |
|   2 | `description` | `String`      | `VarChar`      | YES      |
|   3 | `updated_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`  | `String`      | `String`       | YES      |
|   5 | `created_at`  | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`  | `String`      | `String`       | YES      |
|   7 | `sys_period`  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_docs_history` (11 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `ref_id`          | `String`      | `VarChar`      | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | YES      |
|   3 | `title`           | `String`      | `VarChar`      | YES      |
|   4 | `url`             | `String`      | `VarChar`      | YES      |
|   5 | `doc_code`        | `String`      | `VarChar`      | YES      |
|   6 | `extension`       | `String`      | `VarChar`      | YES      |
|   7 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`      | `String`      | `String`       | YES      |
|   9 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`      | `String`      | `String`       | YES      |
|  11 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_image_variants_history` (11 columns)

|   # | Column       | Prisma type   | DB type        | Nullable |
| --: | ------------ | ------------- | -------------- | -------- |
|   1 | `ref_id`     | `String`      | `VarChar`      | NO       |
|   2 | `size_code`  | `String`      | `VarChar(20)`  | NO       |
|   3 | `url`        | `String`      | `String`       | YES      |
|   4 | `width`      | `Int`         | `Int`          | YES      |
|   5 | `height`     | `Int`         | `Int`          | YES      |
|   6 | `extension`  | `String`      | `VarChar(10)`  | YES      |
|   7 | `updated_at` | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by` | `String`      | `String`       | YES      |
|   9 | `created_at` | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by` | `String`      | `String`       | YES      |
|  11 | `sys_period` | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_images_history` (8 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   2 | `ref_id`          | `String`      | `VarChar`      | NO       |
|   3 | `caption`         | `String`      | `VarChar`      | YES      |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `updated_by`      | `String`      | `String`       | YES      |
|   6 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `created_by`      | `String`      | `String`       | YES      |
|   8 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_site_point` (8 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   2 | `geometry`        | `Unsupported` | `geometry`     | YES      |
|   3 | `revision_count`  | `Int`         | `Int`          | YES      |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `updated_by`      | `String`      | `String`       | YES      |
|   6 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `created_by`      | `String`      | `String`       | YES      |
|   8 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_site_point_history` (8 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   2 | `geometry`        | `Unsupported` | `geometry`     | YES      |
|   3 | `revision_count`  | `Int`         | `Int`          | YES      |
|   4 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `updated_by`      | `String`      | `String`       | YES      |
|   6 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `created_by`      | `String`      | `String`       | YES      |
|   8 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_defined_campsite` (10 columns)

|   # | Column                         | Prisma type   | DB type          | Nullable |
| --: | ------------------------------ | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`              | `String`      | `VarChar(10)`    | NO       |
|   2 | `campsite_number`              | `Int`         | `Int`            | NO       |
|   3 | `estimated_repair_cost`        | `Decimal`     | `Decimal(10, 2)` | YES      |
|   4 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`     | YES      |
|   5 | `repair_complete_date`         | `DateTime`    | `Date`           | YES      |
|   6 | `updated_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|   7 | `updated_by`                   | `String`      | `String`         | YES      |
|   8 | `created_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|   9 | `created_by`                   | `String`      | `String`         | YES      |
|  10 | `sys_period`                   | `Unsupported` | `tstzrange`      | NO       |

### `recreation_defined_campsite_history` (10 columns)

|   # | Column                         | Prisma type   | DB type          | Nullable |
| --: | ------------------------------ | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`              | `String`      | `VarChar(10)`    | NO       |
|   2 | `campsite_number`              | `Int`         | `Int`            | NO       |
|   3 | `estimated_repair_cost`        | `Decimal`     | `Decimal(10, 2)` | YES      |
|   4 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`     | YES      |
|   5 | `repair_complete_date`         | `DateTime`    | `Date`           | YES      |
|   6 | `updated_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|   7 | `updated_by`                   | `String`      | `String`         | YES      |
|   8 | `created_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|   9 | `created_by`                   | `String`      | `String`         | YES      |
|  10 | `sys_period`                   | `Unsupported` | `tstzrange`      | NO       |

### `recreation_driving_direction` (8 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`         | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`             | `String`      | `String`       | YES      |
|   3 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`              | `String`      | `String`       | YES      |
|   5 | `created_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`              | `String`      | `String`       | YES      |
|   7 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |
|   8 | `driving_directions_date` | `DateTime`    | `Date`         | YES      |

### `recreation_driving_direction_history` (7 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`     | `String`      | `String`       | YES      |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`      | `String`      | `String`       | YES      |
|   5 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`      | `String`      | `String`       | YES      |
|   7 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_maintenance_standard_code` (4 columns)

|   # | Column                      | Prisma type   | DB type        | Nullable |
| --: | --------------------------- | ------------- | -------------- | -------- |
|   1 | `maintenance_standard_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`               | `String`      | `VarChar(200)` | NO       |
|   3 | `updated_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                | `Unsupported` | `tstzrange`    | NO       |

### `recreation_maintenance_standard_code_history` (4 columns)

|   # | Column                      | Prisma type   | DB type        | Nullable |
| --: | --------------------------- | ------------- | -------------- | -------- |
|   1 | `maintenance_standard_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`               | `String`      | `VarChar(200)` | NO       |
|   3 | `updated_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                | `Unsupported` | `tstzrange`    | NO       |

### `recreation_remed_repair_code` (4 columns)

|   # | Column                         | Prisma type   | DB type        | Nullable |
| --: | ------------------------------ | ------------- | -------------- | -------- |
|   1 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`   | NO       |
|   2 | `description`                  | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`                   | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                   | `Unsupported` | `tstzrange`    | NO       |

### `recreation_remed_repair_code_history` (4 columns)

|   # | Column                         | Prisma type   | DB type        | Nullable |
| --: | ------------------------------ | ------------- | -------------- | -------- |
|   1 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`   | NO       |
|   2 | `description`                  | `String`      | `VarChar(120)` | YES      |
|   3 | `updated_at`                   | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                   | `Unsupported` | `tstzrange`    | NO       |

### `recreation_site_description` (8 columns)

|   # | Column             | Prisma type   | DB type        | Nullable |
| --: | ------------------ | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`  | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`      | `String`      | `String`       | YES      |
|   3 | `updated_at`       | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`       | `String`      | `String`       | YES      |
|   5 | `created_at`       | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`       | `String`      | `String`       | YES      |
|   7 | `sys_period`       | `Unsupported` | `tstzrange`    | NO       |
|   8 | `description_date` | `DateTime`    | `Date`         | YES      |

### `recreation_site_description_history` (7 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   2 | `description`     | `String`      | `String`       | YES      |
|   3 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`      | `String`      | `String`       | YES      |
|   5 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`      | `String`      | `String`       | YES      |
|   7 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_agreement_holder` (13 columns)

|   # | Column                      | Prisma type   | DB type        | Nullable |
| --: | --------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`           | `String`      | `VarChar(10)`  | NO       |
|   2 | `client_number`             | `String`      | `VarChar(8)`   | YES      |
|   3 | `agreement_start_date`      | `DateTime`    | `Date`         | YES      |
|   4 | `agreement_end_date`        | `DateTime`    | `Date`         | YES      |
|   5 | `revision_count`            | `Int`         | `Int`          | YES      |
|   6 | `updated_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`                | `String`      | `String`       | YES      |
|   8 | `created_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`                | `String`      | `String`       | YES      |
|  10 | `sys_period`                | `Unsupported` | `tstzrange`    | NO       |
|  11 | `agreement_holder_id`       | `Int`         | `Int`          | NO       |
|  12 | `visible_on_public_website` | `Boolean`     | `Boolean`      | NO       |
|  13 | `recreation_operator`       | `Boolean`     | `Boolean`      | NO       |

### `recreation_agreement_holder_history` (13 columns)

|   # | Column                      | Prisma type   | DB type        | Nullable |
| --: | --------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`           | `String`      | `VarChar(10)`  | NO       |
|   2 | `client_number`             | `String`      | `VarChar(8)`   | YES      |
|   3 | `agreement_start_date`      | `DateTime`    | `Date`         | YES      |
|   4 | `agreement_end_date`        | `DateTime`    | `Date`         | YES      |
|   5 | `revision_count`            | `Int`         | `Int`          | YES      |
|   6 | `updated_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`                | `String`      | `String`       | YES      |
|   8 | `created_at`                | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`                | `String`      | `String`       | YES      |
|  10 | `sys_period`                | `Unsupported` | `tstzrange`    | NO       |
|  11 | `agreement_holder_id`       | `Int`         | `Int`          | YES      |
|  12 | `visible_on_public_website` | `Boolean`     | `Boolean`      | YES      |
|  13 | `recreation_operator`       | `Boolean`     | `Boolean`      | YES      |

### `recreation_partner_relationship_type_code` (4 columns)

|   # | Column                           | Prisma type   | DB type        | Nullable |
| --: | -------------------------------- | ------------- | -------------- | -------- |
|   1 | `partner_relationship_type_code` | `String`      | `VarChar(20)`  | NO       |
|   2 | `description`                    | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_partner_relationship_type_code_history` (4 columns)

|   # | Column                           | Prisma type   | DB type        | Nullable |
| --: | -------------------------------- | ------------- | -------------- | -------- |
|   1 | `partner_relationship_type_code` | `String`      | `VarChar(20)`  | NO       |
|   2 | `description`                    | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`                     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_reservation_info` (9 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`          | `String`      | `VarChar(10)`  | NO       |
|   2 | `reservation_website`      | `String`      | `VarChar(200)` | YES      |
|   3 | `reservation_phone_number` | `String`      | `VarChar(50)`  | YES      |
|   4 | `reservation_email`        | `String`      | `VarChar(100)` | YES      |
|   5 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `updated_by`               | `String`      | `String`       | YES      |
|   7 | `created_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `created_by`               | `String`      | `String`       | YES      |
|   9 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_reservation_info_history` (11 columns)

|   # | Column                     | Prisma type   | DB type        | Nullable |
| --: | -------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`          | `String`      | `VarChar(10)`  | NO       |
|   2 | `reservation_instructions` | `String`      | `VarChar(200)` | YES      |
|   3 | `reservation_website`      | `String`      | `VarChar(200)` | YES      |
|   4 | `reservation_phone_number` | `String`      | `VarChar(50)`  | YES      |
|   5 | `reservation_email`        | `String`      | `VarChar(100)` | YES      |
|   6 | `reservation_comments`     | `String`      | `VarChar(400)` | YES      |
|   7 | `updated_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`               | `String`      | `String`       | YES      |
|   9 | `created_at`               | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`               | `String`      | `String`       | YES      |
|  11 | `sys_period`               | `Unsupported` | `tstzrange`    | NO       |

### `recreation_control_access_code` (10 columns)

|   # | Column                           | Prisma type   | DB type        | Nullable |
| --: | -------------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_control_access_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`                    | `String`      | `VarChar(120)` | YES      |
|   3 | `effective_date`                 | `DateTime`    | `Date`         | YES      |
|   4 | `expiry_date`                    | `DateTime`    | `Date`         | YES      |
|   5 | `update_timestamp`               | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `updated_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`                     | `String`      | `String`       | YES      |
|   8 | `created_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`                     | `String`      | `String`       | YES      |
|  10 | `sys_period`                     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_control_access_code_history` (10 columns)

|   # | Column                           | Prisma type   | DB type        | Nullable |
| --: | -------------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_control_access_code` | `String`      | `VarChar(1)`   | NO       |
|   2 | `description`                    | `String`      | `VarChar(120)` | YES      |
|   3 | `effective_date`                 | `DateTime`    | `Date`         | YES      |
|   4 | `expiry_date`                    | `DateTime`    | `Date`         | YES      |
|   5 | `update_timestamp`               | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `updated_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`                     | `String`      | `String`       | YES      |
|   8 | `created_at`                     | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`                     | `String`      | `String`       | YES      |
|  10 | `sys_period`                     | `Unsupported` | `tstzrange`    | NO       |

### `recreation_establishment_order_docs_history` (10 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `s3_key`          | `String`      | `VarChar`      | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | YES      |
|   3 | `title`           | `String`      | `VarChar`      | YES      |
|   4 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   5 | `extension`       | `String`      | `VarChar`      | YES      |
|   6 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`      | `String`      | `String`       | YES      |
|   8 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`      | `String`      | `String`       | YES      |
|  10 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_risk_rating_code` (4 columns)

|   # | Column             | Prisma type   | DB type        | Nullable |
| --: | ------------------ | ------------- | -------------- | -------- |
|   1 | `risk_rating_code` | `String`      | `VarChar(2)`   | NO       |
|   2 | `description`      | `String`      | `VarChar(100)` | NO       |
|   3 | `updated_at`       | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`       | `Unsupported` | `tstzrange`    | NO       |

### `recreation_risk_rating_code_history` (4 columns)

|   # | Column             | Prisma type   | DB type        | Nullable |
| --: | ------------------ | ------------- | -------------- | -------- |
|   1 | `risk_rating_code` | `String`      | `VarChar(2)`   | NO       |
|   2 | `description`      | `String`      | `VarChar(100)` | NO       |
|   3 | `updated_at`       | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`       | `Unsupported` | `tstzrange`    | NO       |

### `recreation_access_and_sub_access_code` (6 columns)

|   # | Column                        | Prisma type   | DB type        | Nullable |
| --: | ----------------------------- | ------------- | -------------- | -------- |
|   1 | `access_code`                 | `String`      | `VarChar(3)`   | NO       |
|   2 | `access_code_description`     | `String`      | `VarChar(100)` | NO       |
|   3 | `sub_access_code`             | `String`      | `VarChar(3)`   | NO       |
|   4 | `sub_access_code_description` | `String`      | `VarChar(100)` | YES      |
|   5 | `updated_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `sys_period`                  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_access_and_sub_access_code_history` (6 columns)

|   # | Column                        | Prisma type   | DB type        | Nullable |
| --: | ----------------------------- | ------------- | -------------- | -------- |
|   1 | `access_code`                 | `String`      | `VarChar(3)`   | NO       |
|   2 | `access_code_description`     | `String`      | `VarChar(100)` | NO       |
|   3 | `sub_access_code`             | `String`      | `VarChar(3)`   | NO       |
|   4 | `sub_access_code_description` | `String`      | `VarChar(100)` | YES      |
|   5 | `updated_at`                  | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `sys_period`                  | `Unsupported` | `tstzrange`    | NO       |

### `recreation_feature` (7 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`         | `String`      | `VarChar(20)`  | NO       |
|   2 | `recreation_feature_code` | `String`      | `VarChar(3)`   | NO       |
|   3 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`              | `String`      | `String`       | YES      |
|   5 | `created_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`              | `String`      | `String`       | YES      |
|   7 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_feature_code` (4 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_feature_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`             | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_feature_code_history` (4 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_feature_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`             | `String`      | `VarChar(120)` | NO       |
|   3 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_feature_history` (7 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `rec_resource_id`         | `String`      | `VarChar(20)`  | NO       |
|   2 | `recreation_feature_code` | `String`      | `VarChar(3)`   | NO       |
|   3 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`              | `String`      | `String`       | YES      |
|   5 | `created_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`              | `String`      | `String`       | YES      |
|   7 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_document` (11 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `doc_id`          | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `doc_code`        | `String`      | `VarChar`      | NO       |
|   4 | `file_name`       | `String`      | `VarChar`      | NO       |
|   5 | `extension`       | `String`      | `VarChar`      | NO       |
|   6 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   7 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`      | `String`      | `String`       | YES      |
|   9 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`      | `String`      | `String`       | YES      |
|  11 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_document_history` (11 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `doc_id`          | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `doc_code`        | `String`      | `VarChar`      | NO       |
|   4 | `file_name`       | `String`      | `VarChar`      | NO       |
|   5 | `extension`       | `String`      | `VarChar`      | NO       |
|   6 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   7 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`      | `String`      | `String`       | YES      |
|   9 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`      | `String`      | `String`       | YES      |
|  11 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_image` (10 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `image_id`        | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `file_name`       | `String`      | `VarChar`      | NO       |
|   4 | `extension`       | `String`      | `VarChar`      | NO       |
|   5 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   6 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`      | `String`      | `String`       | YES      |
|   8 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`      | `String`      | `String`       | YES      |
|  10 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_image_history` (10 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `image_id`        | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `file_name`       | `String`      | `VarChar`      | NO       |
|   4 | `extension`       | `String`      | `VarChar`      | NO       |
|   5 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   6 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `updated_by`      | `String`      | `String`       | YES      |
|   8 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `created_by`      | `String`      | `String`       | YES      |
|  10 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_exhibit_a_doc` (11 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `doc_id`          | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `file_name`       | `String`      | `VarChar`      | NO       |
|   4 | `extension`       | `String`      | `VarChar`      | NO       |
|   5 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   6 | `s3_key`          | `String`      | `VarChar`      | NO       |
|   7 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`      | `String`      | `String`       | YES      |
|   9 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`      | `String`      | `String`       | YES      |
|  11 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_exhibit_a_doc_history` (11 columns)

|   # | Column            | Prisma type   | DB type        | Nullable |
| --: | ----------------- | ------------- | -------------- | -------- |
|   1 | `doc_id`          | `String`      | `Uuid`         | NO       |
|   2 | `rec_resource_id` | `String`      | `VarChar(10)`  | NO       |
|   3 | `file_name`       | `String`      | `VarChar`      | NO       |
|   4 | `extension`       | `String`      | `VarChar`      | NO       |
|   5 | `file_size`       | `BigInt`      | `BigInt`       | YES      |
|   6 | `s3_key`          | `String`      | `VarChar`      | NO       |
|   7 | `updated_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `updated_by`      | `String`      | `String`       | YES      |
|   9 | `created_at`      | `DateTime`    | `Timestamp(6)` | YES      |
|  10 | `created_by`      | `String`      | `String`       | YES      |
|  11 | `sys_period`      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_image_consent_form` (12 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `consent_id`             | `String`      | `Uuid`         | NO       |
|   2 | `image_id`               | `String`      | `Uuid`         | NO       |
|   3 | `doc_id`                 | `String`      | `Uuid`         | YES      |
|   4 | `photographer_type_code` | `String`      | `VarChar`      | YES      |
|   5 | `photographer_name`      | `String`      | `VarChar(255)` | YES      |
|   6 | `date_taken`             | `DateTime`    | `Date`         | YES      |
|   7 | `contains_pii`           | `Boolean`     | `Boolean`      | NO       |
|   8 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `updated_by`             | `String`      | `String`       | YES      |
|  10 | `created_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|  11 | `created_by`             | `String`      | `String`       | YES      |
|  12 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_image_consent_form_history` (12 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `consent_id`             | `String`      | `Uuid`         | NO       |
|   2 | `image_id`               | `String`      | `Uuid`         | NO       |
|   3 | `doc_id`                 | `String`      | `Uuid`         | YES      |
|   4 | `photographer_type_code` | `String`      | `VarChar`      | YES      |
|   5 | `photographer_name`      | `String`      | `VarChar(255)` | YES      |
|   6 | `date_taken`             | `DateTime`    | `Date`         | YES      |
|   7 | `contains_pii`           | `Boolean`     | `Boolean`      | NO       |
|   8 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   9 | `updated_by`             | `String`      | `String`       | YES      |
|  10 | `created_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|  11 | `created_by`             | `String`      | `String`       | YES      |
|  12 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_photographer_type_code` (7 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `photographer_type_code` | `String`      | `VarChar`      | NO       |
|   2 | `description`            | `String`      | `VarChar`      | YES      |
|   3 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`             | `String`      | `String`       | YES      |
|   5 | `created_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`             | `String`      | `String`       | YES      |
|   7 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_photographer_type_code_history` (7 columns)

|   # | Column                   | Prisma type   | DB type        | Nullable |
| --: | ------------------------ | ------------- | -------------- | -------- |
|   1 | `photographer_type_code` | `String`      | `VarChar`      | NO       |
|   2 | `description`            | `String`      | `VarChar`      | YES      |
|   3 | `updated_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   4 | `updated_by`             | `String`      | `String`       | YES      |
|   5 | `created_at`             | `DateTime`    | `Timestamp(6)` | YES      |
|   6 | `created_by`             | `String`      | `String`       | YES      |
|   7 | `sys_period`             | `Unsupported` | `tstzrange`    | NO       |

### `recreation_resource_status_code` (7 columns)

|   # | Column                            | Prisma type   | DB type        | Nullable |
| --: | --------------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_resource_status_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`                     | `String`      | `VarChar(120)` | YES      |
|   3 | `effective_date`                  | `DateTime`    | `Date`         | YES      |
|   4 | `expiry_date`                     | `DateTime`    | `Date`         | YES      |
|   5 | `update_timestamp`                | `DateTime`    | `Date`         | YES      |
|   6 | `updated_at`                      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `sys_period`                      | `Unsupported` | `tstzrange`    | NO       |

### `recreation_activity_code_trails` (8 columns)

|   # | Column                               | Prisma type   | DB type        | Nullable |
| --: | ------------------------------------ | ------------- | -------------- | -------- |
|   1 | `recreation_activity_code_trails_id` | `Int`         | `Int`          | NO       |
|   2 | `recreation_activity_code`           | `Int`         | `Int`          | NO       |
|   3 | `rec_resource_id`                    | `String`      | `VarChar(20)`  | NO       |
|   4 | `trail_type`                         | `trail_types` | `trail_types`  | YES      |
|   5 | `name`                               | `String`      | `VarChar(120)` | NO       |
|   6 | `description`                        | `String`      | `String`       | YES      |
|   7 | `updated_at`                         | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `sys_period`                         | `Unsupported` | `tstzrange`    | NO       |

### `recreation_activity_code_trails_history` (8 columns)

|   # | Column                               | Prisma type   | DB type        | Nullable |
| --: | ------------------------------------ | ------------- | -------------- | -------- |
|   1 | `recreation_activity_code_trails_id` | `Int`         | `Int`          | NO       |
|   2 | `recreation_activity_code`           | `Int`         | `Int`          | NO       |
|   3 | `rec_resource_id`                    | `String`      | `VarChar(20)`  | NO       |
|   4 | `trail_type`                         | `trail_types` | `trail_types`  | YES      |
|   5 | `name`                               | `String`      | `VarChar(120)` | NO       |
|   6 | `description`                        | `String`      | `String`       | YES      |
|   7 | `updated_at`                         | `DateTime`    | `Timestamp(6)` | YES      |
|   8 | `sys_period`                         | `Unsupported` | `tstzrange`    | NO       |

### `natural_resource_org_unit` (15 columns)

|   # | Column             | Prisma type   | DB type          | Nullable |
| --: | ------------------ | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`  | `String`      | `VarChar(10)`    | NO       |
|   2 | `org_unit_no`      | `Decimal`     | `Decimal(10, 0)` | NO       |
|   3 | `org_unit_code`    | `String`      | `VarChar(6)`     | NO       |
|   4 | `org_unit_name`    | `String`      | `VarChar(100)`   | NO       |
|   5 | `location_code`    | `String`      | `VarChar(3)`     | YES      |
|   6 | `org_level_code`   | `String`      | `VarChar(1)`     | YES      |
|   7 | `office_name_code` | `String`      | `VarChar(2)`     | YES      |
|   8 | `region_no`        | `Decimal`     | `Decimal(10, 0)` | YES      |
|   9 | `region_code`      | `String`      | `VarChar(6)`     | YES      |
|  10 | `district_no`      | `Decimal`     | `Decimal(10, 0)` | YES      |
|  11 | `district_code`    | `String`      | `VarChar(6)`     | YES      |
|  12 | `effective_date`   | `DateTime`    | `Date`           | YES      |
|  13 | `expiry_date`      | `DateTime`    | `Date`           | YES      |
|  14 | `updated_at`       | `DateTime`    | `Date`           | YES      |
|  15 | `sys_period`       | `Unsupported` | `tstzrange`      | NO       |

### `natural_resource_org_unit_history` (15 columns)

|   # | Column             | Prisma type   | DB type          | Nullable |
| --: | ------------------ | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`  | `String`      | `VarChar(10)`    | NO       |
|   2 | `org_unit_no`      | `Decimal`     | `Decimal(10, 0)` | NO       |
|   3 | `org_unit_code`    | `String`      | `VarChar(6)`     | NO       |
|   4 | `org_unit_name`    | `String`      | `VarChar(100)`   | NO       |
|   5 | `location_code`    | `String`      | `VarChar(3)`     | YES      |
|   6 | `org_level_code`   | `String`      | `VarChar(1)`     | YES      |
|   7 | `office_name_code` | `String`      | `VarChar(2)`     | YES      |
|   8 | `region_no`        | `Decimal`     | `Decimal(10, 0)` | YES      |
|   9 | `region_code`      | `String`      | `VarChar(6)`     | YES      |
|  10 | `district_no`      | `Decimal`     | `Decimal(10, 0)` | YES      |
|  11 | `district_code`    | `String`      | `VarChar(6)`     | YES      |
|  12 | `effective_date`   | `DateTime`    | `Date`           | YES      |
|  13 | `expiry_date`      | `DateTime`    | `Date`           | YES      |
|  14 | `updated_at`       | `DateTime`    | `Date`           | YES      |
|  15 | `sys_period`       | `Unsupported` | `tstzrange`      | NO       |

### `recreation_resource_status_code_history` (7 columns)

|   # | Column                            | Prisma type   | DB type        | Nullable |
| --: | --------------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_resource_status_code` | `String`      | `VarChar(3)`   | NO       |
|   2 | `description`                     | `String`      | `VarChar(120)` | YES      |
|   3 | `effective_date`                  | `DateTime`    | `Date`         | YES      |
|   4 | `expiry_date`                     | `DateTime`    | `Date`         | YES      |
|   5 | `update_timestamp`                | `DateTime`    | `Date`         | YES      |
|   6 | `updated_at`                      | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `sys_period`                      | `Unsupported` | `tstzrange`    | NO       |

### `act_advisories_flat` (28 columns)

|   # | Column                        | Prisma type   | DB type          | Nullable |
| --: | ----------------------------- | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`             | `String`      | `VarChar(20)`    | NO       |
|   2 | `advisory_number`             | `Int`         | `Int`            | NO       |
|   3 | `title`                       | `String`      | `VarChar(255)`   | NO       |
|   4 | `description`                 | `String`      | `String`         | YES      |
|   5 | `submitted_by`                | `String`      | `VarChar(120)`   | NO       |
|   6 | `access_status_name`          | `String`      | `VarChar(100)`   | NO       |
|   7 | `access_status_grouplabel`    | `String`      | `VarChar(50)`    | NO       |
|   8 | `access_status_description`   | `String`      | `String`         | YES      |
|   9 | `event_type`                  | `String`      | `VarChar(100)`   | NO       |
|  10 | `urgency`                     | `String`      | `VarChar(25)`    | NO       |
|  11 | `advisory_status`             | `String`      | `VarChar(100)`   | NO       |
|  12 | `is_reservations_affected`    | `Boolean`     | `Boolean`        | YES      |
|  13 | `is_advisory_date_displayed`  | `Boolean`     | `Boolean`        | NO       |
|  14 | `is_effective_date_displayed` | `Boolean`     | `Boolean`        | NO       |
|  15 | `is_end_date_displayed`       | `Boolean`     | `Boolean`        | NO       |
|  16 | `is_updated_date_displayed`   | `Boolean`     | `Boolean`        | YES      |
|  17 | `advisory_date`               | `DateTime`    | `Timestamptz(6)` | NO       |
|  18 | `effective_date`              | `DateTime`    | `Timestamptz(6)` | YES      |
|  19 | `end_date`                    | `DateTime`    | `Timestamptz(6)` | YES      |
|  20 | `expiry_date`                 | `DateTime`    | `Timestamptz(6)` | YES      |
|  21 | `updated_date`                | `DateTime`    | `Timestamptz(6)` | YES      |
|  22 | `published_at`                | `DateTime`    | `Timestamptz(6)` | YES      |
|  23 | `sys_period`                  | `Unsupported` | `tstzrange`      | NO       |
|  24 | `listing_rank`                | `Int`         | `Int`            | NO       |
|  25 | `urgency_sequence`            | `Int`         | `Int`            | NO       |
|  26 | `access_status_precedence`    | `Int`         | `Int`            | NO       |
|  27 | `event_type_precedence`       | `Int`         | `Int`            | NO       |
|  28 | `updated_at`                  | `DateTime`    | `Timestamp(6)`   | YES      |

### `act_advisories_flat_history` (24 columns)

|   # | Column                        | Prisma type   | DB type          | Nullable |
| --: | ----------------------------- | ------------- | ---------------- | -------- |
|   1 | `rec_resource_id`             | `String`      | `VarChar(20)`    | NO       |
|   2 | `advisory_number`             | `Int`         | `Int`            | NO       |
|   3 | `title`                       | `String`      | `VarChar(255)`   | NO       |
|   4 | `description`                 | `String`      | `String`         | YES      |
|   5 | `submitted_by`                | `String`      | `VarChar(120)`   | NO       |
|   6 | `access_status_name`          | `String`      | `VarChar(100)`   | NO       |
|   7 | `access_status_grouplabel`    | `String`      | `VarChar(50)`    | NO       |
|   8 | `access_status_description`   | `String`      | `String`         | YES      |
|   9 | `event_type`                  | `String`      | `VarChar(100)`   | NO       |
|  10 | `urgency`                     | `String`      | `VarChar(25)`    | NO       |
|  11 | `advisory_status`             | `String`      | `VarChar(100)`   | NO       |
|  12 | `is_reservations_affected`    | `Boolean`     | `Boolean`        | YES      |
|  13 | `is_advisory_date_displayed`  | `Boolean`     | `Boolean`        | NO       |
|  14 | `is_effective_date_displayed` | `Boolean`     | `Boolean`        | NO       |
|  15 | `is_end_date_displayed`       | `Boolean`     | `Boolean`        | NO       |
|  16 | `is_updated_date_displayed`   | `Boolean`     | `Boolean`        | YES      |
|  17 | `advisory_date`               | `DateTime`    | `Timestamptz(6)` | NO       |
|  18 | `effective_date`              | `DateTime`    | `Timestamptz(6)` | YES      |
|  19 | `end_date`                    | `DateTime`    | `Timestamptz(6)` | YES      |
|  20 | `expiry_date`                 | `DateTime`    | `Timestamptz(6)` | YES      |
|  21 | `updated_date`                | `DateTime`    | `Timestamptz(6)` | YES      |
|  22 | `published_at`                | `DateTime`    | `Timestamptz(6)` | YES      |
|  23 | `sys_period`                  | `Unsupported` | `tstzrange`      | NO       |
|  24 | `updated_at`                  | `DateTime`    | `Timestamp(6)`   | YES      |

### `recreation_fee_sub_code_history` (5 columns)

|   # | Column                    | Prisma type   | DB type        | Nullable |
| --: | ------------------------- | ------------- | -------------- | -------- |
|   1 | `recreation_fee_code`     | `String`      | `VarChar(1)`   | NO       |
|   2 | `recreation_fee_sub_code` | `String`      | `VarChar(30)`  | NO       |
|   3 | `description`             | `String`      | `VarChar(120)` | NO       |
|   4 | `updated_at`              | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `sys_period`              | `Unsupported` | `tstzrange`    | NO       |

### `recreation_asset` (18 columns)

|   # | Column                | Prisma type   | DB type         | Nullable |
| --: | --------------------- | ------------- | --------------- | -------- |
|   1 | `asset_id`            | `BigInt`      | `BigInt`        | NO       |
|   2 | `parent_id`           | `BigInt`      | `BigInt`        | YES      |
|   3 | `asset_tag`           | `String`      | `VarChar(50)`   | YES      |
|   4 | `rec_resource_id`     | `String`      | `VarChar(20)`   | NO       |
|   5 | `asset_code`          | `Int`         | `Int`           | NO       |
|   6 | `asset_name`          | `String`      | `VarChar(200)`  | YES      |
|   7 | `asset_comment`       | `String`      | `String`        | YES      |
|   8 | `legacy_structure_id` | `String`      | `VarChar(20)`   | YES      |
|   9 | `asset_length`        | `Decimal`     | `Decimal(7, 1)` | YES      |
|  10 | `asset_width`         | `Decimal`     | `Decimal(7, 1)` | YES      |
|  11 | `asset_area`          | `Decimal`     | `Decimal(7, 1)` | YES      |
|  12 | `actual_value`        | `Decimal`     | `Decimal(7, 2)` | YES      |
|  13 | `installation_date`   | `DateTime`    | `Date`          | YES      |
|  14 | `updated_at`          | `DateTime`    | `Timestamp(6)`  | YES      |
|  15 | `updated_by`          | `String`      | `String`        | YES      |
|  16 | `created_at`          | `DateTime`    | `Timestamp(6)`  | YES      |
|  17 | `created_by`          | `String`      | `String`        | YES      |
|  18 | `sys_period`          | `Unsupported` | `tstzrange`     | NO       |

### `recreation_asset_geom` (8 columns)

|   # | Column               | Prisma type   | DB type        | Nullable |
| --: | -------------------- | ------------- | -------------- | -------- |
|   1 | `asset_id`           | `BigInt`      | `BigInt`       | NO       |
|   2 | `geometry_type_code` | `String`      | `VarChar(3)`   | YES      |
|   3 | `geometry`           | `Unsupported` | `geometry`     | YES      |
|   4 | `updated_at`         | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `updated_by`         | `String`      | `String`       | YES      |
|   6 | `created_at`         | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `created_by`         | `String`      | `String`       | YES      |
|   8 | `sys_period`         | `Unsupported` | `tstzrange`    | NO       |

### `recreation_asset_geom_history` (8 columns)

|   # | Column               | Prisma type   | DB type        | Nullable |
| --: | -------------------- | ------------- | -------------- | -------- |
|   1 | `asset_id`           | `BigInt`      | `BigInt`       | NO       |
|   2 | `geometry_type_code` | `String`      | `VarChar(3)`   | YES      |
|   3 | `geometry`           | `Unsupported` | `geometry`     | YES      |
|   4 | `updated_at`         | `DateTime`    | `Timestamp(6)` | YES      |
|   5 | `updated_by`         | `String`      | `String`       | YES      |
|   6 | `created_at`         | `DateTime`    | `Timestamp(6)` | YES      |
|   7 | `created_by`         | `String`      | `String`       | YES      |
|   8 | `sys_period`         | `Unsupported` | `tstzrange`    | NO       |

### `recreation_asset_history` (19 columns)

|   # | Column                | Prisma type   | DB type         | Nullable |
| --: | --------------------- | ------------- | --------------- | -------- |
|   1 | `asset_id`            | `BigInt`      | `BigInt`        | NO       |
|   2 | `parent_id`           | `BigInt`      | `BigInt`        | YES      |
|   3 | `asset_tag`           | `String`      | `VarChar(50)`   | YES      |
|   4 | `rec_resource_id`     | `String`      | `VarChar(20)`   | NO       |
|   5 | `asset_code`          | `Int`         | `Int`           | NO       |
|   6 | `asset_name`          | `String`      | `VarChar(200)`  | YES      |
|   7 | `asset_comment`       | `String`      | `String`        | YES      |
|   8 | `legacy_structure_id` | `String`      | `VarChar(20)`   | YES      |
|   9 | `asset_length`        | `Decimal`     | `Decimal(7, 1)` | YES      |
|  10 | `asset_width`         | `Decimal`     | `Decimal(7, 1)` | YES      |
|  11 | `asset_area`          | `Decimal`     | `Decimal(7, 1)` | YES      |
|  12 | `default_value`       | `Decimal`     | `Decimal(7, 2)` | YES      |
|  13 | `actual_value`        | `Decimal`     | `Decimal(7, 2)` | YES      |
|  14 | `installation_date`   | `DateTime`    | `Date`          | YES      |
|  15 | `updated_at`          | `DateTime`    | `Timestamp(6)`  | YES      |
|  16 | `updated_by`          | `String`      | `String`        | YES      |
|  17 | `created_at`          | `DateTime`    | `Timestamp(6)`  | YES      |
|  18 | `created_by`          | `String`      | `String`        | YES      |
|  19 | `sys_period`          | `Unsupported` | `tstzrange`     | NO       |

### `recreation_asset_repair` (14 columns)

|   # | Column                         | Prisma type   | DB type          | Nullable |
| --: | ------------------------------ | ------------- | ---------------- | -------- |
|   1 | `repair_id`                    | `BigInt`      | `BigInt`         | NO       |
|   2 | `asset_id`                     | `BigInt`      | `BigInt`         | NO       |
|   3 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`     | YES      |
|   4 | `estimated_repair_cost`        | `Decimal`     | `Decimal(10, 2)` | YES      |
|   5 | `actual_repair_cost`           | `Decimal`     | `Decimal(10, 2)` | YES      |
|   6 | `repair_completed_date`        | `DateTime`    | `Date`           | YES      |
|   7 | `urgency`                      | `String`      | `VarChar(25)`    | YES      |
|   8 | `trail_segment_start`          | `String`      | `VarChar(50)`    | YES      |
|   9 | `trail_segment_end`            | `String`      | `VarChar(50)`    | YES      |
|  10 | `updated_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|  11 | `updated_by`                   | `String`      | `String`         | YES      |
|  12 | `created_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|  13 | `created_by`                   | `String`      | `String`         | YES      |
|  14 | `sys_period`                   | `Unsupported` | `tstzrange`      | NO       |

### `recreation_asset_repair_history` (14 columns)

|   # | Column                         | Prisma type   | DB type          | Nullable |
| --: | ------------------------------ | ------------- | ---------------- | -------- |
|   1 | `repair_id`                    | `BigInt`      | `BigInt`         | NO       |
|   2 | `asset_id`                     | `BigInt`      | `BigInt`         | NO       |
|   3 | `recreation_remed_repair_code` | `String`      | `VarChar(2)`     | YES      |
|   4 | `estimated_repair_cost`        | `Decimal`     | `Decimal(10, 2)` | YES      |
|   5 | `actual_repair_cost`           | `Decimal`     | `Decimal(10, 2)` | YES      |
|   6 | `repair_completed_date`        | `DateTime`    | `Date`           | YES      |
|   7 | `urgency`                      | `String`      | `VarChar(25)`    | YES      |
|   8 | `trail_segment_start`          | `String`      | `VarChar(50)`    | YES      |
|   9 | `trail_segment_end`            | `String`      | `VarChar(50)`    | YES      |
|  10 | `updated_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|  11 | `updated_by`                   | `String`      | `String`         | YES      |
|  12 | `created_at`                   | `DateTime`    | `Timestamp(6)`   | YES      |
|  13 | `created_by`                   | `String`      | `String`         | YES      |
|  14 | `sys_period`                   | `Unsupported` | `tstzrange`      | NO       |

### `recreation_asset_code` (11 columns)

|   # | Column          | Prisma type   | DB type         | Nullable |
| --: | --------------- | ------------- | --------------- | -------- |
|   1 | `asset_code`    | `Int`         | `Int`           | NO       |
|   2 | `description`   | `String`      | `VarChar(120)`  | YES      |
|   3 | `updated_at`    | `DateTime`    | `Timestamp(6)`  | YES      |
|   4 | `updated_by`    | `String`      | `String`        | YES      |
|   5 | `created_at`    | `DateTime`    | `Timestamp(6)`  | YES      |
|   6 | `created_by`    | `String`      | `String`        | YES      |
|   7 | `sys_period`    | `Unsupported` | `tstzrange`     | NO       |
|   8 | `has_length`    | `Boolean`     | `Boolean`       | NO       |
|   9 | `has_width`     | `Boolean`     | `Boolean`       | NO       |
|  10 | `has_area`      | `Boolean`     | `Boolean`       | NO       |
|  11 | `default_value` | `Decimal`     | `Decimal(7, 2)` | YES      |

### `recreation_asset_code_history` (11 columns)

|   # | Column          | Prisma type   | DB type         | Nullable |
| --: | --------------- | ------------- | --------------- | -------- |
|   1 | `asset_code`    | `Int`         | `Int`           | NO       |
|   2 | `description`   | `String`      | `VarChar(120)`  | YES      |
|   3 | `updated_at`    | `DateTime`    | `Timestamp(6)`  | YES      |
|   4 | `updated_by`    | `String`      | `String`        | YES      |
|   5 | `created_at`    | `DateTime`    | `Timestamp(6)`  | YES      |
|   6 | `created_by`    | `String`      | `String`        | YES      |
|   7 | `sys_period`    | `Unsupported` | `tstzrange`     | NO       |
|   8 | `has_length`    | `Boolean`     | `Boolean`       | NO       |
|   9 | `has_width`     | `Boolean`     | `Boolean`       | NO       |
|  10 | `has_area`      | `Boolean`     | `Boolean`       | NO       |
|  11 | `default_value` | `Decimal`     | `Decimal(7, 2)` | YES      |
