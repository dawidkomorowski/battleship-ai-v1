# Architecture Decision Record

This document tracks important architectural and design decisions made during development of the Battleship Game application.

---

## ADR-001 — Frontend build tooling: Vite

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
The web client is a React/TypeScript single-page application that must be compiled into static assets for containerised serving.

**Decision:**  
Use Vite as the build tool.

**Rationale:**  
Vite provides fast builds, first-class React and TypeScript support, and produces optimised static assets suitable for serving from any static file server.

---

## ADR-002 — Multi-stage Docker build for web-client

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
The web client requires Node.js at build time but not at runtime.

**Decision:**  
Use a two-stage Dockerfile:
1. **Build stage** — Node 22 Alpine installs dependencies and compiles the TypeScript/React app into static assets.
2. **Serve stage** — nginx 1.27 Alpine serves the compiled static assets.

**Rationale:**  
The final image contains no Node.js or build tooling, keeping it small and free of unnecessary attack surface.

---

## ADR-003 — nginx as the static asset server

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
Compiled frontend assets must be served over HTTP.

**Decision:**  
Use nginx inside the web-client container to serve static files. nginx also acts as a reverse proxy, forwarding `/api/<service>/` requests to the corresponding backend service containers.

**Rationale:**  
nginx is lightweight, battle-tested for static file serving, and the Alpine-based image keeps the container footprint minimal. Co-locating the reverse proxy in the frontend container means the browser always communicates with a single origin, avoiding cross-origin issues in development.

---

## ADR-004 — Port mapping convention

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
Multiple services run in Docker Compose and must be reachable from the host.

**Decision:**  
Services use conventional internal ports (80 for HTTP/nginx, 8080 for Go services). Only the host-side mapping is configured in `docker-compose.yml`.

**Rationale:**  
Keeping internal ports conventional and predictable simplifies service-to-service communication inside the Docker network. Changing the host-accessible port requires editing only one place.

---

## ADR-005 — Monorepo layout: one directory per service

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
The application is composed of multiple services (frontend, identity, gameplay, chat, etc.).

**Decision:**  
All services live in a single repository, each in its own top-level directory (e.g. `web-client/`, `identity-service/`, future `gameplay-service/`, `chat-service/`). The root `docker-compose.yml` is the single entry point for building and running the full stack locally.

**Rationale:**  
A monorepo simplifies cross-service coordination, shared tooling, and atomic commits that span multiple services.

---

## ADR-006 — nginx reverse proxy for backend API routing

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
The React frontend runs in the user's browser and must communicate with backend Go services. In a Docker Compose environment, backend services are only reachable via the Docker internal network; they are not necessarily exposed on host ports.

**Decision:**  
The nginx instance serving the web client also acts as a reverse proxy. Each backend service is mapped under a path prefix:

| Path prefix          | Upstream service             |
|----------------------|------------------------------|
| `/api/identity/`     | `identity-service:8080`      |

**Rationale:**  
Routing all API traffic through the frontend's nginx keeps the browser on a single origin and avoids CORS configuration. Adding a new service requires only a new `location` block in `nginx.conf` and a new entry in `docker-compose.yml`.

---

## ADR-007 — Go standard library HTTP server for backend services

**Date:** 2026-03-22  
**Status:** Accepted

**Context:**  
Backend services need an HTTP server. Go has a capable standard library `net/http` package.

**Decision:**  
Use the Go standard library `net/http` package as the HTTP server for all backend services, with no external web framework dependency.

**Rationale:**  
For the current scope, the standard library is sufficient. It avoids third-party dependency risk, keeps Docker image build times short, and is idiomatic Go. A framework can be introduced later if routing complexity justifies it.

---

## ADR-008 — Third-party UUID generation: github.com/google/uuid

**Date:** 2026-03-25  
**Status:** Accepted

**Context:**  
Backend services (identity-service, chat-service) needed to generate RFC 4122 version-4 UUIDs. An initial implementation used `crypto/rand` directly with manual byte manipulation inside each service.

**Decision:**  
Replace the hand-rolled `generateUUID()` functions with `github.com/google/uuid` (`uuid.NewString()`). Each service that generates UUIDs adds `require github.com/google/uuid v1.6.0` to its `go.mod`.

**Rationale:**  
The custom implementation, while functionally correct, duplicated non-trivial bit-manipulation logic across services and was not tested. `github.com/google/uuid` is a widely-used, well-tested library maintained by Google with no transitive dependencies, making the maintenance cost negligible while eliminating the risk of subtle formatting bugs in the hand-rolled code.

