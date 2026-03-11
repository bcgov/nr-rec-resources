# GuardDuty S3 malware scan – run from repo root or ops/src/guardduty
# Usage: make list-unscanned BUCKET=my-bucket [PROFILE=dev-admin] [OUTPUT=unscanned-keys.txt] [REGION=ca-central-1]
#        make scan BUCKET=my-bucket KEYS_FILE=unscanned-keys.txt [PROFILE=dev-admin] [REGION=ca-central-1]
#        make verify BUCKET=my-bucket KEYS_FILE=unscanned-keys.txt [PROFILE=dev-admin] [REGION=ca-central-1]

SHELL := /usr/bin/env bash
ROOT := $(shell git rev-parse --show-toplevel 2>/dev/null || echo "../../..")

OPS := $(ROOT)/ops

.PHONY: list-unscanned
list-unscanned: ## List S3 objects without GuardDutyMalwareScanStatus tag (set BUCKET=)
	@test -n "$(BUCKET)" || (echo "Error: BUCKET is required. Example: make list-unscanned BUCKET=my-bucket"; exit 1)
	@cd "$(OPS)" && npx tsx src/guardduty/list-unscanned-s3-objects.ts --bucket "$(BUCKET)" \
		$(if $(PROFILE),--profile "$(PROFILE)") \
		$(if $(OUTPUT),--output "$(OUTPUT)") \
		$(if $(REGION),--region "$(REGION)")

.PHONY: scan
scan: ## Run GuardDuty malware scan on keys in KEYS_FILE (set BUCKET= and KEYS_FILE=)
	@test -n "$(BUCKET)" || (echo "Error: BUCKET is required. Example: make scan BUCKET=my-bucket KEYS_FILE=keys.txt"; exit 1)
	@test -n "$(KEYS_FILE)" || (echo "Error: KEYS_FILE is required. Example: make scan BUCKET=my-bucket KEYS_FILE=keys.txt"; exit 1)
	@cd "$(OPS)" && npx tsx src/guardduty/run-s3-malware-scan.ts --bucket "$(BUCKET)" --keys-file "$(KEYS_FILE)" \
		$(if $(PROFILE),--profile "$(PROFILE)") \
		$(if $(REGION),--region "$(REGION)")

.PHONY: verify
verify: ## Verify every key in KEYS_FILE has GuardDutyMalwareScanStatus tag (set BUCKET= and KEYS_FILE=)
	@test -n "$(BUCKET)" || (echo "Error: BUCKET is required. Example: make verify BUCKET=my-bucket KEYS_FILE=keys.txt"; exit 1)
	@test -n "$(KEYS_FILE)" || (echo "Error: KEYS_FILE is required. Example: make verify BUCKET=my-bucket KEYS_FILE=keys.txt"; exit 1)
	@cd "$(OPS)" && npx tsx src/guardduty/verify-scan-tags.ts --bucket "$(BUCKET)" --keys-file "$(KEYS_FILE)" \
		$(if $(PROFILE),--profile "$(PROFILE)") \
		$(if $(REGION),--region "$(REGION)")

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-18s %s\n", $$1, $$2}'
