# Battleship Game

A multiplayer online Battleship game built with a React frontend and Go backend services, fully containerized with Docker.

## Repository Structure

```
battleship-ai-v1/
├── docker-compose.yml   # Top-level compose file to build and run all services
└── web-client/          # React/TypeScript frontend application
```

## How to Use

The only tools required on your machine are a code editor, Git, and Docker.

**Build and start all services:**
```bash
docker compose up --build
```

**Force a clean rebuild (discards cached layers):**
```bash
docker compose up --build --force-recreate
```

**Stop all services:**
```bash
docker compose down
```

### Accessing the application

| Service    | URL                    |
|------------|------------------------|
| Web client | http://localhost:3000  |

---

## Key Design Decisions

### Frontend build tooling — Vite
Vite is used as the build tool for the web client. It provides fast builds, first-class React and TypeScript support, and produces optimised static assets suitable for serving from any static file server.

### Multi-stage Docker build for web-client
The web client Dockerfile uses a two-stage build:
1. **Build stage** — Node 22 Alpine installs dependencies and compiles the TypeScript/React app into static assets.
2. **Serve stage** — nginx 1.27 Alpine serves the compiled static assets.

The final image contains no Node.js or build tooling, keeping it small and free of unnecessary attack surface.

### nginx as the static asset server
The compiled frontend is served by nginx inside the container. nginx is lightweight, battle-tested for static file serving, and the Alpine-based image keeps the container footprint minimal.

### Port mapping convention
nginx listens on port 80 inside each frontend container, mapped to a distinct host port in `docker-compose.yml` (currently `3000`). As new services are added, their internal ports remain conventional (e.g. 80 for HTTP, 8080 for Go services) and only the host-side mapping changes in one place.

### Monorepo layout — one directory per service
All parts of the application live in a single repository, each in its own top-level directory (e.g. `web-client/`, future `gameplay-service/`, `chat-service/`). The root `docker-compose.yml` is the single entry point for building and running the full stack locally.
