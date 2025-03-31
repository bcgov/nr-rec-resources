SHELL := /usr/bin/env bash

include ./backend/.env

PSQL=psql -h localhost -U ${POSTGRES_USER}
DB_NAME=${POSTGRES_DATABASE}
DB_SCHEMA=${POSTGRES_SCHEMA}
FLYWAY=flyway
MIGRATIONS_DIR=migrations/rst
FIXTURES_DIR=migrations/fixtures
MIGRATION_TABLE=flyway_schema_history
FIXTURE_TABLE=flyway_fixture_schema_history

.PHONY: create_db
create_db:
	@$(PSQL) -d template1 -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 1 || \
		$(PSQL) -d template1 -c "CREATE DATABASE $(DB_NAME)";

.PHONY: drop_db
drop_db:
	@$(PSQL) -d template1 -tc "SELECT count(*) FROM pg_database WHERE datname = '$(DB_NAME)'" | \
		grep -q 0 || \
		$(PSQL) -d template1 -c "DROP DATABASE $(DB_NAME)";

.PHONY: migrate
migrate:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -schemas=$(DB_SCHEMA) -locations=filesystem:$(MIGRATIONS_DIR) -table=$(MIGRATION_TABLE) -baselineOnMigrate=true -validateMigrationNaming=true migrate

.PHONY: load_fixtures
load_fixtures:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -locations=filesystem:$(FIXTURES_DIR) -table=$(FIXTURE_TABLE) -baselineOnMigrate=true -validateMigrationNaming=true migrate

.PHONY: clean
clean:
	$(FLYWAY) -url=jdbc:postgresql://$(POSTGRES_HOST)/$(DB_NAME) -user=$(POSTGRES_USER) -password=$(POSTGRES_PASSWORD) -schemas=$(DB_SCHEMA) -locations=filesystem:$(MIGRATIONS_DIR) clean

## Ensure that your backend isn't running and that there are no active connections to the database
.PHONY: reset_db
reset_db: drop_db create_db migrate load_fixtures

# Reset the project, useful when switching branches with different packages and migrations
.PHONY: reset_project
reset_project:
	@echo "Resetting the project..."
	make reset_db
	cd backend && npm install && npx prisma generate
	cd frontend && npm install
	@echo "Project reset completed."
