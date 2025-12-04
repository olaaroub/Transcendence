#!/bin/sh
set -e

echo "[Init] Waiting for Vault to start..."
until vault status -address=${VAULT_ADDR} > /dev/null 2>&1; do
  sleep 1
done

echo "[Init] Vault is up."

export VAULT_ADDR=${VAULT_ADDR}

echo "[Init] Writing Auth secrets..."
vault kv put secret/auth-service \
      jwt_secret="$JWT_SECRET_VALUE" \
      cookie_secret="$COOKIE_SECRET" \
      google_client_id="$GOOGLE_CLIENT_ID" \
      google_client_secret="$GOOGLE_CLIENT_SECRET" \
      github_client_id="$GITHUB_CLIENT_ID" \
      github_client_secret="$GITHUB_CLIENT_SECRET" \
      intra_client_id="$INTRA_CLIENT_ID" \
      intra_client_secret="$INTRA_CLIENT_SECRET"


# vault kv put secret/backend \
#     db_password="$DB_PASSWORD" \
#     admin_api_key="$ADMIN_API_KEY"



echo "[Init] Writing Access Policies..."

echo '
path "secret/data/auth-service" {
  capabilities = ["read"]
}
' > /tmp/policy-auth.hcl

vault policy write auth-policy /tmp/policy-auth.hcl


# echo '
# path "secret/data/backend" {
#   capabilities = ["read"]
# }
# ' > /tmp/policy-backend.hcl
# vault policy write backend-policy /tmp/policy-backend.hcl



echo "[Init] Issuing Service Tokens..."

vault token revoke "$AUTH_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$AUTH_SERVICE_TOKEN" \
    -policy="auth-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null

echo "[Init] Auth Service Token created."




# vault token revoke "$BACKEND_SERVICE_TOKEN" 2>/dev/null || true
# vault token create \
#     -id="$BACKEND_SERVICE_TOKEN" \
#     -policy="backend-policy" \
#     -ttl="720h" \
#     -no-default-policy > /dev/null





echo "[Init] Initialization complete. Exiting..."