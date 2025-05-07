# build
FROM node:22.14.0-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration production

# web server
FROM nginx:stable-alpine
COPY --from=builder /app/dist/zap /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
