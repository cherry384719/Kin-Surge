FROM node:22-alpine AS web-build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html ./
COPY postcss.config.js tailwind.config.js vite.config.ts eslint.config.js ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM golang:1.24-alpine AS api-build
WORKDIR /app/server
RUN apk add --no-cache build-base

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server ./
RUN CGO_ENABLED=1 GOOS=linux go build -o /tmp/kin-surge ./cmd/api

FROM alpine:3.21
WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY --from=web-build /app/dist ./dist
COPY --from=api-build /tmp/kin-surge ./kin-surge
COPY supabase ./supabase

ENV KIN_APP_ENV=production
ENV KIN_PORT=8080
ENV KIN_DB_PATH=/data/kinsurge.db
ENV KIN_DIST_DIR=/app/dist
ENV GIN_MODE=release
EXPOSE 8080

VOLUME ["/data"]

CMD ["./kin-surge"]
