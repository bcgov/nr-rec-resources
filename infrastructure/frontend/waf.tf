locals {
  waf_cloudfront_resource_name = "frontend-${var.target_env}-${var.app_env}waf-cloudfront"
}

# CloudFront WAF ACL
resource "aws_wafv2_web_acl" "waf_cloudfront" {
    name        = "${local.waf_cloudfront_resource_name}"
    description = "CloudFront WAF Rules"
    scope       = "CLOUDFRONT"
    provider    = aws.east # Cloudfront ACL has to be created in this region.

    default_action {
        allow {}
    }


    ## AWS Managed rules below.
    rule {
        name     = "AWS-AWSManagedRulesAmazonIpReputationList"
        priority = 0

        override_action {
            none {}
        }
        statement {
            managed_rule_group_statement {
                vendor_name = "AWS"
                name        = "AWSManagedRulesAmazonIpReputationList"
            }
        }
        visibility_config {
            cloudwatch_metrics_enabled = true
            metric_name                = "${local.waf_cloudfront_resource_name}-AWSManagedRulesAmazonIpReputationList"
            sampled_requests_enabled   = true
        }
    }

    rule {
        name     = "AWS-AWSManagedRulesCommonRuleSet"
        priority = 1

        override_action {
            none {}
        }
        statement {
            managed_rule_group_statement {
                vendor_name = "AWS"
                name        = "AWSManagedRulesCommonRuleSet"
            }
        }
        visibility_config {
            cloudwatch_metrics_enabled = true
            metric_name                = "${local.waf_cloudfront_resource_name}-AWSManagedRulesCommonRuleSet"
            sampled_requests_enabled   = true
        }
    }

    rule {
        name     = "AWS-AWSManagedRulesKnownBadInputsRuleSet"
        priority = 2

        override_action {
            none {}
        }
        statement {
            managed_rule_group_statement {
                vendor_name = "AWS"
                name        = "AWSManagedRulesKnownBadInputsRuleSet"
            }
        }
        visibility_config {
            cloudwatch_metrics_enabled = true
            metric_name                = "${local.waf_cloudfront_resource_name}-AWSManagedRulesKnownBadInputsRuleSet"
            sampled_requests_enabled   = true
        }
    }

    rule {
        name     = "AWS-AWSManagedRulesLinuxRuleSet"
        priority = 3

        override_action {
            none {}
        }
        statement {
            managed_rule_group_statement {
                vendor_name = "AWS"
                name        = "AWSManagedRulesLinuxRuleSet"
            }
        }
        visibility_config {
            cloudwatch_metrics_enabled = true
            metric_name                = "${local.waf_cloudfront_resource_name}-AWSManagedRulesLinuxRuleSet"
            sampled_requests_enabled   = true
        }
    }

    rule {
        name     = "AWS-AWSManagedRulesSQLiRuleSet"
        priority = 4

        override_action {
            none {}
        }
        statement {
            managed_rule_group_statement {
                vendor_name = "AWS"
                name        = "AWSManagedRulesSQLiRuleSet"
            }
        }
        visibility_config {
            cloudwatch_metrics_enabled = true
            metric_name                = "${local.waf_cloudfront_resource_name}-AWSManagedRulesSQLiRuleSet"
            sampled_requests_enabled   = true
        }
    }

    tags = {
        env = "${var.target_env}"
        managed-by = "terraform"
    }

    visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${local.waf_cloudfront_resource_name}"
        sampled_requests_enabled   = true
    }
}
