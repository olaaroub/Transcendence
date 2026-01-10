#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo or switch to root."
    exit 1
fi

# Remove potentially incorrect previous docker list to avoid update errors
# rm -f /etc/apt/sources.list.d/docker.list

echo "Updating package lists..."
apt-get update

echo "Installing prerequisites..."
apt-get install -y ca-certificates curl gnupg lsb-release git make

# Add Docker's official GPG key
echo "Adding Docker's official GPG key..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources
echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Updating package lists again..."
apt-get update

echo "Installing Docker Engine, CLI, containerd, and Docker Compose plugin..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
echo "Verifying installation..."
docker --version
docker compose version

# Setup docker group for current user if not root (optional, requires logout/login)
# If you want to add a specific user, pass it as an argument: ./initMachine.sh <username>
if [ -n "$1" ]; then
    TARGET_USER="$1"
    echo "Adding user $TARGET_USER to the docker group..."
    usermod -aG docker "$TARGET_USER"
    echo "User $TARGET_USER added to docker group. Please log out and back in for this to take effect."
fi

echo "Docker and Docker Compose installation completed successfully!"




# check max memorymapping
# sysctl vm.max_map_count

# sudo sysctl -w vm.max_map_count=262144