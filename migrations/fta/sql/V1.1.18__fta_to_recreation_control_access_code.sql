insert into rst.recreation_control_access_code (recreation_control_access_code,
                                                description,
                                                expiry_date,
                                                effective_date,
                                                update_timestamp)
select *
from fta.recreation_control_access_code ca;
