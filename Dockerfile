# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Install Alpine build tools
RUN apk add --no-cache bash python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Angular project files
COPY angular.json ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.spec.json ./
COPY src ./src

# Build production Angular app
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built app from the build stage
COPY --from=build /app/dist/schedule/browser/. /usr/share/nginx/html/

# Copy custom nginx config if needed
 #COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
