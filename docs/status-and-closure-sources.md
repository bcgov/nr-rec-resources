# Status & closure source migration guide

Tracks every remaining place we still read from FTA or branch on a toggle, so we
can retire FTA as a status source cleanly when we have to.

## Target end state

- RST advisories (`act_advisories_flat`, top-ranked by the canonical ranking) is
  the only source for open/closed/restricted/etc. status, everywhere in both
  apps.
- FTA's legacy open/closed flag (`recreation_comment.closure_ind` →
  `recreation_status`) is no longer read anywhere.
- The `FEATURE_ADVISORY_STATUS` flag (public) and the `rst-developer` role gate
  (admin) are both deleted for stuff related to closures and status, since RST
  becomes unconditional.
- **Out of scope:** FTA's file/life-cycle status (`recreation_file_status_code`,
  e.g. Archived) is a different concept from open/closed and isn't part ofthis
  migration, it stays sepatate.

## Public app

### Backend

- Search results status label (`formatSearchResults`): branches on the
  advisory-status flag; drop the branch, always use the RST grouplabel.
- Search results list query (`buildRecreationResourcePageQuery`): already
  computes the RST grouplabel via a lateral join, but its ordering doesn't match
  the canonical advisory ranking used everywhere else, fix this as part of
  cutover, otherwise a resource can show one status on the search card and a
  different one when filtered/sorted.
- Status filter, Open/Closed (`buildSearchFilterQuery`): branches on the feature
  flag; drop the FTA branch.
- Status filter counts (`buildSearchFilterOptionCountsQuery`): branches on the
  feature flag; drop the FTA branch.
- Detail page status label (`formatRecreationResourceDetailResults`): branches
  on the feature flag; drop the FTA branch.
- Detail page `recreation_status` object: still always FTA-sourced and still
  returned in the API response. Confirm nothing consumes it once the header is
  fully RST-driven, then remove the field and its query.
- `published_at` guard: applied in the search/filter/count queries but not in
  the detail advisories query. Decide once whether this guard should exist at
  all — if not, remove it everywhere rather than making it consistent.
- Config (`app-config.service`): remove `advisoryStatusEnabled` /
  `useAdvisoryStatus` and the `FEATURE_ADVISORY_STATUS` env var once nothing
  branches on it.

### Frontend

- Resource card + map pin pop-up card (`RecResourceCard`, `AccessStatus`,
  `getStatusIcon`): already RST — just renders whatever grouplabel the backend
  sends. Nothing to change here once the backend is cut over.
- Detail page header (`ResourceHeader`, `Status`): same as above, already RST,
  nothing to change once the backend is cut over.
- "Closures" section (`useRecResourceSection`, `Closures`): the one frontend
  surface still directly keyed off the legacy FTA status code (closed when
  `statusCode === 2` and a comment exists). Needs a decision: retire this
  section in favor of the RST advisories list (which already covers closures),
  or re-key its visibility off an RST-derived closed state.
- Map pin colour (`recreationFeatureLayer`): reads `CLOSURE_IND` from the
  external ESRI feature layer, a separate service outside our database. Since
  they will fetch data from RST. This is handled automatically.

## Admin app

### Backend

- Search rows (`recreation-resource-search.queries`,
  `recreation-resource.service`, `recreation-resource.select`): already emit the
  RST grouplabel alongside the FTA fields. Once cut over, stop
  emitting/filtering the FTA open/closed field; keep the file life-cycle field
  as-is (different concept, not part of this migration).
- `published_at` guard: none of admin's advisory queries apply it today. Align
  with whatever's decided on the public side above.

### Frontend

- Search table "Status" column (FTA) vs. "Public access status" column (RST):
  once cut over, drop the FTA "Status" column and its filter, and remove the
  `rst-developer` / `canViewFeatureFlag` gate so "Public access status" is just
  always visible.
- "File Status" column: stays as-is, separate concept, not part of this
  migration.
- Detail page chip (`ResourceHeaderSection`): currently shows only the FTA
  status badge (plus the file-status badge) — there's no RST-based badge here at
  all today. Decide whether to swap the FTA badge for an RST one, or add it
  alongside, before removing the FTA source.
- Advisories section (`RecResourceAdvisoriesSection`, `advisories.service`):
  already fully RST-based, nothing to change.
- Auth (`useAuthorizations`): remove `canViewFeatureFlag` / the `rst-developer`
  check once the RST column/filter is unconditional.

---

## Known loose ends to resolve as part of (or before) cutover

1. Public search list's advisory ordering doesn't match the canonical ranking
   used everywhere else — fix so status is consistent across all public
   surfaces.
2. `published_at` guard is applied inconsistently across queries. Decide once,
   then remove or apply it everywhere.
3. Admin's detail page has no RST-based status badge. Decide the intended end
   state before removing the FTA one.
