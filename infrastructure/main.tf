terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.75.0"
    }
  }
}

provider "digitalocean" {
	token = var.do_token
}

resource "digitalocean_vpc" "olaaroub_vpc" {
	name = "olaaroub-network"
	region = var.region
	ip_range = "10.10.10.0/24"
}

resource "digitalocean_firewall" "olaaroub_firewall" {
	name = "olaaroub-firewall"
	tags = ["transcendence"]
	inbound_rule {
	  protocol = "tcp"
	  port_range = "22"
	  source_addresses = var.my_ip
	}
	outbound_rule {
	  protocol = "tcp"
	  port_range = "1-65535"
	  destination_addresses = ["0.0.0.0/0", "::/0"]
	}
	outbound_rule {
	  protocol = "udp"
	  port_range = "1-65535"
	  destination_addresses = ["0.0.0.0/0", "::/0"]
	}
	outbound_rule {
	  protocol = "icmp"
	  port_range = "1-65535"
	  destination_addresses = ["0.0.0.0/0", "::/0"]
	}
}

data "digitalocean_ssh_keys" "all_keys" {
  sort {
    key       = "name"
    direction = "asc"
  }
}

resource "digitalocean_droplet" "provisioned-droplet" {
	name = "provisioned-droplet"
	image = "ubuntu-24-04-x64"
	region = var.region
	size = "s-1vcpu-2gb"
	monitoring = true
	vpc_uuid = digitalocean_vpc.olaaroub_vpc.id
	tags = ["transcendence"]
	ssh_keys = data.digitalocean_ssh_keys.all_keys.ssh_keys[*].id
}