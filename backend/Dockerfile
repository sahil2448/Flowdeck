# Use official Node.js 18 Alpine as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose default port (MATCH your service's PORT env, e.g. 10000)
EXPOSE 10000

# Start app: run migrations, then start server
CMD npx prisma migrate deploy && npm start

RUN ls -R prisma/
