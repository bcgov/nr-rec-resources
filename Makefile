SHELL := /usr/bin/env bash

include ./public/backend/.env

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

.PHONY: terminate_connections
terminate_connections:
	@echo "Terminating active connections to $(DB_NAME)..."
	@$(PSQL) -d postgres -tc "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$(DB_NAME)';"

.PHONY: reset_db
reset_db: terminate_connections drop_db create_db migrate load_fixtures

# Reset the project, useful when switching branches with different packages and migrations
.PHONY: reset_project
reset_project:
	@echo "Resetting the project..."
	make reset_db
	npm install
	cd public/backend && npx prisma generate
	cd admin/backend && npx prisma generate
	@echo "Project reset completed."

.PHONY: load_test
load_test: ## run public backend performance tests with k6
load_test: SERVER_HOST=http://localhost:8000
load_test: SERVER_API_ROUTE=/api
load_test: SERVER_ROUTE=$(SERVER_HOST)$(SERVER_API_ROUTE)
load_test: SAVE_RESULTS=false
load_test: OUT_OPTION=$(if $(filter true,$(SAVE_RESULTS)),--out csv=k6_results/public_load_test_results.csv)
load_test:
	@mkdir -p k6_results
	@echo "Running PUBLIC backend performance tests with k6"
	@k6 -e SERVER_HOST=$(SERVER_ROUTE) run tests/load/public/main.js $(OUT_OPTION)

.PHONY: load_test_admin
load_test_admin: ## run admin backend performance tests with k6
load_test_admin: SERVER_HOST=http://localhost:8001
load_test_admin: SAVE_RESULTS=false
load_test_admin: OUT_OPTION=$(if $(filter true,$(SAVE_RESULTS)),--out csv=k6_results/admin_load_test_results.csv)
load_test_admin:
	@mkdir -p k6_results
	@echo "Running ADMIN backend performance tests with k6"
	@echo "NOTE: Ensure auth guards are disabled on target environment"
	@k6 -e SERVER_HOST=$(SERVER_HOST) run tests/load/admin/main.js $(OUT_OPTION)

# LocalStack S3 Development

LOCALSTACK_ENDPOINT=http://localhost:4566
IMAGES_BUCKET=rst-storage-images-dev
DOCUMENTS_BUCKET=rst-storage-public-documents-dev
CONSENT_BUCKET=rst-storage-consent-forms-dev
CORS_CONFIG='{"CORSRules":[{"AllowedHeaders":["*"],"AllowedMethods":["PUT","GET","HEAD"],"AllowedOrigins":["http://localhost:3001"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3000}]}'

.PHONY: localstack
localstack: ## Start LocalStack Docker container (background)
	@if docker ps --format '{{.Names}}' | grep -q '^localstack$$'; then \
		echo "LocalStack is already running."; \
	else \
		echo "Starting LocalStack..."; \
		docker stop localstack 2>/dev/null || true; \
		docker rm localstack 2>/dev/null || true; \
		docker run -d --rm --name localstack -p 4566:4566 -p 4571:4571 localstack/localstack; \
		echo "Waiting for LocalStack to be ready..."; \
		until curl -s $(LOCALSTACK_ENDPOINT)/_localstack/health | grep -q '"s3": "running"'; do sleep 1; done; \
		echo "LocalStack is ready at $(LOCALSTACK_ENDPOINT)"; \
	fi

.PHONY: localstack-stop
localstack-stop: ## Stop LocalStack Docker container
	@echo "Stopping LocalStack..."
	@docker stop localstack 2>/dev/null || true

.PHONY: localstack-buckets
localstack-buckets: ## Create S3 buckets in LocalStack
	@echo "Creating S3 buckets in LocalStack..."
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3 mb s3://$(IMAGES_BUCKET) 2>/dev/null || true
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3 mb s3://$(DOCUMENTS_BUCKET) 2>/dev/null || true
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3 mb s3://$(CONSENT_BUCKET) 2>/dev/null || true
	@echo "Buckets created."

.PHONY: localstack-cors
localstack-cors: ## Configure CORS rules for LocalStack S3 buckets
	@echo "Configuring CORS for S3 buckets..."
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3api put-bucket-cors --bucket $(IMAGES_BUCKET) --cors-configuration $(CORS_CONFIG)
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3api put-bucket-cors --bucket $(DOCUMENTS_BUCKET) --cors-configuration $(CORS_CONFIG)
	@aws --endpoint-url=$(LOCALSTACK_ENDPOINT) s3api put-bucket-cors --bucket $(CONSENT_BUCKET) --cors-configuration $(CORS_CONFIG)
	@echo "CORS configured."

.PHONY: localstack-setup
localstack-setup: localstack localstack-buckets localstack-cors ## Start LocalStack, create buckets, and configure CORS
	@echo "LocalStack S3 setup complete."
