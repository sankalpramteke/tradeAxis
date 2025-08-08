# TradeSphere Setup Guide

## Project Overview
TradeSphere is a high-speed real-time cryptocurrency trading platform with the following components:

### Architecture Components:
1. **Frontend** (`local_exchange_frontend/`) - Next.js React application
2. **API Server** (`local_exchange_server/api/`) - Express.js REST API
3. **Engine** (`local_exchange_server/engine/`) - Trading engine with order matching
4. **WebSocket Server** (`local_exchange_server/ws/`) - Real-time data streaming
5. **Database Processor** (`local_exchange_server/db/`) - Database operations handler

## Prerequisites Required:

### 1. Database Setup
- **PostgreSQL** (with TimescaleDB extension)
- **Redis** server

### 2. Environment Variables Setup
The project requires multiple `.env` files. Based on the `.env.example` files:

#### Frontend (.env.local):
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/exchangeUserDb
```

#### API Server (.env):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tradesphere_db
DB_USER=postgres
DB_PASSWORD=Post
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
```

#### Engine (.env):
```
WITH_SNAPSHOT=true
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
```

#### WebSocket Server (.env):
```
PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
```

## Current Issues Identified:

### 1. Missing Environment Files
- No `.env` files are present, only `.env.example` files
- Need to create actual environment files with proper values

### 2. Database Dependencies
- Requires PostgreSQL with TimescaleDB extension
- Requires Redis server
- Database initialization scripts need to be run

### 3. External Dependencies
- Google OAuth setup required for authentication
- NextAuth secret generation needed

### 4. Port Conflicts
- Multiple services running on different ports need coordination

## Setup Steps:

### 1. Start Infrastructure Services
```bash
# Start PostgreSQL and Redis (using Docker)
cd TradeSphere_c/local_exchange_server/docker
docker-compose up -d
```

### 2. Create Environment Files
Copy and configure all `.env.example` files to `.env` with actual values

### 3. Initialize Database
```bash
cd TradeSphere_c/local_exchange_server/db
npm run start  # This will initialize the database schema
```

### 4. Start Services in Order
```bash
# 1. Start Engine
cd TradeSphere_c/local_exchange_server/engine
npm start

# 2. Start API Server
cd TradeSphere_c/local_exchange_server/api
npm start

# 3. Start WebSocket Server
cd TradeSphere_c/local_exchange_server/ws
npm start

# 4. Start Database Processor
cd TradeSphere_c/local_exchange_server/db
npm start

# 5. Start Frontend
cd TradeSphere_c/local_exchange_frontend
npm run dev
```

## Expected Errors Without Proper Setup:
1. Database connection errors
2. Redis connection errors
3. Missing environment variable errors
4. Authentication setup errors
5. Port binding conflicts