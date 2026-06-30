#!/bin/sh
set -e

cat > /srv/config.js << EOF
window.__CONFIG__ = {
  keycloakUrl: "${VITE_KEYCLOAK_AUTH_SERVER_URL}",
  keycloakRealm: "${VITE_KEYCLOAK_REALM}",
  keycloakClientId: "${VITE_KEYCLOAK_CLIENT_ID}"
};
EOF

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
