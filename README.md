# Battleship Game

A multiplayer online Battleship game built with a React frontend and Go backend services, fully containerized with Docker.

## Repository Structure

```
battleship-ai-v1/
├── docker-compose.yml    # Top-level compose file to build and run all services
├── ADR.md                # Architecture Decision Record
├── web-client/           # React/TypeScript frontend application
└── identity-service/     # Go service — user identity and session tracking
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

| Service          | URL                             |
|------------------|---------------------------------|
| Web client       | http://localhost:3000           |
| Identity service | http://localhost:3000/api/identity/status |

---

## Architectural Decisions

Key design decisions are tracked in [ADR.md](ADR.md).
