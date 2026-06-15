# PostgreSQL Setup with Docker

This project uses PostgreSQL as the production database with Docker Desktop for local development.

## Prerequisites

- Docker Desktop installed and running
- Maven for the backend
- Node.js for the frontend (if running separately)

## Quick Start

### 1. Start PostgreSQL with Docker

From the project root directory:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 container
- Use credentials from `.env` file (create from `.env.example` if needed)
- Persist data in a Docker volume
- Expose PostgreSQL on port 5432

### 2. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

You can customize the credentials in `.env` if needed.

### 3. Run the Backend with PostgreSQL Profile

From the `backend` directory:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Or set the environment variable:

```powershell
# Windows PowerShell
$env:SPRING_PROFILES_ACTIVE="postgres"; mvn spring-boot:run

# Windows CMD
set SPRING_PROFILES_ACTIVE=postgres && mvn spring-boot:run
```

### 4. Verify Connection

The application will connect to PostgreSQL and create/update tables automatically based on your JPA entities.

## Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Connect to PostgreSQL CLI
docker exec -it xeno-postgres psql -U xenouser -d xenodb
```

## Profiles

| Profile | Database | Description |
|---------|----------|-------------|
| `dev` | H2 (in-memory) | Default profile, good for quick development |
| `postgres` | PostgreSQL | Production-like setup with Docker |
| `test` | H2 | For running tests |

## Database Credentials (Default)

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | 5432 |
| Database | xenodb |
| Username | xenouser |
| Password | xenopass |

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, change the port in `.env`:

```
POSTGRES_PORT=5433
```

### Container Won't Start

Check Docker Desktop is running, then:

```bash
docker-compose logs postgres
```

### Connection Refused

Ensure the PostgreSQL container is healthy:

```bash
docker ps
```

You should see `xeno-postgres` with status "Up".

### Reset Database

To completely reset the database (delete all data):

```bash
docker-compose down -v
docker-compose up -d
```

## Schema Management

The application uses `spring.jpa.hibernate.ddl-auto=update` which:
- Creates tables if they don't exist
- Updates schema when entities change
- **Note:** Doesn't handle column deletions or rename operations automatically

For production, consider using Flyway or Liquibase for schema migrations.