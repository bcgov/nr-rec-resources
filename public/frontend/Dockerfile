# Build
FROM node:22-slim AS build

# Set environment variable for build
ENV VITE_RECREATION_RESOURCE_ASSETS_BASE_URL="https://dam.lqc63d-prod.nimbus.cloud.gov.bc.ca"

WORKDIR /app

# Copy root package.json and package-lock.json (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files for cache
COPY shared/package.json shared/
COPY public/frontend/package.json public/frontend/

# Copy full source code before install to leverage caching and workspace linking
COPY shared/ shared/
COPY public/frontend/ public/frontend/

# Install all dependencies from root (npm workspace install)
RUN npm install

# Run deploy/build inside the frontend workspace
WORKDIR /app/public/frontend
RUN npm run deploy

# Deploy using Caddy to host static files
FROM caddy:2.10.2-alpine
RUN apk add --no-cache ca-certificates

COPY --from=build /app/public/frontend/dist /srv
COPY public/frontend/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt /etc/caddy/Caddyfile

EXPOSE 3000 3001
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3001/health

USER 1001
