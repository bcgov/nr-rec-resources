CREATE TABLE IF NOT EXISTS rst.recreation_campsite (
    rec_resource_id VARCHAR(200) NOT NULL PRIMARY KEY,
    campsite_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (rec_resource_id) REFERENCES rst.recreation_resource (rec_resource_id) ON DELETE CASCADE
);

COMMENT ON TABLE rst.recreation_campsite IS 'Stores the number of campsites associated with each recreation resource.';

COMMENT ON COLUMN rst.recreation_campsite.rec_resource_id IS 'Foreign key linking to the recreation resource this campsite count belongs to.';

COMMENT ON COLUMN rst.recreation_campsite.campsite_count IS 'The number of campsites available at this recreation resource.';
