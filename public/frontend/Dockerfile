# Build
FROM node:22-slim AS build

# Copy, build static files; see .dockerignore for exclusions
WORKDIR /app

COPY shared/package.json shared/package-lock.json ./shared/
WORKDIR /app/shared
RUN npm ci

WORKDIR /app
COPY public/frontend/package.json public/frontend/package-lock.json ./public/frontend/

WORKDIR /app/public/frontend
RUN npm ci

COPY shared /app/shared
COPY public/frontend /app/public/frontend
RUN npm run deploy

# Deploy using Caddy to host static files
FROM caddy:2.10.0-alpine
RUN apk add --no-cache ca-certificates

# Copy static files, verify Caddyfile formatting
COPY --from=build /app/public/frontend/dist /srv
COPY public/frontend/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

# Nonroot user
USER 1001
