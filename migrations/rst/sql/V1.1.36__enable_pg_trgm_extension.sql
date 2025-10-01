-- Enable pg_trgm extension for fuzzy text search
-- This extension provides similarity() function for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
