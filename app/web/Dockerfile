FROM node:24-slim AS build
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
COPY web/package.json web/package.json
COPY server/package.json server/package.json
RUN npm ci --workspace web --include-workspace-root=false --ignore-scripts
COPY web/ web/
COPY desktop/prepare-assets.cjs desktop/build-paths.cjs desktop/
RUN node desktop/prepare-assets.cjs && npm run build --workspace web

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /workspace/web/.next/standalone/ ./
COPY --from=build --chown=node:node /workspace/web/.next/static/ ./web/.next/static/
COPY --from=build --chown=node:node /workspace/web/public/ ./web/public/
USER node
EXPOSE 3000
CMD ["node", "web/server.js"]
