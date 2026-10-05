# syntax = docker/dockerfile:1

# A placeholder, and yours to replace: it serves one page, plus README.md
# verbatim at /readme/, which is enough to prove the deploy path end to end.
# Whatever your app is built with, the image that replaces this one must serve
# HTTP on 0.0.0.0:$PORT (fly.toml sets PORT) and publish README.md at /readme/
# (spec/README.md says what's checked).

FROM docker.io/library/node:24.21.0-bookworm-slim AS build
WORKDIR /app
RUN npm install -g pnpm@11.9.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY scripts/configure-hooks.mjs scripts/configure-hooks.mjs
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM docker.io/library/node:24.21.0-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data PORT=8080 NODE_OPTIONS=--max-old-space-size=128
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/package.json /app/README.md ./
EXPOSE 8080
CMD ["node", "server/index.ts"]
