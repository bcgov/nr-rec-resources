# Build
FROM node:22-slim AS build

# Copy, build static files; see .dockerignore for exclusions
WORKDIR /app
COPY . ./

# Change to frontend directory and run build
WORKDIR /app/public/frontend
RUN npm install
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
