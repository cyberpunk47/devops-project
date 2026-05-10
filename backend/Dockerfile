FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /tasks-api .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=builder /tasks-api /tasks-api
EXPOSE 8000
CMD ["/tasks-api"]