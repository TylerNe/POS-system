# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root package.json first
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy backend package.json
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install

# Copy all source code
COPY . .

# Build frontend
RUN npm run build:frontend

# Build backend
RUN cd backend && npm run build

# Set production environment
ENV NODE_ENV=production

# Expose port (Railway uses PORT env var)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
