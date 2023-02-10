variable "tags" {
  type = map
  default = { Name = "test-amigo" }
}

variable "instance_type" {
  default = "t2.large"
}

variable "disk_size" {
  default = 200
}

variable "public_key_path" {
  default = "/tmp/go-ssh.pub"
}

provider "aws" {
  region = "us-east-1"
  shared_credentials_files = [ "/tmp/go-aws-credentials" ]
  profile = "default"
}

variable "open_ports" {
  type = list
  default = [22, 80]
}

// custom ubuntu jammy ami with docker, docker-compose, aws, python, pip installed
variable "ami" {
  default = "ami-019eb5c97ad39d701"
}

module "base" {
  source = "git::https://github.com/geneontology/devops-aws-go-instance.git?ref=V2.0"
  instance_type = var.instance_type
  ami = var.ami
  public_key_path = var.public_key_path
  tags = var.tags
  open_ports = var.open_ports
  disk_size = var.disk_size
}

output "public_ip" {
   value                  = module.base.public_ip
}
