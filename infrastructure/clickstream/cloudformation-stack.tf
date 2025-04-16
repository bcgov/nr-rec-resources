resource "aws_s3_bucket" "clickstream_templates" {
  bucket = "rst-clickstream-templates-bucket-${var.app_env}"
}

resource "aws_s3_object" "clickstream_template" {
  bucket       = aws_s3_bucket.clickstream_templates.id
  key          = "clickstream.template.json"
  source       = "${path.module}/clickstream.template.json"
  etag         = filemd5("${path.module}/clickstream.template.json")
  content_type = "application/json"
}

resource "aws_cloudformation_stack" "clickstream" {
  name         = "clickstream-stack"
  template_url = "https://${aws_s3_bucket.clickstream_templates.bucket}.s3.amazonaws.com/${aws_s3_object.clickstream_template.key}"

  parameters = {
    Email = "marcel@button.is"
  }

  capabilities = ["CAPABILITY_NAMED_IAM"]

  depends_on = [
    aws_s3_object.clickstream_template,
    aws_s3_bucket.clickstream_templates
  ]
}
