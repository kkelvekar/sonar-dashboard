# Stage 1: Build the Angular application
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx ng build

# Stage 2: Serve the app with Nginx
FROM nginx:1-alpine-slim

# Remove default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist/sonarqube-dashboard/browser /usr/share/nginx/html

# Create a non-root user and group with specific UID and GID
RUN addgroup -S -g 1000 appgroup && adduser -S -u 1000 -G appgroup appuser

# Create necessary directories and adjust permissions
RUN mkdir -p /var/cache/nginx/client_temp /var/run /var/log/nginx \
    && chown -R appuser:appgroup /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx

# Switch to the non-root user
USER appuser

# Expose port 80
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
