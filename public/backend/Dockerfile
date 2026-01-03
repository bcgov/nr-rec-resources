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

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

# Install all dependencies at root (npm workspace install)
RUN npm install

# Build the backend (runs in public/backend folder)
WORKDIR /app/public/backend
RUN npm run build

# Ensure .prisma directory exists in the correct location
WORKDIR /app
RUN mkdir -p public/backend/node_modules/.prisma || true

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

ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x

# Install production dependencies at root (npm workspace install)
RUN npm install --ignore-scripts --no-update-notifier --omit=dev

# Deploy using minimal Distroless image
FROM gcr.io/distroless/nodejs22-debian12:nonroot
ENV NODE_ENV=production

# Copy app and dependencies
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/public/backend/dist ./dist

# Boilerplate, not used in OpenShift/Kubernetes
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/api

# Nonroot user, limit heap size to 300 MB since we have 512 MB limit
USER nonroot
CMD ["--max-old-space-size=300", "/app/dist/public/backend/src/main"]
