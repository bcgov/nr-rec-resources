data "terraform_remote_state" "frontend" {
  backend = "s3"
  config = {
    bucket         = var.frontend_remote_state.bucket
    key            = var.frontend_remote_state.key
    region         = var.frontend_remote_state.region
    dynamodb_table = var.frontend_remote_state.dynamodb_table
    encrypt        = true
  }
}

resource "aws_apigatewayv2_vpc_link" "app" {
  name               = var.app_name
  subnet_ids         = data.aws_subnets.web.ids
  security_group_ids = [data.aws_security_group.web.id]
}

resource "aws_apigatewayv2_api" "app" {
  name          = var.app_name
  protocol_type = "HTTP"

  dynamic "cors_configuration" {
    for_each = var.enable_cors ? [1] : []

    content {
      allow_origins     = local.cors_allowed_origins
      allow_methods     = var.cors_allowed_methods
      allow_headers     = local.cors_headers
      allow_credentials = var.cors_allow_credentials
      max_age           = 3600
    }
  }
}

resource "aws_apigatewayv2_integration" "app" {
  api_id             = aws_apigatewayv2_api.app.id
  integration_type   = "HTTP_PROXY"
  connection_id      = aws_apigatewayv2_vpc_link.app.id
  connection_type    = "VPC_LINK"
  integration_method = "ANY"
  integration_uri    = aws_alb_listener.internal.arn
}

resource "aws_apigatewayv2_route" "app" {
  api_id    = aws_apigatewayv2_api.app.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.app.id}"
}

resource "aws_apigatewayv2_stage" "app" {
  api_id      = aws_apigatewayv2_api.app.id
  name        = "$default"
  auto_deploy = true
}
