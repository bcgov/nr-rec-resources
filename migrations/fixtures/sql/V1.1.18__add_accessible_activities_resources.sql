insert into rst.recreation_activity (rec_resource_id, recreation_activity_code) values ('REC160773', 34);

insert into rst.recreation_activity_code_trails (
  recreation_activity_code, rec_resource_id, trail_type, name, description
)
values
(
  34,
  'REC160773',
  'BLUE',
  'Talladega Knight',
  'Prince George''s very first adaptive friendly mountain bike trail and is an absolute pleasure for new and experienced riders alike. All of the features have wide and obvious ride arounds, while the jumps on trail have options to get just a little bit of air time or a bunch of it.'
),
(
  34,
  'REC160773',
  'GREEN',
  'Talladega King',
  'A 1 km popular green difficulty singletrack trail located near Prince George British Columbia. This mountain bike primary trail can be used uphill primary and has a easy overall physical rating with a 79 m green climb.'
);

refresh materialized view rst.recreation_resource_search_view;
