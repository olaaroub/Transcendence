#!/bin/sh

set -e

echo "[Init] Waiting for Vault to start..."
until vault status -address=http://vault:8200 > /dev/null 2>&1; do
  sleep 1
done

echo "[Init] Vault is up."

export VAULT_ADDR=http://vault:8200

echo "[Init] Writing secret to 'secret/transcendence'..."
vault kv put secret/transcendence JWT_SECRET="$JWT_SECRET_VALUE"

echo "[Init] Secret injected successfully. Exiting..."