-- Add district_code from recreation_district_xref
update rst.recreation_resource rr
set
    district_code = xref.recreation_district_code
from
    fta.recreation_district_xref xref
where
    rr.rec_resource_id = xref.forest_file_id;
