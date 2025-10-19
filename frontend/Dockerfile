# Use Node.js (Alpine is lightweight)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run in dev mode
CMD ["npm", "run", "dev", "--", "--host"]
