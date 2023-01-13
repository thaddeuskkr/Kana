# Use latest node image
FROM node:latest
# Set working directory
WORKDIR /usr/kana
# Copy required files
COPY . . 
# Install dependencies
RUN npm install -g yarn
RUN yarn
# Run Kana
CMD ["yarn", "node", "."]