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

.PHONY: migrations
migrations: ## create the migrations
migrations: 
	## TODO:: use flyway for migrations
	for file in ./migrations/sql/*.sql; do \
		printf "Applying migration: ${DB_NAME}/$$(basename $$file)\n"; \
		$(PSQL) -d $(DB_NAME) -f $$file; \
	done

.PHONY: reset_db
reset_db: ## Drop and recreate the $(DB_NAME) database
reset_db: drop_db create_db migrations
