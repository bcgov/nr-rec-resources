locals {
    ec2_instance_profile_name_prefix = "ec2_i_pg"
}

variable "ec2_instance_ami" {
  description = "Instance image forEC2"
  type        = string
  default     = "ami-046d18c147c36bef1"
}

variable "ec2_instance_type" {
  description = "Instance type to use for the instance"
  type        = string
  default     = "t2.micro"
}

resource "aws_instance" "ec2_instance" {
  ami                     = "${var.ec2_instance_ami}"
  instance_type           = "${var.ec2_instance_type}"
  subnet_id = data.aws_subnet.a_app.id
  vpc_security_group_ids = ["${aws_security_group.custom_app_sg.id}"]

  depends_on = [aws_security_group.custom_app_sg]

  iam_instance_profile = "${aws_iam_instance_profile.ec2_instance_profile.id}"

  root_block_device {
    # At default, this is not set.
    encrypted = true
  }

  metadata_options {
    # Enable IMDSv2 (Instance Metadata Service Version 2)
    http_tokens = "required"
  }

  # Detail AWS monitoring enabled for security.
  monitoring = true

  tags = {
      Name = "ec2_host_${var.target_env}"
      managed-by = "terraform"
  }

  # Script to install postgresql.
  user_data = <<EOF
  #!/bin/bash
  echo "Installing postgresql.x86_64 and libpq" > init.log
  sudo yum update -y >> init.log 2>&1
  sudo yum install -y postgresql.x86_64 >> init.log 2>&1
  sudo yum install -y postgresql-libs >> init.log 2>&1
  echo "Postgres and libpq installation done" >> init.log
  EOF

}

resource "aws_ec2_instance_state" "ec2_instance_state" {
  instance_id = aws_instance.ec2_instance.id
  state       = "stopped"
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "${local.ec2_instance_profile_name_prefix}_instance_profile_${var.target_env}"
  role = "EC2-Default-SSM-AD-Role" # default role given by ASEA platform, can't change.
}
