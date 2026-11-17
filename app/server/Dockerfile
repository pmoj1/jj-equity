FROM node:24-slim AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json
RUN npm ci --workspace server --include-workspace-root=false --ignore-scripts
COPY server/tsconfig.json server/
COPY server/src/ server/src/
RUN npm run build --workspace server

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json
RUN npm ci --workspace server --include-workspace-root=false --omit=dev --ignore-scripts && mkdir -p /app/data && chown node:node /app/data
COPY --from=build --chown=node:node /workspace/server/dist/ ./server/dist/
USER node
EXPOSE 4000
CMD ["node", "server/dist/index.js"]
