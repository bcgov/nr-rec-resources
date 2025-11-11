
-- To migrate leftover pdf files from the LAN drive
-- This is a production-only migration that should only be run in the production environment since they only exist in DAM prod.
-- The migration file is always executed and recorded in flyway_schema_history (maintaining version consistency),
-- but the SQL will ONLY execute in production environment (when APP_ENV=prod).

DO $$
BEGIN
  -- Check if we're in production environment
  IF '${APP_ENV}' = 'prod' THEN
    -- Production-only INSERT statement
    INSERT INTO rst.recreation_resource_docs
        (ref_id, rec_resource_id, title, url, doc_code, extension, created_by, updated_by)
    VALUES
    ('34393', 'REC31979', 'KVR Updates Oct 2025', '/filestore/3/9/3/4/3_6ece1dc4cfca993/34393_c16cfcef56e69ec.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34415', 'REC32091', 'bergeronfallsmar2019', '/filestore/5/1/4/4/3_5def3f5ff906157/34415_187f566821a3c73.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34416', 'REC1979', 'Idleback Lake 14 Day Rule', '/filestore/6/1/4/4/3_5218cf0b0b2bab3/34416_c3e68c5e2cd5ae5.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34417', 'REC1757', 'Horse Use in the Lundbom Lake Area', '/filestore/7/1/4/4/3_4b2d1bf9153b561/34417_64bdfc5182358be.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34418', 'REC5544', 'Treasures of the Tulameen', '/filestore/8/1/4/4/3_e8bc8a3e057c70a/34418_d685b9c7e9bc430.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34419', 'REC32075', 'StonyLakebookletFeb2016', '/filestore/9/1/4/4/3_51ec3dfdfcae0e0/34419_4cffe018348c491.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34420', 'REC1347', 'boundaryroutesmar2019', '/filestore/0/2/4/4/3_be70eec1864789d/34420_46fec427fcb2ed8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34421', 'REC32055', 'Cowmoose Feb 2016', '/filestore/1/2/4/4/3_b5dd735e4aa537d/34421_d774150350ab667.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34422', 'REC1883', 'Horse Use in the Lundbom Lake Area', '/filestore/2/2/4/4/3_bc0e6fb1151abdc/34422_bbc9e28e162e7f9.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34423', 'REC0237', 'Tenquille Lake Visitor Use Management Strategy', '/filestore/3/2/4/4/3_29a4ff69eb15477/34423_36b93a1b04fa830.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34424', 'REC1084', 'Stony Lake booklet Feb 2016', '/filestore/4/2/4/4/3_d7b8d03d849cb07/34424_042e1daa7200551.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34425', 'REC3099', '2021 2022 Snowden Trail Closures', '/filestore/5/2/4/4/3_ff21a023951db48/34425_298c6392d31abe0.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34426', 'REC98308', 'Attention day use only no camping permitted', '/filestore/6/2/4/4/3_3e7910c3b276868/34426_bd5ef458b8a08ae.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34427', 'REC16179', 'QualityfallsFeb2016', '/filestore/7/2/4/4/3_017e984d3506208/34427_1c5b0a809521173.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34428', 'REC16196', 'barbournesbittmar2019', '/filestore/8/2/4/4/3_2513afa6c24dd55/34428_2fa386ff8e23d37.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34429', 'REC32052', 'bullmoosemarshessep2019', '/filestore/9/2/4/4/3_6acad6d2ad469ae/34429_8196eea68b5e4ec.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34430', 'REC1537', 'Info Bulletin 2018FLNR0097-000808', '/filestore/0/3/4/4/3_960ca504fb1e0c5/34430_bb352d5376c73b8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34431', 'REC31979', 'KVR Updates Oct 2025', '/filestore/1/3/4/4/3_7da86d2786fcdc0/34431_b0dce6f2a260526.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34432', 'REC32066', 'reesorsep2019', '/filestore/2/3/4/4/3_e4dced241e3df9e/34432_7aa8b9318f01b93.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34433', 'REC4700', 'Partial Closure Letter', '/filestore/3/3/4/4/3_13678ab51b930aa/34433_2db9c62affd12d0.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34434', 'REC203411', 'Partial Closure Letter', '/filestore/4/3/4/4/3_685c47a40bc2051/34434_295a2755d593584.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34435', 'REC32075', 'Stony Lake booklet Feb 2016', '/filestore/5/3/4/4/3_91001c5fe391610/34435_47e1c5a83e16357.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34436', 'REC204349', 'Atlin 2016 Brochure Low Res', '/filestore/6/3/4/4/3_332857a93336c81/34436_129e845a0fc80e2.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34437', 'REC32057', 'boundaryroutesmar2019', '/filestore/7/3/4/4/3_5d836d7584d69e5/34437_a8c88d91acc797f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34438', 'REC6895', 'GRST Brochure Map1 (70 Mile House to 99 Mile)', '/filestore/8/3/4/4/3_a0eef753db98c88/34438_7831c27f7a02bcb.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34439', 'REC32075', 'boundaryroutesmar2019', '/filestore/9/3/4/4/3_34fa482064b51e1/34439_7b5023c995a3c7c.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34440', 'REC32801', 'Welcome Pond Aberdeen-8x4 sign', '/filestore/0/4/4/4/3_7e30ede678588a8/34440_36a3812fc3acdc2.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34441', 'REC0561', 'Atlin 2016 Brochure Low Res', '/filestore/1/4/4/4/3_deee2583f354b65/34441_18202b9c377e620.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34442', 'REC16077', 'Clint Beek Recreation Site Reservations and Refund Policy', '/filestore/2/4/4/4/3_cad1ccac9f572be/34442_b84eb9433c0925d.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34443', 'REC32089', 'WolverineskitrailsApr2016', '/filestore/3/4/4/4/3_c7b01a2206bbd8c/34443_fb5e2cc02e623ad.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34444', 'REC5870', 'Treasures of the Tulameen', '/filestore/4/4/4/4/3_54a79c7a8436876/34444_0a06cab40996474.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34445', 'REC0144', 'gorman snowmobile', '/filestore/5/4/4/4/3_628267c88e834e4/34445_0a843de6330b8eb.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34446', 'REC163910', 'Atlin 2016 Brochure Low Res', '/filestore/6/4/4/4/3_20852c320d97332/34446_317b5ebbb37beb7.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34447', 'REC6895', 'GRST Brochure Map3 (127 Mile House to Horsefly)', '/filestore/7/4/4/4/3_b8e05b721294aa2/34447_e75864262e3546b.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34448', 'REC166370', 'Operating an ORV on a highway or public road', '/filestore/8/4/4/4/3_484a54026040252/34448_2f8d09314d3de4f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34449', 'REC32083', 'Dinotracks2016', '/filestore/9/4/4/4/3_897957c65c26040/34449_e69382e45e82e4b.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34450', 'REC5947', 'gregdukesep2019', '/filestore/0/5/4/4/3_fa5213f6ba81e6d/34450_fd60c0f38da1c52.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34451', 'REC32096', 'spiekersep2019', '/filestore/1/5/4/4/3_7718ac264c176ac/34451_0fd1f50b8b63a39.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34452', 'REC5869', 'Treasures of the Tulameen', '/filestore/2/5/4/4/3_1459cda753357b9/34452_f404a70c1375745.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34453', 'REC32083', 'flatbedvalleymar2019', '/filestore/3/5/4/4/3_ba2a37d103756fb/34453_ebe4dc9eed4c9b6.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34454', 'REC0569', 'Atlin 2016 Brochure Low Res', '/filestore/4/5/4/4/3_17bc13af3adbcfd/34454_ed283378ac47bf0.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34455', 'REC192055', 'qualitycanyonsep2019', '/filestore/5/5/4/4/3_ef41f59f175b4fa/34455_e984b83bed1c0cc.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34456', 'REC0197', 'Sayward Canoe Route Brochure', '/filestore/6/5/4/4/3_06c5a31bee66973/34456_088ce2d67069c68.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34457', 'REC3508', 'Atlin 2016 Brochure Low Res', '/filestore/7/5/4/4/3_14f9cb6be9b2df9/34457_7c29091da5fe357.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34458', 'REC4660', 'HBC Trail Map', '/filestore/8/5/4/4/3_89deab53f5032d2/34458_0b5813a92de2e6f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34459', 'REC5704', 'Atlin 2016 Brochure Low Res', '/filestore/9/5/4/4/3_e5f801242ad6430/34459_fe4d5328d08b0f1.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34460', 'REC6895', 'GRST Brochure Map2 (99 Mile to 127 Mile House)', '/filestore/0/6/4/4/3_743440fb1a98669/34460_87f476b781704c8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34461', 'REC16179', 'qualityfallssep2019', '/filestore/1/6/4/4/3_8d9f4f63920fcac/34461_7348a9ccfbf0106.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34462', 'REC271366', 'Sheridan Lake Loon Bay Trail Map 8.5 x 11', '/filestore/2/6/4/4/3_411093cccf30715/34462_f5beef13c9c96c4.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34463', 'REC32091', 'BergeronfallsJan2016', '/filestore/3/6/4/4/3_7a1448cc19d9ae0/34463_58b26f7bfaceef0.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34464', 'REC32112', 'BootskiLakeFeb2016', '/filestore/4/6/4/4/3_8ac763b1095e5d6/34464_23ec71fb16fd612.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34465', 'REC192060', 'windfallsep2019', '/filestore/5/6/4/4/3_78082d11bddd3a4/34465_68b836b3fac4b05.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34466', 'REC1711', 'Horse Use in the Lundbom Lake Area', '/filestore/6/6/4/4/3_d03555d78481577/34466_56341edf6872101.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34467', 'REC98243', 'Hendrix Falls Trail Kiosk Info', '/filestore/7/6/4/4/3_b2fc18fbe6b9439/34467_25e19620e19a7d3.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34468', 'REC32062', 'boundaryroutesmar2019', '/filestore/8/6/4/4/3_444063398c74fb0/34468_27e323de76bd466.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34469', 'REC2462', 'Revelstoke Mountain Bike Trail Plan', '/filestore/9/6/4/4/3_32c77e8e559de9d/34469_31d076554044d4f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34470', 'REC4660', 'Treasures of the Tulameen', '/filestore/0/7/4/4/3_0f5fbeb0161c4a1/34470_669f977a67befdf.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34471', 'REC32055', 'cowmoosesep2019', '/filestore/1/7/4/4/3_52b2ebe54014d3c/34471_07eff53b96334ff.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34472', 'REC160138', 'resize of mica mtn trailhead sign', '/filestore/2/7/4/4/3_aae740e35a903a1/34472_c179c1020c2b421.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34473', 'REC4674', 'Jacobson Lake Horse Use', '/filestore/3/7/4/4/3_bdf10ab3c315772/34473_2c85f311d3b68e8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34474', 'REC6894', 'Operating an ORV on a highway or public road', '/filestore/4/7/4/4/3_2016d1009bc56be/34474_c7b25f2ecfb04d9.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34475', 'REC0585', 'Thornhill Forest Fire Lookout Brochure web rgb', '/filestore/5/7/4/4/3_6eddba66b0dcf56/34475_584f2b043c87257.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34476', 'REC0650', 'Atlin 2016 Brochure Low Res', '/filestore/6/7/4/4/3_fc8756b0edc95e5/34476_1f711ce2b03a628.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34477', 'REC201755', 'Okanagan Falls OHV Trails', '/filestore/7/7/4/4/3_c2bc110340244fb/34477_f19457bab49e0b0.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34478', 'REC169453', 'shipyardoct2019', '/filestore/8/7/4/4/3_1b8f10d445b736e/34478_d8b342dc135a2c7.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34479', 'REC6370', 'Swansea Trails kiosk 36x36 (5.03 MB)', '/filestore/9/7/4/4/3_5ce1c23a9379a04/34479_f57fdc7d498118e.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34480', 'REC6894', 'GRST Brochure Map1 (70 Mile House to 99 Mile)', '/filestore/0/8/4/4/3_90d9aeecf748eda/34480_165c3453c36b5ee.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34481', 'REC5637', 'Tenquille Lake Visitor Use Management Strategy', '/filestore/1/8/4/4/3_a59cfcd8ca63a32/34481_414f42bd1c523ab.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34482', 'REC169184', 'Duffy-Greenstone OHV Rec Brochure Map web rgb', '/filestore/2/8/4/4/3_5e86e92f270328a/34482_b335976a6ecfe4f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34483', 'REC6894', 'GRST Brochure Map3 (127 Mile House to Horsefly)', '/filestore/3/8/4/4/3_c52e695eac52288/34483_af13b7737193a31.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34484', 'REC16195', 'boulderbaboct2019', '/filestore/4/8/4/4/3_fdd6d72e8417477/34484_64226493070b8a7.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34485', 'REC204355', 'Atlin 2016 Brochure Low Res', '/filestore/5/8/4/4/3_605e820cc73ca84/34485_f9ef52cf1ad7c5d.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34486', 'REC5728', 'Nuxalk Carrier Grease Trail Categories', '/filestore/6/8/4/4/3_a8958a960528229/34486_7b3666ecea46fbd.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34487', 'REC240240', 'Oliver Mountain - Protecting Sensitve Ecosystems While Maintaining Recreational Opportunities', '/filestore/7/8/4/4/3_2a2dbf3bfe2b286/34487_1f4e4b0f5a1829c.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34488', 'REC32089', 'wolverineskioct2019', '/filestore/8/8/4/4/3_8b9686c6c9c8178/34488_030fbc58e8a6bd2.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34489', 'REC0568', 'Atlin 2016 Brochure Low Res', '/filestore/9/8/4/4/3_ea06c4b015ddb7b/34489_1e2fedf71264428.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34490', 'REC2357', 'Nordic Cranbrook (2.5 MB)', '/filestore/0/9/4/4/3_1a797d1df094bcf/34490_01e9ae417dc764a.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34491', 'REC2002', 'Swansea Trails kiosk 36x36 (5.03 MB)', '/filestore/1/9/4/4/3_9aee96af4023565/34491_4ae5163a9b68cc4.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34492', 'REC32091', 'bergeroncliffsmar2019', '/filestore/2/9/4/4/3_a9e19fa04ff33d5/34492_4f34980250e639e.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34493', 'REC32083', 'flatbedfallsoct2019', '/filestore/3/9/4/4/3_01f9f49225e7f1a/34493_33e52af0b035429.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34494', 'REC204351', 'Atlin 2016 Brochure Low Res', '/filestore/4/9/4/4/3_dece0f30c9f4384/34494_ea20779f148bca9.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34495', 'REC6894', 'GRST Brochure Map2 (99 Mile to 127 Mile House)', '/filestore/5/9/4/4/3_1a7cc5169ff66c7/34495_5b53da5889a19ac.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34496', 'REC169453', 'Shipyard Titanic Apr2016', '/filestore/6/9/4/4/3_b57e5131778153d/34496_859277686a2a186.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34497', 'REC32112', 'bootskioct2019', '/filestore/7/9/4/4/3_bafd68fe24a2656/34497_51a5f76debae5e8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34498', 'REC6246', 'Operating an ORV on a highway or public road', '/filestore/8/9/4/4/3_65d17c8bd77ff6c/34498_32546b783095fe5.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34499', 'REC16195', 'BoulderBabFeb2016', '/filestore/9/9/4/4/3_c021d76bb1e72a1/34499_7fc57327648a8c3.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34500', 'REC163913', 'Atlin 2016 Brochure Low Res', '/filestore/0/0/5/4/3_1663c3db4abfca0/34500_cba254751da22e5.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34501', 'REC31758', 'TCA Section58 Placer Mtn Border Lake', '/filestore/1/0/5/4/3_9f8d823deb58ef1/34501_98d19b513dfbb8b.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34502', 'REC0472', 'Ripple Rock Trail Brochure', '/filestore/2/0/5/4/3_7199a2b9891c07d/34502_ba2129b0544370a.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34503', 'REC1545', 'Duffy-Greenstone Brochure', '/filestore/3/0/5/4/3_e7d17a7436f6b34/34503_06cbd5135ef2932.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34504', 'REC4674', 'Treasures of the Tulameen', '/filestore/4/0/5/4/3_08e4d59a8dbff0e/34504_4ee422bc51cb4bf.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34505', 'REC16188', 'murraycanyonbookletsep2019', '/filestore/5/0/5/4/3_4dd7e732719c665/34505_9682ad398024b55.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34506', 'REC32083', 'flatbedfalls', '/filestore/6/0/5/4/3_151eedf73da697e/34506_df49309ff31cdbf.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34507', 'REC5547', 'Treasures of the Tulameen', '/filestore/7/0/5/4/3_f576f6b77e6500b/34507_cd6fcbae9895d4b.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34508', 'REC1659', 'Treasures of the Tulameen', '/filestore/8/0/5/4/3_88ccf30a5dbe244/34508_b2a7534b614d56c.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34509', 'REC6881', 'Red Mt Avalanche Terrain Exposure Map', '/filestore/9/0/5/4/3_c67ac9b98ee345e/34509_6a0988ecc5eb214.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34510', 'REC204357', 'Atlin 2016 Brochure Low Res', '/filestore/0/1/5/4/3_4dfa52ccb3075ff/34510_df7e52f01e91378.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34511', 'REC16197', 'boulderbaboct2019', '/filestore/1/1/5/4/3_93a4b5c62a4b2ce/34511_0a31d1cab69fd65.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34512', 'REC32089', 'WolverinetrailsApr2016', '/filestore/2/1/5/4/3_1d0e0c36dd93e90/34512_1e832fd099a0fad.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34513', 'REC240242', 'Oliver Mountain - Protecting Sensitve Ecosystems While Maintaining Recreational Opportunities', '/filestore/3/1/5/4/3_bcdd68ccf618cfa/34513_ae4ddb1007f4114.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34514', 'REC6100', 'Chromium Creek - Emerald Lake Trail 36x40 Trailhead YAH Kiosk Sign', '/filestore/4/1/5/4/3_b5d08532599850f/34514_7aa369bede6a643.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34515', 'REC32091', 'BergeroncliffsJan2016', '/filestore/5/1/5/4/3_8daed12d4dbd0e3/34515_e34a0338aad7a0f.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34516', 'REC32079', 'tepeesep2019', '/filestore/6/1/5/4/3_7b9e767c90cc9e4/34516_222e4cb00d354d8.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34517', 'REC32089', 'wolverinetrailsmar2019', '/filestore/7/1/5/4/3_18acc4c05d6831a/34517_7bf6caea5f11721.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34518', 'REC32083', 'FlatbedValley2016', '/filestore/8/1/5/4/3_ebbd2c5b0d671a3/34518_025c9eb3e3bb0d7.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34519', 'REC258605', 'Le Hudette Lakes Brochure', '/filestore/9/1/5/4/3_d36fd3da895cf47/34519_0551a4bfd7b958b.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34520', 'REC32072', 'pinnaclejuly2019', '/filestore/0/2/5/4/3_0bbea13f8dc6e1c/34520_9e8a225146e03b3.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34521', 'REC204353', 'Atlin 2016 Brochure Low Res', '/filestore/1/2/5/4/3_680c11158791b33/34521_4627741c0acc81d.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34522', 'REC32059', 'holzworthsep2019', '/filestore/2/2/5/4/3_4243d772e7ad0e5/34522_7d9bffb7e6c89c3.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34523', 'REC5348', 'Lake of the Hanging Glacier Trail Kiosk 36x36 (7.64 MB)', '/filestore/3/2/5/4/3_a9be3b3fa5f0380/34523_93edbedb48bd806.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34524', 'REC16197', 'BoulderBabFeb2016', '/filestore/4/2/5/4/3_c1ce8dbee7817c4/34524_7059d6d7382aacc.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34525', 'REC6895', 'Operating an ORV on a highway or public road', '/filestore/5/2/5/4/3_e68baff1f4ca808/34525_b1accd0dc8634c2.pdf', 'RM', 'pdf', 'csv-import', 'csv-import'),
    ('34526', 'REC32083', 'flatbeddinosep2019', '/filestore/6/2/5/4/3_cc8a61e3045a161/34526_5d4b8d12c0b98ad.pdf', 'RM', 'pdf', 'csv-import', 'csv-import')
    ON CONFLICT (rec_resource_id, ref_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        url = EXCLUDED.url,
        doc_code = EXCLUDED.doc_code,
        extension = EXCLUDED.extension,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = EXCLUDED.updated_by;

    RAISE NOTICE 'Production-only migration executed: inserted/updated recreation_resource_docs for APP_ENV=prod';
  ELSE
    -- In non-production environments, this migration is a no-op
    -- It still gets recorded in flyway_schema_history to maintain version consistency
    RAISE NOTICE 'Skipping production-only migration for APP_ENV=${APP_ENV}';
  END IF;
EXCEPTION
  -- If the APP_ENV is not set (e.g., local dev), skip the migration
  WHEN OTHERS THEN
    RAISE NOTICE 'APP_ENV placeholder not set or error occurred, skipping production-only migration';
END $$;
