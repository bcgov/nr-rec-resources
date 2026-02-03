-- Development fixtures for recreation_establishment_order_docs
-- Recreation resources used:
--   REC204117: 0 K SNOWMOBILE PARKING LOT
--   REC6866: 1861 GOLDRUSH PACK TRAIL

INSERT INTO rst.recreation_establishment_order_docs (s3_key, rec_resource_id, title, file_size, extension)
SELECT * FROM (VALUES
  ('REC204117/1981-06-11.pdf', 'REC204117', '1981 06 11', 250000, 'pdf'),
  ('REC204117/1992-06-11.pdf', 'REC204117', '1992 06 11', 180000, 'pdf'),
  ('REC6866/1981-06-11.pdf', 'REC6866', '1981 06 11', 420000, 'pdf'),
  ('REC6866/1992-06-11.pdf', 'REC6866', '1992 06 11', 195000, 'pdf')
) AS t (s3_key, rec_resource_id, title, file_size, extension)
WHERE EXISTS (
  SELECT 1 FROM rst.recreation_resource WHERE rec_resource_id = t.rec_resource_id
);
