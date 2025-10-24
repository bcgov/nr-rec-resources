resource "aws_lambda_function" "my_lambda" {
  function_name = var.lambda_function_name
  s3_bucket     = var.s3_bucket
  s3_key        = var.s3_key
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role          = aws_iam_role.lambda_exec_role.arn
  timeout       = 30
  memory_size   = 128

  tracing_config {
    mode = "Active"
  }

  environment {
    variables = {
      NODE_ENV = "production"
    }
  }
}
