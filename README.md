# bazy-danych-projekt

Project for Data Bases course at AGH University.

Authors: Michal Koscianek, Michal Maka  
Topic: car rental system

## Technologies

- Backend: TypeScript, Node.js, Express
- Frontend: React, Vite, TypeScript
- Database: PostgreSQL
- Containers: Docker Compose

## How To Setup The Project

### 1. Clone repository

```bash
git clone <repository-url>
cd bazy-danych-projekt
```

If you already have the repository locally, just open the project folder.

### 2. Run backend and database

Backend and PostgreSQL are started from the `server` directory.

```bash
cd server
npm install
docker compose up -d --build
```

This starts:

- PostgreSQL container: `wypozyczalnia-db`
- Backend container: `wypozyczalnia-api`

Backend API will be available at:

```text
http://localhost:3000
```

Database connection from your computer:

```text
Host: localhost
Port: 5433
Database: rental_db
User: root
Password: mysecretpassword
```

Database connection inside Docker:

```text
Host: postgres-db
Port: 5432
Database: rental_db
User: root
Password: mysecretpassword
```

### 3. Run frontend

Open a second terminal in the project root and run:

```bash
cd client
npm install
npm run dev
```

Vite will print the frontend URL in the terminal, usually:

```text
http://localhost:5173
```

### 4. Useful commands

Stop backend and database:

```bash
cd server
docker compose down
```

Restart backend and database:

```bash
cd server
docker compose restart
```

Check backend logs:

```bash
cd server
docker compose logs -f backend
```

Run backend TypeScript build check:

```bash
cd server
npm run build
```

Run frontend production build:

```bash
cd client
npm run build
```

## Project Structure

```text
bazy-danych-projekt/
  client/   React frontend
  server/   Express backend, Docker Compose and PostgreSQL schema
```

Important database files:

```text
server/db/schema.sql
server/db/views.sql
server/db/migrations/
```
