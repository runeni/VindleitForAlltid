# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
# Place the config as a template; the nginx entrypoint runs envsubst on it at startup.
# The entrypoint.sh script below maps the Aspire env var to API_URL first.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.d/00-set-api-url.sh
RUN chmod +x /docker-entrypoint.d/00-set-api-url.sh
EXPOSE 80
