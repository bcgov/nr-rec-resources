SHELL := /usr/bin/env bash

include ./backend/.env

PSQL=psql -h localhost
DB_NAME=${POSTGRES_DATABASE}
DB_SCHEMA=${POSTGRES_SCHEMA}

.PHONY: create_db
create_db: ## Ensure that the $(DB_NAME) database exists
create_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE $(DB_NAME)";

.PHONY: drop_db
drop_db: ## Drop the $(DB_NAME) database if it exists
drop_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE $(DB_NAME)";

.PHONY: migrate
migrate: ## create the migrations
migrate:
	## TODO:: this is a very basic setup, we should use flyway for migrations
	for file in ./migrations/rst/sql/*.sql; do \
		printf "Applying migration: ${DB_NAME}/$$(basename $$file)\n"; \
		$(PSQL) -d $(DB_NAME) -f $$file; \
	done

.PHONY: load_fixtures
load_fixtures: ## Load the fixtures
load_fixtures:
	for file in ./migrations/fixtures/sql/*.sql; do \
		printf "Applying fixture: ${DB_NAME}/$$(basename $$file)\n"; \
		$(PSQL) -d $(DB_NAME) -f $$file; \
	done

.PHONY: reset_db
reset_db: ## Drop and recreate the $(DB_NAME) database, migrate and load fixtures
reset_db: drop_db create_db migrate load_fixtures

.PHONY: load_test_backend
load_test_backend: ## run performance tests with k6
load_test_backend: SERVER_HOST=http://127.0.0.1:8000
load_test_backend: SERVER_API_ROUTE=/api
load_test_backend: SERVER_ROUTE=$(SERVER_HOST)$(SERVER_API_ROUTE)
load_test_backend:
	@echo "Running performance tests with k6"
	@k6 -e SERVER_HOST=$(SERVER_ROUTE) run tests/load/backend/backend-test.js --out csv=k6_results/test_results.csv
