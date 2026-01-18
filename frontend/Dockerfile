# /frontend/Dockerfile
# Stage 1: Build the Vue app
FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Development mode with hot reload
FROM node:22-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Serve with Nginx (production)
FROM nginx:latest AS production

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf.dpkg-dist 2>/dev/null || true

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]