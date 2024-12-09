resource "aws_apigatewayv2_vpc_link" "app" {
  name               = var.app_name
  subnet_ids         = data.aws_subnets.subnets_web.ids
  security_group_ids = [data.aws_security_group.web.id]
}

resource "aws_apigatewayv2_api" "app" {
  name          = var.app_name
  protocol_type = "HTTP"
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
resource "aws_vpc_security_group_ingress_rule" "api_inbound_1" {
  security_group_id = data.aws_security_group.web.id
  referenced_security_group_id = data.aws_security_group.app.id
  from_port = 3000
  to_port = 3000
  ip_protocol = "TCP"
  description = "Allow traffic to api from web tier on 3000."
}

resource "aws_vpc_security_group_ingress_rule" "api_inbound_2" {
  security_group_id = data.aws_security_group.web.id
  referenced_security_group_id = data.aws_security_group.app.id
  from_port = 80
  to_port = 3000
  ip_protocol = "TCP"
  description = "Allow traffic to api from web tier on 80."
}
