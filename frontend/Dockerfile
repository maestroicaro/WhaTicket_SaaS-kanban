# ============================================
# Frontend Nginx - Pre-Built Version
# ============================================
# This Dockerfile serves pre-compiled React files
# Build is done locally to avoid VPS resource issues

FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy pre-built files from local build
COPY build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
