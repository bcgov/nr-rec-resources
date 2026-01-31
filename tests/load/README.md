# k6 Load Testing

This directory contains k6 load tests for both **public** and **admin**
backends.

## Prerequisites

1. Install k6 - <https://k6.io/docs/get-started/installation/>

## Running Tests

### Public Backend Tests

Tests the public-facing API endpoints (search, resource detail, filters).

```bash
# Local development (default: http://localhost:8000)
cd tests/load && make load_test_public

# Custom server
cd tests/load && make load_test_public PUBLIC_SERVER_HOST=https://dev.example.com

# Save results to CSV
cd tests/load && make load_test_public SAVE_RESULTS=true
```

### Admin Backend Tests

Tests admin-specific endpoints including image uploads and search/suggestions.

> **Important**: Admin endpoints are normally protected by authentication. For
> load testing, temporarily disable auth guards on your target environment.

```bash
# Local development (default: http://localhost:8001)
cd tests/load && make load_test_admin

# Custom server (e.g., dev environment with auth disabled)
cd tests/load && make load_test_admin ADMIN_SERVER_HOST=https://admin-dev.example.com

# Save results to CSV
cd tests/load && make load_test_admin SAVE_RESULTS=true
```

### Run All Tests

```bash
cd tests/load && make load_test_all
```

### Load Profile

Both test suites use ramping VU (virtual user) stages:

- **Public**: Ramps up to 50 concurrent users at peak
- **Admin**: Ramps up to 20 concurrent users at peak (admin traffic is typically
  lower)

### Thresholds

- **Public**: 99% of requests must complete under 1.5s
- **Admin**: 99% of requests must complete under 3s (uploads may be slower)

## AWS API Gateway Notes

When testing against AWS-hosted environments you may need to disable rate
limiting on the API Gateway WAF `/infrastructure/api/waf.tf`

## Results

Results are saved to `k6_results/` when `SAVE_RESULTS=true`:

- `public_load_test_results.csv`
- `admin_load_test_results.csv`
