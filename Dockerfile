FROM node:22-slim AS build

WORKDIR /app

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV SPEC_COMPASS_SCAN_PATH=/workspace-source

COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --omit=dev

COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/package.json /workspace-source/package.json
COPY --from=build /app/package-lock.json /workspace-source/package-lock.json
COPY --from=build /app/tsconfig.json /workspace-source/tsconfig.json
COPY --from=build /app/Dockerfile /workspace-source/Dockerfile
COPY --from=build /app/README.md /workspace-source/README.md
COPY --from=build /app/apps/api/package.json /workspace-source/apps/api/package.json
COPY --from=build /app/apps/api/src /workspace-source/apps/api/src
COPY --from=build /app/apps/web/package.json /workspace-source/apps/web/package.json
COPY --from=build /app/apps/web/src /workspace-source/apps/web/src
COPY --from=build /app/packages/shared/package.json /workspace-source/packages/shared/package.json
COPY --from=build /app/packages/shared/src /workspace-source/packages/shared/src
COPY --from=build /app/docs /workspace-source/docs

EXPOSE 8080
CMD ["npm", "run", "start", "-w", "@spec-compass/api"]
