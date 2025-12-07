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

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials

4. Run database migrations (when available):
```bash
npm run migration:run
```

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

