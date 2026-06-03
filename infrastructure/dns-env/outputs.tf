output "zone_name_servers" {
  description = "Name servers for this environment's hosted zone"
  value       = aws_route53_zone.main.name_servers
}

output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}
