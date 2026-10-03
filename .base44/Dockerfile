FROM node:22-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm 10 is required for the minimumReleaseAge setting in pnpm-workspace.yaml
RUN npm install -g pnpm@10

WORKDIR /app
