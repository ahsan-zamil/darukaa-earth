FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# Set default mapbox token for build if provided in build arg
ARG VITE_MAPBOX_TOKEN
ARG VITE_API_BASE_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
