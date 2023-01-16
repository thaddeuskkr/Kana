# Building the builder image
FROM node:latest AS builder
WORKDIR /builder

# Copy configuration files and source
COPY . .

# Install dependencies, build
RUN apt install chromium-browser
RUN yarn || (cat /tmp/*/build.log; exit 1)

# Use Yarn plugin-production-install - to copy only production dependencies
RUN yarn prod-install /deploy/dependencies

# Build the runner image
FROM node:slim AS runner
WORKDIR /kana

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install curl gnupg -y \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=arm64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install google-chrome-stable -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy files in logical layer order
COPY --from=builder /deploy/dependencies .

CMD ["yarn", "start:docker"]