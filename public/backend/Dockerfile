# Build
FROM node:24.11.1-slim AS build

WORKDIR /app

# Copy root package.json and package-lock.json first (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files only (for caching)
COPY shared/package.json shared/
COPY public/backend/package.json public/backend/

# Copy all source files
COPY . .

RUN --mount=type=secret,id=font_awesome_pro_token \
    ls /run/secrets/ && \
    cat /run/secrets/font_awesome_pro_token | wc -c

# Install all dependencies at root (npm workspace install)
RUN --mount=type=secret,id=font_awesome_pro_token \
    npm install --@fortawesome:registry=https://npm.fontawesome.com/ --//npm.fontawesome.com/:_authToken=$(cat /run/secrets/font_awesome_pro_token)

# Build the backend (runs in public/backend folder)
WORKDIR /app/public/backend
RUN npm run build

# Dependencies
FROM node:24.11.1-slim AS dependencies

WORKDIR /app

# Copy root package.json and package-lock.json first (workspace root)
COPY package.json package-lock.json ./

# Copy workspace package.json files only (for caching)
COPY shared/package.json shared/
COPY public/backend/package.json public/backend/

# Copy all source files
COPY . .

# Install all dependencies at root (npm workspace install)
RUN --mount=type=secret,id=font_awesome_pro_token \
    npm install --@fortawesome:registry=https://npm.fontawesome.com/ --//npm.fontawesome.com/:_authToken=$(cat /run/secrets/font_awesome_pro_token)

# Deploy using minimal Distroless image
FROM gcr.io/distroless/nodejs22-debian12:nonroot
ENV NODE_ENV=production

# Copy app and dependencies
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/public/backend/dist ./dist

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/api

# Nonroot user, limit heap size to 300 MB since we have 512 MB limit
USER nonroot
CMD ["--max-old-space-size=300", "/app/dist/public/backend/src/main"]
