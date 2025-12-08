# NALLO Backend API

Backend API foundation for NALLO document management system.

## Prerequisites

- Node.js 18 or higher
- TypeScript 5.0 or higher
- PostgreSQL 14 or higher
- Neo4j 5.x or higher

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
# Create .env file in backend/ directory with the following variables:
# - Database Configuration (PostgreSQL, Neo4j)
# - JWT Configuration
# - Application Configuration
# See DB_SETUP.md for detailed instructions
```

3. Setup databases:
```bash
# Option 1: Using Docker Compose (recommended)
docker-compose up -d
./scripts/init-databases.sh

# Option 2: Manual setup
# See DB_SETUP.md for detailed instructions
```

4. Verify database connections:
```bash
npm run dev
# In another terminal:
curl http://localhost:3000/health
```

5. Run database migrations (when available):
```bash
npm run migration:run
```

**📖 자세한 데이터베이스 설정 방법은 [DB_SETUP.md](./DB_SETUP.md)를 참조하세요.**

## Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:contract
npm run test:acceptance
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## API Documentation

Once the server is running, access API documentation at:
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI spec: http://localhost:3000/api/v1/openapi.json

## Project Structure

See [plan.md](../specs/001-backend-api-foundation/plan.md) for detailed project structure.

## License

MIT

