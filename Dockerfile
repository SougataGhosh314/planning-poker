# Stage 1: Build the React Client
FROM node:18-alpine as client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Build for production
RUN npm run build

# Stage 2: Setup the Node Server
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy server code
COPY server/ ./

# Copy built client assets from Stage 1 to server's public folder (or a specific build folder)
# We'll assume the server is configured to serve static files from ../client/dist or similar
# Let's adjust the server structure in the container
COPY --from=client-build /app/client/dist ./public

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
