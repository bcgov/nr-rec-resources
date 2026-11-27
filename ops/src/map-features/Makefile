# Map feature cleanup - run from repo root or ops/src/map-features
# Usage: make cleanup-stale-map-features [DB_URL="..."] [ARGS="..."]
#
# Examples:
#   make -C ops/src/map-features cleanup-stale-map-features-dry
#   make -C ops/src/map-features cleanup-stale-map-features
#   make -C ops/src/map-features cleanup-stale-map-features DB_URL="postgresql://user:pass@host:5432/db"

SHELL := /usr/bin/env bash
ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || echo "../../..")

OPS := $(ROOT)/ops

# Local docker-compose database by default
DB_URL ?= postgresql://postgres:default@localhost:5432/postgres

SCRIPT = src/map-features/cleanup-stale-map-features.ts

.PHONY: cleanup-stale-map-features
cleanup-stale-map-features: ## Delete stale map feature rows the fta sync cannot reach
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" npx tsx $(SCRIPT) $(ARGS)

.PHONY: cleanup-stale-map-features-dry
cleanup-stale-map-features-dry: ## Run every check and roll back without deleting
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" npx tsx $(SCRIPT) --dry-run $(ARGS)
