SHELL := /usr/bin/env bash

include ./backend/.env

PSQL=psql -h localhost
DB_NAME=${POSTGRES_DATABASE}
DB_SCHEMA=${POSTGRES_SCHEMA}
FLYWAY=flyway
MIGRATIONS_DIR=migrations/rst
FIXTURES_DIR=migrations/fixtures
MIGRATION_TABLE=flyway_schema_history
FIXTURE_TABLE=flyway_fixture_schema_history

.PHONY: create_db
create_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 1 || \
		$(PSQL) -d postgres -c "CREATE DATABASE $(DB_NAME)";

.PHONY: drop_db
drop_db:
	@$(PSQL) -d postgres -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 0 || \
		$(PSQL) -d postgres -c "DROP DATABASE $(DB_NAME)";

.PHONY: migrate
migrate:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -schemas=$(DB_SCHEMA) -locations=filesystem:$(MIGRATIONS_DIR) -table=$(MIGRATION_TABLE) -baselineOnMigrate=true -validateMigrationNaming=true migrate

.PHONY: load_fixtures
load_fixtures:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -locations=filesystem:$(FIXTURES_DIR) -table=$(FIXTURE_TABLE) -baselineOnMigrate=true -validateMigrationNaming=true migrate

.PHONY: clean
clean:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -schemas=$(DB_SCHEMA) -locations=filesystem:$(MIGRATIONS_DIR) clean

.PHONY: reset_db
reset_db: drop_db create_db migrate load_fixtures

.PHONY: load_test_backend
load_test_backend: ## run performance tests with k6
load_test_backend: SERVER_HOST=http://localhost:8000
load_test_backend: SERVER_API_ROUTE=/api
load_test_backend: SERVER_ROUTE=$(SERVER_HOST)$(SERVER_API_ROUTE)
load_test_backend:
	@mkdir -p k6_results
	@echo "Running backend performance tests with k6"
	@k6 -e SERVER_HOST=$(SERVER_ROUTE) run tests/load/backend/main.js --out csv=k6_results/frontend_test_results.csv

.PHONY: load_test_frontend
load_test_frontend: ## run performance tests with k6
load_test_frontend: FRONTEND_URL=http://localhost:3000
load_test_frontend:
	@mkdir -p k6_results
	@echo "Running frontend performance tests with k6"
	@k6 -e FRONTEND_URL=$(FRONTEND_URL) run tests/load/frontend/main.js --out csv=k6_results/backend_test_results.csv
