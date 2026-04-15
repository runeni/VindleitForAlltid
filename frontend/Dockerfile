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
# Store the nginx config template outside /etc/nginx/templates/ so the built-in
# envsubst step doesn't pick it up. Our 00-set-api-url.sh script handles
# substitution itself and writes the final config to conf.d/.
COPY nginx.conf /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.d/00-set-api-url.sh
RUN chmod +x /docker-entrypoint.d/00-set-api-url.sh
EXPOSE 80
