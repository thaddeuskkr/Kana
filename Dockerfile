FROM node:latest
WORKDIR /kana
COPY package.json /kana
COPY yarn.lock /kana
RUN yarn install
COPY . /kana
CMD ["yarn", "start"]