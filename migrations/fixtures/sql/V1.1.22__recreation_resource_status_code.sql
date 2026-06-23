
INSERT INTO rst.recreation_resource_status_code (
    recreation_resource_status_code,
    description,
    effective_date,
    expiry_date,
    update_timestamp
)
VALUES
    ('AR', 'Archived',                      '1900-01-01', NULL, '2000-01-01'),
    ('CL', 'Clearance',                     '1900-01-01', NULL, '2000-01-01'),
    ('DD', 'Disallowed by District',        '1900-01-01', NULL, '2000-01-01'),
    ('DE', 'Designation',                   '1900-01-01', NULL, '2000-01-01'),
    ('EE', 'Entered In Error',              '1900-01-01', NULL, '2000-01-01'),
    ('HI', 'Issued',                        '1900-01-01', NULL, '2000-01-01'),
    ('HX', 'Cancelled',                     '1900-01-01', NULL, '2000-01-01'),
    ('NC', 'No Clearance or Designation',   '1900-01-01', NULL, '2000-01-01'),
    ('PE', 'Pending Electronic',            '1900-01-01', NULL, '2000-01-01'),
    ('PI', 'Pending Issuance',              '1900-01-01', NULL, '2000-01-01')
ON CONFLICT (recreation_resource_status_code) DO UPDATE SET
    description      = excluded.description,
    effective_date   = excluded.effective_date,
    expiry_date      = excluded.expiry_date,
    update_timestamp = excluded.update_timestamp;
