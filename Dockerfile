FROM node:lts-alpine as builder

# Set working directory for all build stages
WORKDIR /app

# Install build dependencies and PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy package.json files for both apps
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy backend source
WORKDIR /app
COPY backend ./backend/

# Copy frontend source
COPY frontend ./frontend/

# Copy debug API file
COPY debug-api.js ./frontend/src/api/api.js

# Build frontend
WORKDIR /app/frontend
RUN printf 'REACT_APP_API_URL=http://localhost:5002/api\n' > .env.production.local
RUN npm run build

# Build backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Install supervisor
RUN apk add --no-cache supervisor postgresql-client

# Final image
FROM node:lts-alpine

# Install PostgreSQL client and supervisor
RUN apk add --no-cache supervisor postgresql-client

# Copy built frontend and backend
WORKDIR /app
COPY --from=builder /app/frontend/build /app/frontend/build
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/frontend/package.json /app/frontend/

# Set up supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create startup script
COPY start-app.sh /app/
RUN chmod +x /app/start-app.sh

# Expose ports
EXPOSE 5002 3000

# Launch app via supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 