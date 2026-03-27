# Battleship Game

A multiplayer online Battleship game built with a React frontend and Go backend services, fully containerized with Docker.

## Repository Structure

```
battleship-ai-v1/
├── .devcontainer/
│   └── devcontainer.json     # Dev container: Go 1.24, Node 22, Docker-outside-of-Docker
├── docker-compose.yml        # Builds and runs all services
├── app-build-and-run.ps1     # Build and start all services (detached)
├── app-stop.ps1              # Stop and remove all containers
├── ADR.md                    # Architecture Decision Records
├── web-client/               # Web frontend for the application (served via nginx on port 3000)
├── identity-service/         # Go service (port 8080) — user creation and authentication
├── lobby-service/            # Go service (port 8081) — lobby user list with auto-eviction
└── chat-service/             # Go service (port 8082) — chat conversations and messages
```

## How to Use

The only tools required on your machine are a code editor, Git, and Docker.

### PowerShell scripts (recommended)

| Script | Description |
|---|---|
| `.\app-build-and-run.ps1` | Build all services and start them in the background. Re-running this while the stack is already up rebuilds changed images and restarts only the affected containers. |
| `.\app-stop.ps1` | Stop and remove all containers. |

### Manual Docker Compose commands

**Build and start all services:**
```bash
docker compose up --build --detach
```

**Force a clean rebuild (discards cached layers):**
```bash
docker compose up --build --force-recreate --detach
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
| Lobby service    | http://localhost:3000/api/lobby/status    |
| Chat service     | http://localhost:3000/api/chat/status    |

---

## Architectural Decisions

Key design decisions are tracked in [ADR.md](ADR.md).
