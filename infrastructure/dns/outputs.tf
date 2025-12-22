output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Route 53 hosted zone name servers (for registrar configuration)"
  value       = aws_route53_zone.main.name_servers
}

output "certificate_arn" {
  description = "ACM certificate ARN (for reference)"
  value       = data.aws_acm_certificate.wildcard_cert.arn
}
