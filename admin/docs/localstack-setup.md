# LocalStack Setup for Local Development

LocalStack provides a local AWS cloud stack emulator for development and
testing. It allows you to test S3 operations without connecting to AWS.

## Setup LocalStack

1. **Install LocalStack** (Docker recommended):

   ```bash
   # Using Docker
   docker pull localstack/localstack

   # Or using Homebrew (macOS)
   brew install localstack/tap/localstack
   ```

2. **Start LocalStack**:

   ```bash
   # Using Makefile
   make localstack
   # Or using localstack CLI
   localstack start
   # Or manually with Docker
   docker run --rm -it -p 4566:4566 -p 4571:4571 localstack/localstack
   ```

3. **Create required S3 buckets** in LocalStack:

   ```bash
   # Using AWS CLI with LocalStack endpoint
   aws --endpoint-url=http://localhost:4566 s3 mb s3://rst-storage-images-dev
   aws --endpoint-url=http://localhost:4566 s3 mb s3://rst-storage-public-documents-dev
   aws --endpoint-url=http://localhost:4566 s3 mb s3://rst-lza-establishment-order-docs-dev

   # Alternatively one command to run localstack and set up everything
   make localstack-setup
   ```

4. **Configure environment variables**:

Set `AWS_ENDPOINT_URL=http://localhost:4566` in your `.env` file or environment.

## How It Works

When `AWS_ENDPOINT_URL` is configured, the application automatically:

- Connects to LocalStack instead of AWS S3
- Uses direct URLs (`http://localhost:4566/bucket/key`) instead of CloudFront
  URLs
- Uses direct URLs instead of presigned URLs for establishment order documents
- Maintains the same S3 key structure as production

The S3 key structure remains consistent:

- Images: `images/{recResourceId}/{imageId}/{sizeCode}.webp`
- Documents: `documents/{recResourceId}/{documentId}.{extension}`
- Establishment order docs: `{recResourceId}/{filename}`

## Troubleshooting

### LocalStack not starting

- Ensure Docker is running (if using Docker)
- Check that ports 4566 and 4571 are not in use
- Verify LocalStack container is running: `docker ps | grep localstack`

### Bucket creation fails

- Ensure LocalStack is running before creating buckets
- Check that bucket names match your environment variables
- Verify AWS CLI is configured (credentials not required for LocalStack)

### Application can't connect to LocalStack

- Verify `AWS_ENDPOINT_URL=http://localhost:4566` is set in your environment
- Check that LocalStack is accessible at `http://localhost:4566`
- Ensure the backend service is reading the correct environment variables
