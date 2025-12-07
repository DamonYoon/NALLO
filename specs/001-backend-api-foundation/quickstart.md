# Quickstart Guide: Backend API Foundation

**Feature**: Backend API Foundation  
**Date**: 2025-12-07

## Prerequisites

- Node.js 18 or higher
- TypeScript 5.0 or higher
- PostgreSQL 14 or higher
- Neo4j 5.x or higher
- Docker and Docker Compose (optional, for local development)

## Setup Steps

### 1. Clone Repository and Navigate to Backend

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

**Expected dependencies** (from research.md):
- express>=4.18.0 or fastify>=4.24.0
- typescript>=5.0.0
- @types/node>=20.0.0
- neo4j-driver>=5.14.0
- typeorm>=0.3.17 or @prisma/client>=5.7.0
- pg>=8.11.0
- zod>=3.22.0 or class-validator>=0.14.0
- jsonwebtoken>=9.0.0
- @types/jsonwebtoken>=9.0.0
- multer>=1.4.5
- @types/multer>=1.4.7
- dotenv>=16.3.0
- bcryptjs>=2.4.3
- @types/bcryptjs>=2.4.2
- jest>=29.7.0 or vitest>=1.0.0
- @types/jest>=29.5.0
- ts-jest>=29.1.0 or @vitest/coverage-v8
- swagger-ui-express>=5.0.0 or @fastify/swagger>=8.12.0

### 3. Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Database Configuration
GRAPHDB_URI=bolt://localhost:7687
GRAPHDB_USER=neo4j
GRAPHDB_PASSWORD=your_password

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nallo
POSTGRES_USER=nallo_user
POSTGRES_PASSWORD=your_password

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Application Configuration
API_V1_PREFIX=/api/v1
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 4. Setup Databases

#### PostgreSQL Setup

```bash
# Create database
createdb nallo

# Run migrations (when TypeORM/Prisma is configured)
npm run migration:run
# or for Prisma
npx prisma migrate dev
```

#### Neo4j Setup

```bash
# Start Neo4j (using Docker)
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:5.14

# Or use Neo4j Desktop
# Download from https://neo4j.com/download/
```

### 5. Initialize Database Schema

#### GraphDB Schema

Connect to Neo4j and create indexes:

```cypher
// Create indexes for better query performance
CREATE INDEX document_id_index IF NOT EXISTS FOR (d:Document) ON (d.id);
CREATE INDEX concept_id_index IF NOT EXISTS FOR (c:Concept) ON (c.id);
CREATE INDEX version_id_index IF NOT EXISTS FOR (v:Version) ON (v.id);
CREATE INDEX page_id_index IF NOT EXISTS FOR (p:Page) ON (p.id);
```

#### PostgreSQL Schema

Run initial migration or create tables manually:

```sql
-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID UNIQUE NOT NULL,
    content TEXT NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_document_id ON documents(document_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'end_user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 6. Build TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build

# Or use ts-node for development (no build step)
npm run dev
```

### 7. Run Application

```bash
# Development server with auto-reload (using ts-node-dev or nodemon)
npm run dev

# Production server
npm start
```

### 8. Verify Installation

#### Check Health Endpoint

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "graphdb": {
    "status": "connected"
  },
  "postgresql": {
    "status": "connected"
  }
}
```

#### Access API Documentation

- Swagger UI: http://localhost:3000/api-docs (if using swagger-ui-express)
- Or check OpenAPI spec: http://localhost:3000/api/v1/openapi.json

## Running Tests

### Run All Tests

```bash
npm test
# or
npm run test
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Contract tests only
npm run test:contract

# Acceptance tests only
npm run test:acceptance
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Write Tests First (TDD)

```bash
# Write failing test
npm test -- tests/unit/yourFeature.test.ts

# Implement feature
# Run tests until passing
npm test -- tests/unit/yourFeature.test.ts
```

### 3. Run Linting and Formatting

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type checking
npm run type-check
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

## Common Tasks

### Create Test User

```typescript
// In TypeScript file or script
import { AuthService } from './src/services/authService';
import { getDb } from './src/db/postgres/connection';

const authService = new AuthService();
const user = await authService.createUser({
  email: 'admin@example.com',
  password: 'secure_password',
  role: 'administrator'
});
```

### Create Sample Document

```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started",
    "type": "general",
    "content": "# Getting Started\n\nWelcome to NALLO!",
    "lang": "en"
  }'
```

### Create Sample Concept

```bash
curl -X POST http://localhost:3000/api/v1/concepts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "API Key",
    "description": "A unique identifier used to authenticate API requests",
    "lang": "en",
    "category": "api"
  }'
```

## Troubleshooting

### Database Connection Issues

**Problem**: Health check shows database as disconnected

**Solutions**:
1. Verify database is running:
   ```bash
   # PostgreSQL
   pg_isready -h localhost -p 5432
   
   # Neo4j
   curl http://localhost:7474
   ```

2. Check connection strings in `.env` file
3. Verify credentials are correct
4. Check firewall/network settings

### TypeScript Compilation Errors

**Problem**: TypeScript compilation fails

**Solutions**:
1. Check `tsconfig.json` configuration
2. Ensure all dependencies are installed: `npm install`
3. Verify Node.js version: `node --version` should show 18+
4. Clear build cache: `rm -rf dist/` and rebuild

### Test Failures

**Problem**: Tests fail with database connection errors

**Solutions**:
1. Ensure test databases are configured
2. Check test environment variables
3. Use test fixtures for database setup/teardown
4. Verify test data isolation

### Module Resolution Issues

**Problem**: `Cannot find module` errors

**Solutions**:
1. Check `tsconfig.json` paths configuration
2. Verify `package.json` dependencies
3. Run `npm install` to ensure all dependencies are installed
4. Check import paths are correct (use relative paths or configured path aliases)

## Next Steps

1. Review [data-model.md](./data-model.md) for entity definitions
2. Review [contracts/openapi.yaml](./contracts/openapi.yaml) for API specifications
3. Review [plan.md](./plan.md) for implementation details
4. Wait for `/speckit.tasks` to generate task list

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [Fastify Documentation](https://www.fastify.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Neo4j JavaScript Driver](https://neo4j.com/docs/javascript-manual/current/)
- [TypeORM Documentation](https://typeorm.io/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
