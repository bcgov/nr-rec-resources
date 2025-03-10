insert into rst.recreation_map_feature (rmf_skey, rec_resource_id, section_id, amendment_id, amend_status_code,
                                        recreation_resource_type, amend_status_date, retirement_date, revision_count,
                                        entry_userid, entry_timestamp, update_userid, update_timestamp,
                                        recreation_map_feature_guid)
select rmf_skey,
       forest_file_id,
       section_id,
       amendment_id,
       amend_status_code,
       recreation_map_feature_code,
       amend_status_date,
       retirement_date,
       revision_count,
       entry_userid as created_by,
       entry_timestamp as created_at,
       update_userid as updated_by,
       update_timestamp as updated_at,
       recreation_map_feature_guid
from fta.recreation_map_feature;

insert into rst.recreation_map_feature_geom (rmf_skey, map_feature_id, geometry_type_code, geometry, feature_area,
                                             feature_length, feature_perimeter, revision_count, entry_userid,
                                             entry_timestamp, update_userid, update_timestamp)
select rmf_skey,
       map_feature_id,
       geometry_type_code,
       geometry,
       feature_area,
       feature_length,
       feature_perimeter,
       revision_count,
       entry_userid as created_by,
       entry_timestamp as created_at,
       update_userid as updated_by,
       update_timestamp as updated_at
from fta.recreation_map_feature_geom
