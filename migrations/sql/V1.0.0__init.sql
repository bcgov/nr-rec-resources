CREATE SCHEMA IF NOT EXISTS RST;

CREATE TABLE IF NOT EXISTS RST.RECREATION_RESOURCE
(
    FOREST_FILE_ID varchar(200) not null primary key,
    NAME           varchar(200) not null,
    DESCRIPTION    varchar(1000) not null,
    SITE_LOCATION  varchar(200) not null
);

INSERT INTO RST.RECREATION_RESOURCE (FOREST_FILE_ID, NAME, DESCRIPTION, SITE_LOCATION)
VALUES ('REC5600', 'A Walk In The Forest Trail (Lost Shoe)', 'Trail offers two short loops under a mainly cedar canopy. Some boardwalks and bridges have been constructed to cross over a babbling creek. This is a rainforest and one should use caution while navigating the trail''s slippery sections.', 'Tofino'),
       ('REC1585', 'Aberdeen Lake', 'This semi-open site on a medium sized fishing lake is subject to significant water level fluctuations. The access is very rough for 2 km before the site.', 'Lavington'),
       ('REC5763', 'Ahdatay', 'Located on the north shore of Tchentlo Lake, 1. 5 km from the mouth of the Nation River between Tchentlo and Chuchi Lake.', 'Fort St. James'),
              ('REC2602', 'Alexis Lake', 'Located north of Alexis Creek, Alexis Lake is a popular fishing destination and day use area. This family friendly site has five units, a cartop boat launch and a small sandy beach for swimming. Boaters should take notice that power-driven vessels are prohibited on this lake under the Vessel Operation Restriction Regulations (Transport Canada). Electric motors are permitted.', 'Alexis Creek'),
       ('REC0019', 'Allison Pool', 'A small site along the banks of the Chilliwack River; accessed off the Chilliwack Lake Road. This site is not suitable for large RVs due to the gravel road access. The site is popular with anglers and has access to the Trans Canada Trail. The site is designed as a group site and can be reserved during camping season. This is a CASH ONLY site. For reservations, additional information and updates, please visit www.chilliwackvalleycampsites.ca. or email thurstonmeadows@yahoo.ca or call: 604-824-0576.', 'Chilliwack'),
       ('REC6622', 'Amor West', 'Located along the Sayward Forest Canoe Route, this is a popular stop for paddlers making their way along the route. In summer when water levels are lower, there is plenty of room to camp on the beach.', 'Campbell River'),
       ('REC1496', 'Angly Lake', 'A small, narrow lake in the hills above Ormond Lake. One vehicle unit.', 'Fort St. James');
