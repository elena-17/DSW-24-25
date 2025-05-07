# build
FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

ARG API_URL=http://backend:8000
COPY . .
RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts
RUN sed -i "s|__API_URL__|${MERCURE_URL}|g" src/environments/environment.prod.ts
RUN sed -i "s|__API_URL__|${BANK_URL}|g" src/environments/environment.prod.ts

RUN npm run build -- --configuration=production --project=frontend

# web server
FROM nginx:stable-alpine
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
