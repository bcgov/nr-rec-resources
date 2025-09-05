# Build
FROM node:22-slim AS build

WORKDIR /app

# Copy root package.json and package-lock.json first (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files only (for caching)
COPY shared/package.json shared/
COPY admin/frontend/package.json admin/frontend/

# Copy all source files
COPY . .

# Install all dependencies at root (npm workspace install)
RUN npm install

# Build your frontend (runs in admin/frontend folder)
WORKDIR /app/admin/frontend
RUN npm run deploy

# Deploy using Caddy to host static files
FROM caddy:2.10.2-alpine
RUN apk add --no-cache ca-certificates

COPY --from=build /app/admin/frontend/dist /srv
COPY admin/frontend/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

EXPOSE 3001 3002
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

USER 1001
