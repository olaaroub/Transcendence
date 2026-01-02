#!/bin/sh
set -e

MAX_RETRIES=30
SLEEP_SECONDS=1
ATTEMPT_NUM=1

echo "[Init] Waiting for Vault to start at ${VAULT_ADDR}..."

until vault status -address=${VAULT_ADDR} > /dev/null 2>&1; do
  if [ $ATTEMPT_NUM -ge $MAX_RETRIES ]; then
    echo "[Init] Error: Timeout waiting for Vault after ${MAX_RETRIES} attempts."
    exit 1
  fi

  echo "[Init] Attempt $ATTEMPT_NUM/$MAX_RETRIES: Vault not ready yet..."
  sleep $SLEEP_SECONDS
  ATTEMPT_NUM=$((ATTEMPT_NUM + 1))
done

echo "[Init] Vault is up."

export VAULT_ADDR=${VAULT_ADDR}

echo "[Init] Writing secrets..."

vault kv put secret/auth-service \
      jwt_secret="$JWT_SECRET_VALUE" \
      cookie_secret="$COOKIE_SECRET" \
      google_client_id="$GOOGLE_CLIENT_ID" \
      google_client_secret="$GOOGLE_CLIENT_SECRET" \
      github_client_id="$GITHUB_CLIENT_ID" \
      github_client_secret="$GITHUB_CLIENT_SECRET" \
      intra_client_id="$INTRA_CLIENT_ID" \
      intra_client_secret="$INTRA_CLIENT_SECRET"

vault kv put secret/user-service \
    jwt_secret="$JWT_SECRET_VALUE" \

vault kv put secret/global-chat \
    jwt_secret="$JWT_SECRET_VALUE" \

vault kv put secret/private-chat \
    jwt_secret="$JWT_SECRET_VALUE" \



echo "[Init] Writing Access Policies..."

echo '
path "secret/data/auth-service" {
  capabilities = ["read"]
}
' > /tmp/policy-auth.hcl
vault policy write auth-policy /tmp/policy-auth.hcl


echo '
path "secret/data/user-service" {
  capabilities = ["read"]
}
' > /tmp/policy-user-service.hcl
vault policy write user-service-policy /tmp/policy-user-service.hcl



echo '
path "secret/data/global-chat" {
  capabilities = ["read"]
}
' > /tmp/policy-global-chat.hcl
vault policy write global-chat-policy /tmp/policy-global-chat.hcl



echo '
path "secret/data/private-chat" {
  capabilities = ["read"]
}
' > /tmp/policy-private-chat.hcl
vault policy write private-chat-policy /tmp/policy-private-chat.hcl


echo '
path "secret/data/pong-game" {
  capabilities = ["read"]
}
' > /tmp/policy-pong-game.hcl
vault policy write pong-game-policy /tmp/policy-pong-game.hcl



echo "[Init] Issuing Service Tokens..."

vault token revoke "$AUTH_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$AUTH_SERVICE_TOKEN" \
    -policy="auth-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null


vault token revoke "$USER_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$USER_SERVICE_TOKEN" \
    -policy="user-service-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null


vault token revoke "$GLOBAL_CHAT_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$GLOBAL_CHAT_SERVICE_TOKEN" \
    -policy="global-chat-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null


vault token revoke "$PRIVATE_CHAT_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$PRIVATE_CHAT_SERVICE_TOKEN" \
    -policy="private-chat-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null


vault token revoke "$PONG_SERVICE_TOKEN" 2>/dev/null || true
vault token create \
    -id="$PONG_SERVICE_TOKEN" \
    -policy="pong-game-policy" \
    -ttl="720h" \
    -no-default-policy > /dev/null



echo "[Init] Initialization complete. Exiting..."