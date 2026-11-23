# Rick and Morty API

GraphQL API to search Rick and Morty characters. Results are cached in Redis. Character data is stored in MySQL with Sequelize and loaded from the public Rick and Morty API.

## Features

- Search characters by status, species, gender, name, and origin
- Redis cache for search results
- Database created and filled automatically the first time the server starts
- Request logging middleware
- Cron job that refreshes character data every 12 hours
- Manual refresh: `POST /cronjob/run`

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL 8 and Redis, or Docker

## Run with Docker

```bash
docker compose up --build
```

The API listens on `http://localhost:8080`.

- GraphQL: `http://localhost:8080/graphql`
- Health: `http://localhost:8080/health`
- Refresh data: `POST http://localhost:8080/cronjob/run`

## Run locally

1. Start MySQL and Redis (the Compose file can start only those two services).
2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and adjust it if your database credentials differ:

```bash
cp .env.example .env
```

4. Start the server:

```bash
npm start
```

Local default: `http://localhost:4000/graphql`.

On startup the server creates the `characters` table when it does not exist and imports characters when the table is empty.

## Example query

```graphql
query {
  characters(status: "Alive", species: "Human", name: "Rick") {
    id
    name
    status
    species
    gender
    origin
  }
}
```

`origin` is a string (the origin name), for example `Earth (C-137)`.

You can import `Postman.json` to try the same requests.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `DB_NAME` | `admin` | MySQL database |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | `admin` | MySQL password |
| `DB_HOST` | `127.0.0.1` | MySQL host (`db` inside Compose) |
| `DB_PORT` | `3306` | MySQL port |
| `DB_DIALECT` | `mysql` | Sequelize dialect |
| `REDIS_URL` | | Redis connection string. Used when set |
| `REDIS_HOST` | `127.0.0.1` | Redis host when `REDIS_URL` is empty |
| `REDIS_PORT` | `6379` | Redis port |
| `PORT` | `4000` | HTTP port (`8080` in Docker) |
| `CACHE_EXPIRATION` | `3600` | Cache TTL in seconds |

## License

MIT
