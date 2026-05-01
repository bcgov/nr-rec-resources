insert into rst.recreation_activity_code (
    recreation_activity_code, description, details, is_accessible
)
values 
(
  34,
  'Adaptive mountain bike trails',
  'Recreation Sites and Trails BC is committed to supporting inclusive outdoor recreation opportunities across the province. Adaptive mountain bike trails are developed to reduce barriers and support riders with a range of abilities, helping more people experience the physical, social, and recreational benefits of trail riding. Explore the adaptive trails below to find locations designed to support adaptive mountain biking.',
  true
);

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
