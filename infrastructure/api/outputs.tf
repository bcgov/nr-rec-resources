output "apigw_url" {
  description = "Public base URL to call the API through CloudFront"
  value       = "https://${aws_cloudfront_distribution.api.domain_name}"
}
