# Build
FROM node:24-slim AS build

WORKDIR /app

ARG VITE_DEPLOYMENT_ENV
ARG VITE_KEYCLOAK_AUTH_SERVER_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_STAFF_ADMIN_URL

ENV VITE_DEPLOYMENT_ENV=$VITE_DEPLOYMENT_ENV
ENV VITE_KEYCLOAK_AUTH_SERVER_URL=$VITE_KEYCLOAK_AUTH_SERVER_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_STAFF_ADMIN_URL=$VITE_STAFF_ADMIN_URL

# Copy root package.json and package-lock.json first (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files only (for caching)
COPY shared/package.json shared/
COPY admin/frontend/package.json admin/frontend/

# Copy all source files
COPY . .

RUN --mount=type=secret,id=font_awesome_pro_token \
    ls /run/secrets/ && \
    cat /run/secrets/font_awesome_pro_token | wc -c

# Install all dependencies at root (npm workspace install)
RUN --mount=type=secret,id=font_awesome_pro_token \
    npm install --@fortawesome:registry=https://npm.fontawesome.com/ --//npm.fontawesome.com/:_authToken=$(cat /run/secrets/font_awesome_pro_token)

# Build your frontend (runs in admin/frontend folder)
WORKDIR /app/admin/frontend
RUN npm run deploy

# Deploy using Caddy to host static files
FROM caddy:2.10.2-alpine
RUN apk add --no-cache ca-certificates

COPY --from=build /app/admin/frontend/dist /srv
COPY admin/frontend/Caddyfile /etc/caddy/Caddyfile
COPY admin/frontend/entrypoint.sh /entrypoint.sh
RUN caddy fmt /etc/caddy/Caddyfile && chmod +x /entrypoint.sh

EXPOSE 3001 3002
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

ENTRYPOINT ["/entrypoint.sh"]
