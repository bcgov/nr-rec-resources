insert into rst.recreation_district_code (district_code, description)
select
    recreation_district_code as district_code,
    regexp_replace(description, '^Rec Dist -[[:space:]]*', '', 'i') as description
from fta.recreation_district_code
on conflict (district_code) do update
set description = excluded.description;
