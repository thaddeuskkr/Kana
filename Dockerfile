# Use latest node image
FROM node:latest
# Set working directory
WORKDIR /usr/kana
# Copy required files
COPY . . 
# Install dependencies
RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN yarn
# Run Kana
CMD ["yarn", "node", "."]