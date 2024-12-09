resource "aws_security_group" "custom_web_sg" {
    name = "custom_web_sg_${var.target_env}"
    description = "security group for application tier"
    vpc_id = data.aws_vpc.selected.id
    revoke_rules_on_delete = true

    tags = {
        Name = "custom_web_sg_${var.target_env}"
        managed-by = "terraform"
    }

}


resource "aws_vpc_security_group_egress_rule" "custom_web_sg_outbound" {
  security_group_id = aws_security_group.custom_web_sg.id
  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"
  description = "Allow All Outbound Traffic"
}

resource "aws_vpc_security_group_egress_rule" "custom_web_sg_inbound_defult" {
  security_group_id = aws_security_group.custom_web_sg.id
  referenced_security_group_id = data.aws_security_group.app.id
  from_port = 80
  to_port = 3000
  ip_protocol = "TCP"
  description = "Allow traffic to app from web tier."
}




resource "aws_vpc_security_group_egress_rule" "custom_web_sg_inbound_3000" {
  security_group_id = aws_security_group.custom_web_sg.id
  referenced_security_group_id = data.aws_security_group.app.id
  from_port = 3000
  to_port = 3000
  ip_protocol = "TCP"
  description = "Allow traffic to app from web tier."
}
