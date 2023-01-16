# Building the builder image
FROM node:latest AS builder
WORKDIR /builder

# Copy configuration files and source
COPY . .

# Install dependencies, build
RUN yarn || (cat /tmp/*/build.log; exit 1)

# Use Yarn plugin-production-install - to copy only production dependencies
RUN yarn prod-install /deploy/dependencies

# Build the runner image
FROM node:latest AS runner
WORKDIR /kana

# Copy files in logical layer order
COPY --from=builder /deploy/dependencies .

CMD ["yarn", "start"]