# TradeSphere Environment Setup Guide

This guide will help you set up all the necessary environment variables to run the TradeSphere project successfully.

## Prerequisites

Before setting up environment variables, ensure you have:
- PostgreSQL database running
- Redis server running
- Google Cloud Console project (for OAuth)

## Environment Files Setup

### 1. Root Project Environment
Copy the main environment template:
```bash
cp .env.example .env
```

### 2. Frontend Environment
```bash
cd local_exchange_frontend
cp env.example .env.local
```

### 3. API Server Environment
```bash
cd local_exchange_server/api
cp env.example .env
```

### 4. Engine Environment
```bash
cd local_exchange_server/engine
cp env.example .env
```

### 5. WebSocket Server Environment
```bash
cd local_exchange_server/ws
cp env.example .env
```

## Configuration Details

### Database Setup

#### PostgreSQL
1. Install PostgreSQL if not already installed
2. Create a database named `my_database`
3. Create a user with appropriate permissions
4. Update the database credentials in your `.env` files

#### Redis
1. Install Redis if not already installed
2. Start Redis server on default port 6379
3. If using password authentication, update `REDIS_PASSWORD` in `.env` files

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3002/api/auth/callback/google`
7. Copy Client ID and Client Secret to your frontend `.env.local` file

### NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:
```bash
# Option 1: Use online generator
# Visit: https://generate-secret.vercel.app/32

# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 3: Use OpenSSL
openssl rand -hex 32
```

## Port Configuration

The project uses the following default ports:
- **Frontend**: 3002
- **API Server**: 3000
- **WebSocket Server**: 8080
- **PostgreSQL**: 5432
- **Redis**: 6379

Make sure these ports are available or update the configuration accordingly.

## Running the Project

After setting up all environment variables:

1. **Start Redis Server**:
   ```bash
   redis-server
   ```

2. **Start PostgreSQL** (if not running as service)

3. **Start the Engine**:
   ```bash
   cd local_exchange_server/engine
   npm start
   ```

4. **Start the API Server**:
   ```bash
   cd local_exchange_server/api
   npm start
   ```

5. **Start the WebSocket Server**:
   ```bash
   cd local_exchange_server/ws
   npm start
   ```

6. **Start the Frontend**:
   ```bash
   cd local_exchange_frontend
   npm run dev
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env` files
   - Ensure database exists

2. **Redis Connection Error**:
   - Verify Redis server is running
   - Check Redis host/port configuration

3. **Google OAuth Error**:
   - Verify Google Client ID and Secret
   - Check authorized redirect URIs in Google Console
   - Ensure `NEXTAUTH_SECRET` is set

4. **Port Already in Use**:
   - Check if ports are available
   - Update port configuration in respective `.env` files

### Environment Variable Validation

You can verify your environment setup by checking:
- All `.env` files exist in their respective directories
- No placeholder values (like `your_password_here`) remain
- Database and Redis connections work
- Google OAuth credentials are valid

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for database connections
- Keep Google OAuth credentials secure
- Regularly rotate secrets in production environments
