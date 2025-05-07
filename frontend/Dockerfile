# build
FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY . /app/

RUN npm install

RUN sed -i "s|__API_URL__|${API_URL}|g" src/environments/environment.prod.ts
RUN sed -i "s|__MERCURE_URL__|${MERCURE_URL}|g" src/environments/environment.prod.ts
RUN sed -i "s|__BANK_URL__|${BANK_URL}|g" src/environments/environment.prod.ts

RUN npm run build -- --configuration=production --project=frontend

# web server
FROM nginx:stable-alpine
COPY --from=builder /app/dist/frontend/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
