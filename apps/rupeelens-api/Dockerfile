# syntax=docker/dockerfile:1
# Build context = repo root.
FROM node:20-alpine AS build
ENV NX_DAEMON=false NX_NO_CLOUD=true
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm nx build rupeelens-api --configuration=production --skip-nx-cache

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
# Nx generates a package.json holding only the API's runtime dependencies.
COPY --from=build /repo/dist/apps/rupeelens-api ./
RUN npm install --omit=dev --no-audit --no-fund
USER node
EXPOSE 8080
CMD ["node", "main.js"]
