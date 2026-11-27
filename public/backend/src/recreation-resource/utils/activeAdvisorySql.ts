import { Prisma } from '@generated/prisma';

// advisories that count toward status: published, not expired, already in
// effect. Expects the advisories table aliased as aaf.
export const ACTIVE_ADVISORY_SQL = Prisma.sql`aaf.published_at IS NOT NULL
  AND (aaf.expiry_date IS NULL OR aaf.expiry_date > now())
  AND (aaf.effective_date IS NULL OR aaf.effective_date <= now())`;
