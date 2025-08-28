# CloudWatch Dashboard
locals {
  region = "ca-central-1"
  period = 300

  # Define namespaces and their configurations
  api_configs = {
    public = {
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
    }
    admin = {
      namespace = "RecreationSitesAndTrailsBCAdminAPI-${var.app_env}"
      operations = [
        "createRecreationResource",
        "updateRecreationResource",
        "deleteRecreationResource",
        "getAdminRecreationResourceById",
        "searchAdminRecreationResources",
        "createSiteOperator",
        "updateSiteOperator",
        "deleteSiteOperator",
        "getAdminSiteOperatorById"
      ]
      latency_thresholds = {
        createRecreationResource        = 2000
        updateRecreationResource        = 1500
        deleteRecreationResource        = 1000
        getAdminRecreationResourceById  = 600
        searchAdminRecreationResources  = 2000
        createSiteOperator              = 1500
        updateSiteOperator              = 1200
        deleteSiteOperator              = 800
        getAdminSiteOperatorById        = 500
      }
    }
  }

  # Flatten operations and metrics for all APIs
  all_operations = flatten([
    for api_type, config in local.api_configs : [
      for op in config.operations : {
        api_type  = api_type
        operation = op
        namespace = config.namespace
        threshold = config.latency_thresholds[op]
      }
    ]
  ])

  client_error_metrics = [
    for op_config in local.all_operations : 
    [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ClientError"]
  ]

  server_error_metrics = [
    for op_config in local.all_operations : 
    [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ServerError"]
  ]

  request_count_metrics = [
    for op_config in local.all_operations : 
    [op_config.namespace, "RequestCount", "Operation", op_config.operation]
  ]

  latency_tm99_metrics = [
    for op_config in local.all_operations :
    [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm99" }]
  ]

  latency_tm95_metrics = [
    for op_config in local.all_operations :
    [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm95" }]
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

# Public API Dashboard
resource "aws_cloudwatch_dashboard" "public_api_dashboard" {
  dashboard_name = "RecreationSitesAndTrailsBC-PublicAPI-${var.app_env}"

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
          markdown = "# Recreation Sites & Trails BC - Public API Dashboard (${var.app_env})\nMonitor request volume, error rates, and latency for Public API operations.\n_All metrics are shown in 5-minute intervals._"
        }
      },

      {
        type   = "alarm"
        x      = 0
        y      = 2
        width  = 24
        height = 6
        properties = {
          title = "🔔 Alarm Status - Public API"
          alarms = concat(
            [for key, alarm in aws_cloudwatch_metric_alarm.latency_alarms : alarm.arn if startswith(key, "public-")],
            [for key, alarm in aws_cloudwatch_metric_alarm.server_error_rate_alarm : alarm.arn if startswith(key, "public-")],
            [for key, alarm in aws_cloudwatch_metric_alarm.client_error_rate_alarm : alarm.arn if startswith(key, "public-")]
          )
        }
      },

      # Request Count
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 24
        height = 6
        properties = {
          title   = "📊 [Traffic] Public API Request Volume by Operation (5 min)"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "RequestCount", "Operation", op_config.operation]
            if op_config.api_type == "public"
          ]
        }
      },

      # Section Header for Errors
      {
        type   = "text"
        x      = 0
        y      = 14
        width  = 24
        height = 2
        properties = {
          markdown = "## ⚠️ Error Metrics - Public API\nClient (4xx) and Server (5xx) errors for Public API operations."
        }
      },

      # Client & Server Errors side by side
      {
        type   = "metric"
        x      = 0
        y      = 16
        width  = 12
        height = 6
        properties = {
          title   = "⚠️ Client Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ClientError"]
            if op_config.api_type == "public"
          ]
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
        y      = 16
        width  = 12
        height = 6
        properties = {
          title   = "🚨 Server Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ServerError"]
            if op_config.api_type == "public"
          ]
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
        y      = 22
        width  = 24
        height = 2
        properties = {
          markdown = "## ⏱️ Request Latency Metrics - Public API\nTracking 95th and 99th percentile latency for Public API operations."
        }
      },

      # Latency TM99 and TM95 side by side
      {
        type   = "metric"
        x      = 0
        y      = 24
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM99 (99th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = [
            for op_config in local.all_operations :
            [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm99" }]
            if op_config.api_type == "public"
          ]
          annotations = {
            horizontal = [
              for op in local.api_configs.public.operations : {
                value = local.api_configs.public.latency_thresholds[op]
                label = "${op} Threshold (${local.api_configs.public.latency_thresholds[op]}ms)"
                color = "#FF9900"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 24
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM95 (95th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = [
            for op_config in local.all_operations :
            [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm95" }]
            if op_config.api_type == "public"
          ]
          annotations = {
            horizontal = [
              for op in local.api_configs.public.operations : {
                value = local.api_configs.public.latency_thresholds[op]
                label = "${op} Threshold (${local.api_configs.public.latency_thresholds[op]}ms)"
                color = "#FF9900"
              }
            ]
          }
        }
      }
    ]
  })
}

# Admin API Dashboard
resource "aws_cloudwatch_dashboard" "admin_api_dashboard" {
  dashboard_name = "RecreationSitesAndTrailsBC-AdminAPI-${var.app_env}"

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
          markdown = "# Recreation Sites & Trails BC - Admin API Dashboard (${var.app_env})\nMonitor request volume, error rates, and latency for Admin API operations.\n_All metrics are shown in 5-minute intervals._"
        }
      },

      {
        type   = "alarm"
        x      = 0
        y      = 2
        width  = 24
        height = 6
        properties = {
          title = "🔔 Alarm Status - Admin API"
          alarms = concat(
            [for key, alarm in aws_cloudwatch_metric_alarm.latency_alarms : alarm.arn if startswith(key, "admin-")],
            [for key, alarm in aws_cloudwatch_metric_alarm.server_error_rate_alarm : alarm.arn if startswith(key, "admin-")],
            [for key, alarm in aws_cloudwatch_metric_alarm.client_error_rate_alarm : alarm.arn if startswith(key, "admin-")]
          )
        }
      },

      # Request Count
      {
        type   = "metric"
        x      = 0
        y      = 8
        width  = 24
        height = 6
        properties = {
          title   = "📊 [Traffic] Admin API Request Volume by Operation (5 min)"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "RequestCount", "Operation", op_config.operation]
            if op_config.api_type == "admin"
          ]
        }
      },

      # Section Header for Errors
      {
        type   = "text"
        x      = 0
        y      = 14
        width  = 24
        height = 2
        properties = {
          markdown = "## ⚠️ Error Metrics - Admin API\nClient (4xx) and Server (5xx) errors for Admin API operations."
        }
      },

      # Client & Server Errors side by side
      {
        type   = "metric"
        x      = 0
        y      = 16
        width  = 12
        height = 6
        properties = {
          title   = "⚠️ Client Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ClientError"]
            if op_config.api_type == "admin"
          ]
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
        y      = 16
        width  = 12
        height = 6
        properties = {
          title   = "🚨 Server Errors by Operation"
          region  = local.region
          stat    = "Sum"
          period  = local.period
          view    = "timeSeries"
          stacked = false
          metrics = [
            for op_config in local.all_operations : 
            [op_config.namespace, "ErrorCount", "Operation", op_config.operation, "ErrorType", "ServerError"]
            if op_config.api_type == "admin"
          ]
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
        y      = 22
        width  = 24
        height = 2
        properties = {
          markdown = "## ⏱️ Request Latency Metrics - Admin API\nTracking 95th and 99th percentile latency for Admin API operations."
        }
      },

      # Latency TM99 and TM95 side by side
      {
        type   = "metric"
        x      = 0
        y      = 24
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM99 (99th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = [
            for op_config in local.all_operations :
            [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm99" }]
            if op_config.api_type == "admin"
          ]
          annotations = {
            horizontal = [
              for op in local.api_configs.admin.operations : {
                value = local.api_configs.admin.latency_thresholds[op]
                label = "${op} Threshold (${local.api_configs.admin.latency_thresholds[op]}ms)"
                color = "#FF9900"
              }
            ]
          }
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 24
        width  = 12
        height = 6
        properties = {
          title   = "⏱️ Latency TM95 (95th Percentile, ms)"
          region  = local.region
          period  = local.period
          view    = "timeSeries"
          yAxis   = { left = { label = "ms" } }
          metrics = [
            for op_config in local.all_operations :
            [op_config.namespace, "RequestLatency", "Operation", op_config.operation, "Method", "GET", { stat = "tm95" }]
            if op_config.api_type == "admin"
          ]
          annotations = {
            horizontal = [
              for op in local.api_configs.admin.operations : {
                value = local.api_configs.admin.latency_thresholds[op]
                label = "${op} Threshold (${local.api_configs.admin.latency_thresholds[op]}ms)"
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

# Latency alarms for all operations across both APIs
resource "aws_cloudwatch_metric_alarm" "latency_alarms" {
  for_each = {
    for op_config in local.all_operations : 
    "${op_config.api_type}-${op_config.operation}" => op_config
  }

  alarm_name          = "[${var.app_env}] High-Latency-Alarm-${each.value.api_type}-${each.value.operation}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  datapoints_to_alarm = 2
  metric_name         = "RequestLatency"
  namespace           = each.value.namespace
  period              = local.alarm_period
  statistic           = "Average"
  threshold           = each.value.threshold
  alarm_description   = "Latency for ${each.value.operation} (${each.value.api_type} API) exceeds ${each.value.threshold}ms in 2/${local.evaluation_periods} periods"
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    Operation = each.value.operation
    Method    = "GET"
  }

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms - ${var.app_env}"
  })
}

# Alarm for Server Errors (5xx) across all operations
resource "aws_cloudwatch_metric_alarm" "server_error_rate_alarm" {
  for_each = {
    for op_config in local.all_operations : 
    "${op_config.api_type}-${op_config.operation}" => op_config
  }

  alarm_name          = "[${var.app_env}] High-Server-Error-Rate-Alarm-${each.value.api_type}-${each.value.operation}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  metric_name         = "ErrorCount"
  namespace           = each.value.namespace
  period              = local.alarm_period
  statistic           = "Sum"
  threshold           = local.server_error_threshold
  alarm_description   = "High server error rate (5xx) detected for operation ${each.value.operation} (${each.value.api_type} API)."
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ErrorType = "ServerError"
    Operation = each.value.operation
  }

  tags = merge(local.common_resource_tags, {
    Name = "API Monitoring Alarms - ${var.app_env}"
  })
}

# Alarm for Client Errors (4xx) across all operations
resource "aws_cloudwatch_metric_alarm" "client_error_rate_alarm" {
  for_each = {
    for op_config in local.all_operations : 
    "${op_config.api_type}-${op_config.operation}" => op_config
  }

  alarm_name          = "[${var.app_env}] High-Client-Error-Rate-Alarm-${each.value.api_type}-${each.value.operation}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = local.evaluation_periods
  metric_name         = "ErrorCount"
  namespace           = each.value.namespace
  period              = local.alarm_period
  statistic           = "Sum"
  threshold           = local.client_error_threshold
  alarm_description   = "High client error rate (4xx) detected for operation ${each.value.operation} (${each.value.api_type} API)."
  alarm_actions       = [aws_sns_topic.alarm_topic.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    ErrorType = "ClientError"
    Operation = each.value.operation
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
