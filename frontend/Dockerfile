# build
FROM node:22.14.0-alpine AS builder
WORKDIR /app
COPY . /app/

RUN npm install

RUN npm run build -- --configuration=production --project=frontend

# web server
FROM nginx:stable-alpine
COPY --from=builder /app/dist/frontend/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/env.template.js /tmp/env.template.js

ARG API_URL=http://localhost:8000
ARG MERCURE_URL=http://localhost:3000
ARG BANK_URL=http://localhost:8080


# Sustituye valores en runtime
RUN sed -e "s|\"__API_URL__\"|\"${API_URL}\"|" \
        -e "s|\"__MERCURE_URL__\"|\"${MERCURE_URL}\"|" \
        -e "s|\"__BANK_URL__\"|\"${BANK_URL}\"|" \
    /tmp/env.template.js > /usr/share/nginx/html/env.js

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
