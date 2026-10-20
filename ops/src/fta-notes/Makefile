# FTA note import - run from repo root or ops/src/fta-notes
# Usage: make import-fta-notes NOTES_CSV="..." ASSOC_CSV="..." [DB_URL="..."] [ARGS="..."]
#
# Paths may be absolute, or relative to the repo root.
#
# Examples:
#   make -C ops/src/fta-notes import-fta-notes NOTES_CSV=../PROVFOREST_NOTE.csv ASSOC_CSV=../ASSOCIATED_USE.csv
#   make -C ops/src/fta-notes import-fta-notes-dry NOTES_CSV=... ASSOC_CSV=...
#   make -C ops/src/fta-notes import-fta-notes-clean NOTES_CSV=... ASSOC_CSV=...

SHELL := /usr/bin/env bash
ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || echo "../../..")

OPS := $(ROOT)/ops

# Local docker-compose database by default
DB_URL ?= postgresql://postgres:default@localhost:5432/postgres

# Relative paths resolve against the repo root, since the recipes cd into ops/.
abs_path = $(if $(filter /%,$(1)),$(1),$(ROOT)/$(1))

CSV_ARGS = --notes-csv "$(call abs_path,$(NOTES_CSV))" \
           --assoc-csv "$(call abs_path,$(ASSOC_CSV))"

.PHONY: import-fta-notes
import-fta-notes: ## Import historical FTA notes from the CSV extracts
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" \
		npx tsx src/fta-notes/import-fta-notes.ts $(CSV_ARGS) $(ARGS)

.PHONY: import-fta-notes-dry
import-fta-notes-dry: ## Dry run - report what would be imported without writing
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" \
		npx tsx src/fta-notes/import-fta-notes.ts $(CSV_ARGS) --dry-run $(ARGS)

.PHONY: import-fta-notes-clean
import-fta-notes-clean: ## Delete all FTA-sourced notes, then re-import
	@cd "$(OPS)" && DATABASE_URL="$(DB_URL)" \
		npx tsx src/fta-notes/import-fta-notes.ts $(CSV_ARGS) --clean $(ARGS)
