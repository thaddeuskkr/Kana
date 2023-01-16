FROM node:latest
WORKDIR /kana
COPY . . 

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

RUN yarn || (cat /tmp/*/build.log; exit 1)

RUN apt-get update && apt-get install chromium -y --no-install-recommends

CMD ["yarn", "start"]