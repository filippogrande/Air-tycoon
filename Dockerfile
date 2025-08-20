FROM node:20-alpine

WORKDIR /usr/src/app

# Install minimal runtime deps (postgres client used to wait for DB)
RUN apk add --no-cache git bash postgresql-client

# Copy package files first to install deps
COPY package.json package-lock.json* ./

# Install all dependencies (dev too) so nodemon and tools are available in dev image
RUN npm ci || npm install

# Copy the rest of the project
COPY . .

# Ensure entrypoint is executable
RUN chmod +x /usr/src/app/docker-entrypoint.sh || true

ENV NODE_ENV=development
EXPOSE 3001

ENTRYPOINT ["sh", "/usr/src/app/docker-entrypoint.sh"]
