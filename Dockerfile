FROM node:current-alpine

# https://docs.docker.com/language/nodejs/containerize/

# https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production
ENV NODE_ENV production

WORKDIR /app

# Mount package.json and package-lock.json
# Mount /root/.npm as a cache, install dependencies, and build the app
# The mounts are scoped to this RUN command
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \


# Run as a non-root user
USER node

# Copy source code
COPY . .

# Build
RUN --mount=type=bind,source=package.json,target=package.json \
    npm run build

EXPOSE 3000

CMD ["node", "server/index.js"]
