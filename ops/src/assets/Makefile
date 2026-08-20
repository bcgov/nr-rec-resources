# Asset sync – migrate FTA structure data into RST recreation_asset table
# Run from the repo root OR from ops/src/assets/
#
# Set required environment variables before running:
#   export PGPASSWORD='<your-db-password>'
#   export DATABASE_URL='postgresql://sysadmin@localhost:5433/rst'

SHELL := /usr/bin/env bash
ROOT  := $(shell git rev-parse --show-toplevel 2>/dev/null || echo "../../..")

OPS := $(ROOT)/ops

.PHONY: sync-assets
sync-assets: ## Sync FTA structures into rst.recreation_asset
	@cd "$(OPS)" && npx tsx src/assets/sync-assets.ts $(ARGS)

.PHONY: sync-assets-clean
sync-assets-clean: ## Truncate rst.recreation_asset then re-sync all assets from FTA
	@cd "$(OPS)" && npx tsx src/assets/sync-assets.ts --clean $(ARGS)

.PHONY: sync-assets-dry
sync-assets-dry: ## Dry run – validate FTA data without writing to the RST database
	@cd "$(OPS)" && npx tsx src/assets/sync-assets.ts --dry-run $(ARGS)

.PHONY: sync-repairs
sync-repairs: ## Sync FTA repair data into rst.recreation_asset_repair (structures + campsites)
	@cd "$(OPS)" && npx tsx src/assets/sync-repairs.ts $(ARGS)

.PHONY: sync-repairs-with-trails
sync-repairs-with-trails: ## Sync FTA repair data including trail segment repairs
	@cd "$(OPS)" && npx tsx src/assets/sync-repairs.ts --no-skip-trails $(ARGS)

.PHONY: sync-repairs-clean
sync-repairs-clean: ## Truncate rst.recreation_asset_repair then re-sync all repairs from FTA
	@cd "$(OPS)" && npx tsx src/assets/sync-repairs.ts --clean $(ARGS)

.PHONY: sync-repairs-dry
sync-repairs-dry: ## Dry run – validate repair data without writing to RST
	@cd "$(OPS)" && npx tsx src/assets/sync-repairs.ts --dry-run $(ARGS)

.PHONY: sync-all
sync-all: sync-assets-clean sync-repairs-clean ## Full re-sync: assets then repairs (structures + campsites)
	@echo "Full sync complete"

.PHONY: sync-all-with-trails
sync-all-with-trails: sync-assets-clean sync-repairs-clean sync-repairs-with-trails ## Full re-sync including trails
	@echo "Full sync (with trails) complete"
