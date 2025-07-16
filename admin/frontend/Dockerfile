# Build
FROM node:22-slim AS build

# Copy, build static files; see .dockerignore for exclusions
WORKDIR /app

COPY shared/package.json shared/package-lock.json ./shared/
RUN cd shared && npm ci

COPY admin/frontend/package.json admin/frontend/package-lock.json ./admin/frontend/
WORKDIR /app/admin/frontend
RUN npm ci

COPY shared /app/shared
COPY admin/frontend /app/admin/frontend
RUN npm run deploy

# Deploy using Caddy to host static files
FROM caddy:2.10.0-alpine
RUN apk add --no-cache ca-certificates

# Copy static files, verify Caddyfile formatting
COPY --from=build /app/admin/frontend/dist /srv
COPY admin/frontend/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 3001 3002
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

# Nonroot user
USER 1001
