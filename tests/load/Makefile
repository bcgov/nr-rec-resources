SHELL := /usr/bin/env bash

.PHONY: load_test
load_test: ## run performance tests with k6
load_test: SERVER_HOST=https://w0x1vcr6rc.execute-api.ca-central-1.amazonaws.com
load_test: SERVER_API_ROUTE=/api
load_test: SERVER_ROUTE=$(SERVER_HOST)$(SERVER_API_ROUTE)
load_test: SAVE_RESULTS=false
load_test: OUT_OPTION=$(if $(filter true,$(SAVE_RESULTS)),--out csv=k6_results/backend_test_results.csv)
load_test:
	@mkdir -p k6_results
	@echo "Running backend performance tests with k6"
	@k6 -e SERVER_HOST=$(SERVER_ROUTE) run backend/main.js $(OUT_OPTION)
