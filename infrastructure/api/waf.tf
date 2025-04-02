resource "aws_wafv2_web_acl" "app" {
  name  = "app-web-acl-${var.app_name}"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "RateLimitPerIP"
    priority = 1

    action {
      # Block requests from IP that exceed rate limit
      block {}
    }

    statement {
      rate_based_statement {
        # Max 500 requests per 5 minutes per IP
        limit              = 500
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitPerIP"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "AppWebACL"
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "app" {
  resource_arn = aws_alb.app-alb.arn
  web_acl_arn  = aws_wafv2_web_acl.app.arn
}
