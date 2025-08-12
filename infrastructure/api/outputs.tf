output "apigw_url" {
  description = "Public base URL to call the API through CloudFront"
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
}

output "s3_recreation_uploads_bucket_name" {
  description = "Name of the S3 bucket for recreation resource uploads"
  value       = aws_s3_bucket.recreation_resource_uploads.bucket
}

output "s3_recreation_uploads_bucket_arn" {
  description = "ARN of the S3 bucket for recreation resource uploads"
  value       = aws_s3_bucket.recreation_resource_uploads.arn
}

output "s3_recreation_uploads_bucket_domain_name" {
  description = "Domain name of the S3 bucket for recreation resource uploads"
  value       = aws_s3_bucket.recreation_resource_uploads.bucket_domain_name
}
