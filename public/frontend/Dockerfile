# Build
FROM node:24-slim AS build

# Build arguments for deployment environment
ARG VITE_DEPLOYMENT_ENV
ARG FONT_AWESOME_PRO_TOKEN


# Set environment variables for build
ENV VITE_DEPLOYMENT_ENV=${VITE_DEPLOYMENT_ENV}
ENV FONT_AWESOME_PRO_TOKEN=$FONT_AWESOME_PRO_TOKEN

WORKDIR /app

# Copy root package.json and package-lock.json (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files for cache
COPY shared/package.json shared/
COPY public/frontend/package.json public/frontend/

# Copy full source code before install to leverage caching and workspace linking
COPY shared/ shared/
COPY public/frontend/ public/frontend/

RUN --mount=type=secret,id=font_awesome_pro_token \
    ls /run/secrets/ && \
    cat /run/secrets/font_awesome_pro_token | wc -c

# Install all dependencies at root (npm workspace install)
RUN --mount=type=secret,id=font_awesome_pro_token \
    npm install --@fortawesome:registry=https://npm.fontawesome.com/ --//npm.fontawesome.com/:_authToken=$(cat /run/secrets/font_awesome_pro_token)

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
