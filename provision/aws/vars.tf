variable "tags" {
  type = map
  default = { Name = "test-amigo-obolibrary" }
}

variable "region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t2.large" 
}

// custom ubuntu ami with docker, docker-compose, and python3 installed
variable "ami" {
  default = "ami-01e51d86b60c02297"
}

variable "disk_size" {
  default = 200
  description = "size of disk in Gigabytes"
}

variable "public_key_path" {
  default = "~/.ssh/id_rsa.pub"
}

variable "ssh_port" {
  type        = number
  default     = 22
  description = "ssh server port"
}

variable "http_port" {
  type        = number
  default     = 80
  description = "amigo server port"
}
