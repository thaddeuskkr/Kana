FROM alpine

# Installs latest Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

...

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v13.5.0 works with Chromium 100.
RUN yarn add puppeteer@13.5.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S kana && adduser -S -G kana kana \
    && mkdir -p /home/kana/Downloads /app \
    && chown -R kana:kana /home/kana \
    && chown -R kana:kana /app

# Run everything after as non-privileged user.
USER kana

WORKDIR /kana

COPY . .

RUN yarn

CMD ["yarn", "node", "."]