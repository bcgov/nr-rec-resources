output "images_bucket" {
  description = "Images S3 bucket details"
  value = {
    name = aws_s3_bucket.images.id
    arn  = aws_s3_bucket.images.arn
  }
}

output "public_documents_bucket" {
  description = "Public documents S3 bucket details"
  value = {
    name = aws_s3_bucket.documents.id
    arn  = aws_s3_bucket.documents.arn
  }
}

output "cloudfront" {
  description = "CloudFront distribution details"
  value = {
    domain_name     = aws_cloudfront_distribution.storage.domain_name
    distribution_id = aws_cloudfront_distribution.storage.id
    arn             = aws_cloudfront_distribution.storage.arn
  }
}

output "cloudfront_url" {
  description = "Full CloudFront URL for accessing assets"
  value       = "https://${aws_cloudfront_distribution.storage.domain_name}"
}
