# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "api_dashboard" {
  dashboard_name = "RecreationSitesAndTrailsBC-API"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["RecreationSitesAndTrailsBCAPI", "RequestLatency", "Operation", "*", "StatusCode", "*", "Method", "*"]
          ]
          period = 300
          stat   = "Average"
          region = "ca-central-1"
          title  = "API Latency by Operation and Method"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["RecreationSitesAndTrailsBCAPI", "RequestCount", "Operation", "*", "StatusCode", "*"]
          ]
          period = 300
          stat   = "Sum"
          region = "ca-central-1"
          title  = "Request Count by Operation"
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["RecreationSitesAndTrailsBCAPI", "ErrorCount", "Operation", "*", "StatusCode", "*", "ErrorType", "*"]
          ]
          period = 300
          stat   = "Sum"
          region = "ca-central-1"
          title  = "Error Count by Type and Operation"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["RecreationSitesAndTrailsBCAPI", "RequestLatency", "Operation", "searchRecreationResources", "Method", "GET", { stat: "p95" }],
            ["...", { stat: "p99" }]
          ]
          period = 300
          region = "ca-central-1"
          title  = "Search API Latency Percentiles"
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "search_latency_alarm" {
  alarm_name          = "high-latency-search-api"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "RequestLatency"
  namespace           = "RecreationSitesAndTrailsBCAPI"
  period             = "300"
  statistic          = "p95"
  threshold          = "1000"
  alarm_description  = "High latency detected for search operation"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]

  dimensions = {
    Operation   = "searchRecreationResources"
    Method      = "GET"
    StatusCode  = "200"
  }
}

resource "aws_cloudwatch_metric_alarm" "error_rate_alarm" {
  alarm_name          = "high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "RecreationSitesAndTrailsBCAPI"
  period             = "300"
  statistic          = "Sum"
  threshold          = "5"
  alarm_description  = "High error rate detected across all operations"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]

  dimensions = {
    ErrorType   = "ServerError"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_4xx_rate" {
  alarm_name          = "high-client-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "RecreationSitesAndTrailsBCAPI"
  period             = "300"
  statistic          = "Sum"
  threshold          = "20"
  alarm_description  = "High client error rate detected"
  alarm_actions      = [aws_sns_topic.alarm_topic.arn]

  dimensions = {
    ErrorType   = "ClientError"
  }
}

# SNS Topic for Alarms
resource "aws_sns_topic" "alarm_topic" {
  name = "api-monitoring-alarms"
}

# Optional: SNS Topic subscription for email notifications
resource "aws_sns_topic_subscription" "alarm_email" {
  topic_arn = aws_sns_topic.alarm_topic.arn
  protocol  = "email"
  endpoint  = "jimmy.palelil@gov.bc.ca"
}

# IAM Role for CloudWatch
resource "aws_iam_role" "cloudwatch_role" {
  name = "api-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "cloudwatch.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for CloudWatch metrics
resource "aws_iam_role_policy" "cloudwatch_policy" {
  name = "api-cloudwatch-policy"
  role = aws_iam_role.cloudwatch_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics"
        ]
        Resource = "*"
      }
    ]
  })
}