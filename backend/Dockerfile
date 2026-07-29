# backend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start backend application
CMD ["npm", "start"]
