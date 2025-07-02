# CloudWatch Dashboard
locals {
  region    = "ca-central-1"
  period    = 300
  namespace = "RecreationSitesAndTrailsBCAPI-${var.app_env}"

  operations = [
    "searchRecreationResources",
    "getRecreationResourceById",
    "getSiteOperatorById"
  ]

  latency_thresholds = {
    searchRecreationResources = 1500
    getRecreationResourceById = 400
    getSiteOperatorById       = 500
  }

  client_error_metrics = [
    for op in local.operations : [local.namespace, "ErrorCount", "Operation", op, "ErrorType", "ClientError"]
  ]

  server_error_metrics = [
    for op in local.operations : [local.namespace, "ErrorCount", "Operation", op, "ErrorType", "ServerError"]
  ]

  request_count_metrics = [
    for op in local.operations : [local.namespace, "RequestCount", "Operation", op]
  ]

  latency_tm99_metrics = [
    for op in local.operations :
    [local.namespace, "RequestLatency", "Operation", op, "Method", "GET", { stat = "tm99" }]
  ]

  latency_tm95_metrics = [
    for op in local.operations :
    [local.namespace, "RequestLatency", "Operation", op, "Method", "GET", { stat = "tm95" }]
  ]

  # Thresholds for errors
  server_error_threshold = 5
  client_error_threshold = 20

  # Period and evaluation period for alarms
  alarm_period       = 60 # 1 minute
  evaluation_periods = 2  # Check for 2 consecutive periods

  alarm_alert_email_recipients = split(",", var.alarm_alert_email_recipients)

  common_resource_tags = {
    Environment = var.app_env
    Project     = "RecreationSitesAndTrailsBC"
    ManagedBy   = "Terraform"
  }
}

resource "aws_cloudwatch_dashboard" "api_dashboard" {
  dashboard_name = "RecreationSitesAndTrailsBC-API-${var.app_env}"

  dashboard_body = jsonencode({
    widgets = [
      # Dashboard Header
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# Recreation Sites & Trails BC API Dashboard (${var.app_env})\nMonitor request volume, error rates, and latency across major operations.\n_All metrics are shown in 5-minute intervals._"
        }
      },

      {
        type   = "alarm"
        x      = 0
        y      = 0
        width  = 24
        height = 6
        properties = {
          title = "🔔 Alarm Status"
          alarms = concat(
            values(aws_cloudwatch_metric_alarm.latency_alarms)[*].arn,
            values(aws_cloudwatch_metric_alarm.server_error_rate_alarm)[*].arn,
            values(aws_cloudwatch_metric_alarm.client_error_rate_alarm)[*].arn
          )
        }
      },

      # Request Count
      {
        type   = "metric"
        x      = 0
        y      = 3
        width  = 24
        height = 6
        properties = {
          title   = "📊 [Traffic] API Request Volume by Operation (5 min)"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = local.request_count_metrics
        }
      },

      # Section Header for Errors
      {
        type   = "text"
        x      = 0
        y      = 9
        width  = 24
        height = 2
        properties = {
          markdown = "## ⚠️ Error Metrics\nClient (4xx) and Server (5xx) errors broken down by API operation."
        }
      },

      # Client & Server Errors side by side
      {
        type   = "metric"
        x      = 0
        y      = 9
        width  = 12
        height = 6
        properties = {
          title   = "⚠️ Client Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = local.client_error_metrics
          annotations = {
            horizontal = [
              {
                value = local.client_error_threshold
                label = "Alarm: >${local.client_error_threshold} for ${local.evaluation_periods * local.period / 60} min"
                color = "#FF9900"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 9
        width  = 12
        height = 6
        properties = {
          title   = "🚨 Server Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = local.server_error_metrics
          annotations = {
            horizontal = [
              {
                value = local.server_error_threshold
                label = "Alarm: >${local.server_error_threshold} for ${local.evaluation_periods * local.period / 60} min"
                color = "#FF9900"
              }
            ]
          }
        }
      },

      # Section Header for Latency
      {
        type   = "text"
        x      = 0
        y      = 17
        width  = 24
        height = 2
        properties = {
          markdown = "## ⏱️ Request Latency Metrics\nTracking 95th and 99th percentile latency for each API operation."
        }
      },

      # Latency TM99 and TM95 side by side
      {
        type   = "metric"
        x      = 0
        y      = 22
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM99 (99th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = local.latency_tm99_metrics
          annotations = {
            horizontal = [
              for op in local.operations : {
                value = local.latency_thresholds[op]
                label = "${op} Threshold (${local.latency_thresholds[op]}ms)"
                color = "#FF9900"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 22
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM95 (95th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = local.latency_tm95_metrics
          annotations = {
            horizontal = [
              for op in local.operations : {
                value = local.latency_thresholds[op]
                label = "${op} Threshold (${local.latency_thresholds[op]}ms)"
                color = "#FF9900"
              }
            ]
          }
        }
      }
    ]
  })
}

# CloudWatch Alarms

# Latency alarms
resource "aws_cloudwatch_metric_alarm" "latency_alarms" {
  for_each = local.latency_thresholds

  alarm_name          = "[${var.app_env}] High-Latency-Alarm-${each.key}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  datapoints_to_alarm = 2
  metric_name         = "RequestLatency"
  namespace           = local.namespace
  period              = local.alarm_period
  statistic           = "Average"
  threshold           = each.value
  alarm_description   = "Latency for ${each.key} exceeds ${each.value}ms in 2/${local.evaluation_periods} periods"
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    Operation = each.key
    Method    = "GET"
  }

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms - ${var.app_env}"
  })
}

# Alarm for Server Errors (5xx) across all operations
resource "aws_cloudwatch_metric_alarm" "server_error_rate_alarm" {
  for_each = toset(local.operations)

  alarm_name          = "[${var.app_env}] High-Server-Error-Rate-Alarm-${each.value}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  metric_name         = "ErrorCount"
  namespace           = local.namespace
  period              = local.alarm_period
  statistic           = "Sum"
  threshold           = local.server_error_threshold
  alarm_description   = "High server error rate (5xx) detected for operation ${each.value}."
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ErrorType = "ServerError"
    Operation = each.value
  }

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms - ${var.app_env}"
  })
}

# Alarm for Client Errors (4xx) across all operations
resource "aws_cloudwatch_metric_alarm" "client_error_rate_alarm" {
  for_each = toset(local.operations)

  alarm_name          = "[${var.app_env}] High-Client-Error-Rate-Alarm-${each.value}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  metric_name         = "ErrorCount"
  namespace           = local.namespace
  period              = local.alarm_period
  statistic           = "Sum"
  threshold           = local.client_error_threshold
  alarm_description   = "High client error rate (4xx) detected for operation ${each.value}."
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ErrorType = "ClientError"
    Operation = each.value
  }

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms - ${var.app_env}"
  })
}

# SNS Topic for Alarms
resource "aws_kms_key" "alarm_topic_sns_key" {
  description             = "KMS key for SNS topic encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_sns_topic" "alarm_topic" {
  name              = "${var.app_env}-api-monitoring-alarms"
  kms_master_key_id = aws_kms_key.alarm_topic_sns_key.arn

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms Topic - ${var.app_env}"
  })
}

resource "aws_sns_topic_subscription" "alarm_emails" {
  for_each = toset(local.alarm_alert_email_recipients)

  topic_arn = aws_sns_topic.alarm_topic.arn
  protocol  = "email"
  endpoint  = each.key
}
