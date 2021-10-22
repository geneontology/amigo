variable "tags" {
  type = map
  default = { Name = "test-amigo-obolibrary" }
}

variable "region" {
  default = "us-east-1"
}

variable eip_alloc_id {
  default = "eipalloc-0742e7b09b4cb38f0"
}

variable "instance_type" {
  default = "t2.large" 
}

variable "public_key_path" {
  default = "~/.ssh/id_rsa.pub"
}

variable "private_key_path" {
  default = "~/.ssh/id_rsa"
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
