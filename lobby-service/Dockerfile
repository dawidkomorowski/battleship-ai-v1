# Stage 1: Build
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o lobby-service .

# Stage 2: Run
FROM alpine:3.21
WORKDIR /app
COPY --from=builder /app/lobby-service .
EXPOSE 8081
CMD ["./lobby-service"]
