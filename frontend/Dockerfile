# Build Stage
FROM node:22-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

ARG VITE_MFU_AUTH_URL
ARG VITE_CLIENT_ID
ARG VITE_REDIRECT_URI
ARG VITE_SCOPE

ENV VITE_MFU_AUTH_URL=$VITE_MFU_AUTH_URL
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI
ENV VITE_SCOPE=$VITE_SCOPE

COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
