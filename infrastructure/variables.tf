variable "do_token" {
	type = string
	sensitive = true
}

variable "region" {
	type = string
	default = "fra1"

}

variable "my_ip" {
	type = list(string)
	description = "Allowed ips fro ssh connection"
}