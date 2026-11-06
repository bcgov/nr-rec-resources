output "apigw_url" {
  description = "Public base URL to call the API through CloudFront"
  value = (
    var.use_api_custom_domain_url && length(var.api_custom_domains) > 0
    ? "https://${var.api_custom_domains[0]}"
    : "https://${aws_cloudfront_distribution.api.domain_name}"
  )
}

output "cloudfront_domain_name" {
  description = "API CloudFront domain name, used as the target for the DNS alias records"
  value       = aws_cloudfront_distribution.api.domain_name
}

output "api_custom_domains" {
  description = "Custom domain aliases on the API CloudFront distribution"
  value       = var.api_custom_domains
}
