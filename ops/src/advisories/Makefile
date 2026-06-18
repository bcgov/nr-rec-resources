# Advisory sync - run from  root or ops/src/advisories
# Usage: make sync-advisories DB_URL="..." API_BASE_URL="..." ARGS="..."
#        make sync-advisories-dry API_BASE_URL="..." ARGS="..."
#
# Examples:
#   make sync-advisories DB_URL="postgresql://user:pass@host/db" API_BASE_URL="https://alpha-dev-cms.bcparks.ca"
#   make sync-advisories-dry ARGS="--max-pages 5"
#   make sync-advisories ARGS="--page-size 50 --concurrency 10"

SHELL := /usr/bin/env bash
ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || echo "../../..")

OPS := $(ROOT)/ops

# Database URL (override with your own)
DB_URL ?= postgresql://{user}:{password}@localhost:5433/rst
API_BASE_URL ?= {url}

.PHONY: sync-advisories
sync-advisories: ## Sync advisories from CMS API to database
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" API_BASE_URL="$(API_BASE_URL)" \
		npx tsx src/advisories/sync-advisories.ts $(ARGS)

.PHONY: sync-advisories-dry
sync-advisories-dry: ## Dry run - validate data without writing to database
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" API_BASE_URL="$(API_BASE_URL)" \
		npx tsx src/advisories/sync-advisories.ts --dry-run $(ARGS)
