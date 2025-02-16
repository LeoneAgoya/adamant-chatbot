# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the entire backend code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose API port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
