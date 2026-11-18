UPDATE rst.recreation_resource_status_code
SET description = 'Pending'
WHERE recreation_resource_status_code = 'PE'
  AND description <> 'Pending';
