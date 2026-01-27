#!/bin/bash

# A script that installs docker and its components to a Minimal Ubuntu 24.04 vm

if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo or switch to root."
    exit 1
fi

rm -f /etc/apt/sources.list.d/docker.list

echo "Updating package lists..."
apt-get update

echo "Installing prerequisites..."
apt-get install -y ca-certificates curl gnupg lsb-release git make

echo "Adding Docker's official GPG key..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Updating package lists again..."
apt-get update

echo "Installing Docker Engine, CLI, containerd, and Docker Compose plugin..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Verifying installation..."
docker --version
docker compose version

if [ -n "$1" ]; then
    TARGET_USER="$1"
    echo "Adding user $TARGET_USER to the docker group..."
    usermod -aG docker "$TARGET_USER"
    echo "User $TARGET_USER added to docker group. Please log out and back in for this to take effect."
fi

echo "Docker and Docker Compose installation completed successfully!"


# sysctl vm.max_map_count

# sudo sysctl -w vm.max_map_count=262144