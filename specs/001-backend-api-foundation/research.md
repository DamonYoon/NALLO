# Research: Backend API Foundation

**Feature**: Backend API Foundation  
**Date**: 2025-12-07  
**Purpose**: Resolve technical decisions for language, framework, and dependencies

## Technology Stack Decisions

### Language/Version Selection

**Decision**: TypeScript 5.0+ with Node.js 18+

**Rationale**:
- Strong type system with compile-time type checking
- Excellent ecosystem for web APIs and async operations
- Native async/await support with excellent performance
- Large community and extensive documentation
- Easy integration with future AI features (OpenAI, Anthropic APIs via npm packages)
- Unified language for backend and future frontend (if using React/Next.js)
- Excellent tooling (ESLint, Prettier, TypeScript compiler)
- Strong IDE support and developer experience

**Alternatives Considered**:
- **Python 3.11+**: Good for data processing but weaker type system, separate language from frontend
- **Go**: Excellent performance but steeper learning curve and less ecosystem for web APIs
- **Rust**: Best performance but longer development time and smaller ecosystem

### Primary Dependencies

**Decision**: 
- **Express 4.18+** or **Fastify 4.24+**: Modern async web framework with TypeScript support
- **neo4j-driver 5.14+**: Official Neo4j JavaScript/TypeScript driver with async support
- **TypeORM 0.3.17+** or **Prisma 5.7+**: ORM for PostgreSQL with TypeScript support
- **pg 8.11+**: PostgreSQL client for Node.js
- **Zod 3.22+** or **class-validator**: Runtime type validation and schema validation
- **jsonwebtoken 9.0+**: JWT token handling
- **multer**: File upload support for document import
- **swagger-ui-express** or **@fastify/swagger**: OpenAPI documentation generation

**Rationale**:
- Express/Fastify provides excellent async support and middleware ecosystem
- TypeScript provides compile-time type safety and excellent IDE support
- Zod/class-validator ensures runtime data validation at API boundaries
- Neo4j driver supports async operations with TypeScript types
- TypeORM/Prisma provides type-safe ORM with connection pooling
- Fastify offers better performance than Express, Express has larger ecosystem

**Alternatives Considered**:
- **NestJS**: Full-featured framework but more opinionated, heavier for simple API
- **Koa**: Lightweight but smaller ecosystem
- **Hono**: Very fast but newer, smaller community

### Testing Framework

**Decision**: Jest 29.7+ or Vitest 1.0+ with TypeScript support

**Rationale**:
- Industry standard for Node.js/TypeScript testing
- Excellent TypeScript support and type checking
- Built-in async/await support for testing async endpoints
- Coverage reporting (80% minimum requirement) via --coverage flag
- Excellent mocking capabilities for database connections
- Integrates well with Express/Fastify test utilities
- Vitest offers faster execution and better ESM support, Jest has larger ecosystem

**Alternatives Considered**:
- **Mocha**: Good but requires additional setup for TypeScript
- **Ava**: Fast but smaller ecosystem
- **Jasmine**: Older, less modern features

### Database Connection Strategy

**Decision**: 
- **GraphDB**: Connection pooling via neo4j driver with max_pool_size=50, connection_timeout=30s
- **PostgreSQL**: TypeORM/Prisma connection pool with pool_size=20, max_overflow=10, pool_timeout=30s
- **Retry Logic**: Exponential backoff with max_retries=3, initial_delay=1s (using p-retry or similar)

**Rationale**:
- Connection pooling reduces overhead and improves performance
- Timeout values balance responsiveness with resource usage
- Retry logic handles transient database failures gracefully
- Pool sizes based on expected concurrent request load (100+ requests)
- TypeORM/Prisma provides built-in connection pooling

**Alternatives Considered**:
- **Single connection**: Would bottleneck under load
- **Unlimited pool**: Could exhaust database resources

### Error Handling Strategy

**Decision**: Consistent JSON error format across all endpoints

**Format**:
```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with ID {id} not found",
    "details": {}
  }
}
```

**Rationale**:
- Consistent format enables easy client-side error handling
- Error codes allow programmatic error handling
- User-friendly messages per Constitution Principle III
- Details field provides additional context when needed

### Authentication Strategy

**Decision**: JWT tokens with HS256 algorithm, 24-hour expiration, refresh token support

**Rationale**:
- Stateless authentication scales well
- HS256 sufficient for initial implementation (can upgrade to RS256 later)
- 24-hour expiration balances security and user experience
- Refresh tokens enable seamless re-authentication

**Alternatives Considered**:
- **Session-based**: Requires server-side storage, less scalable
- **OAuth2**: More complex, not needed for initial implementation

### API Documentation Strategy

**Decision**: OpenAPI 3.1 specification with swagger-ui-express or @fastify/swagger, or tsoa for automatic generation

**Rationale**:
- OpenAPI 3.1 provides latest features (webhooks, improved JSON Schema support)
- Automatic generation (via tsoa or manual) ensures documentation stays in sync with code
- OpenAPI enables contract testing (Constitution Principle II)
- Interactive documentation improves developer experience
- Can be exported for API client generation

## Performance Optimization Strategies

### Database Query Optimization

**Decision**: 
- Use parameterized queries to prevent SQL injection and enable query plan caching
- Implement query result caching for frequently accessed data (concepts, versions)
- Use database indexes on frequently queried fields (document_id, concept_id, page_id)
- Batch operations where possible to reduce round trips

**Rationale**:
- Parameterized queries are required for security and performance
- Caching reduces database load for read-heavy operations
- Indexes improve query performance (required for < 500ms search target)
- Batching reduces network overhead

### GraphDB Query Optimization

**Decision**:
- Use Cypher query parameters for all queries
- Implement query result caching for navigation trees
- Use relationship traversal efficiently (avoid deep traversals)
- Limit result sets with pagination

**Rationale**:
- Parameterized Cypher queries improve performance and security
- Navigation trees are frequently accessed, caching improves response time
- Efficient traversal required for < 1s performance target (100 nodes)
- Pagination prevents large result sets from degrading performance

## Security Considerations

### Input Validation

**Decision**: Validate all inputs using Zod schemas or class-validator decorators at API boundaries

**Rationale**:
- Prevents invalid data from reaching business logic
- Type safety with TypeScript compile-time checking and runtime validation
- Automatic validation error responses improve UX
- Zod provides excellent TypeScript inference, class-validator integrates well with TypeORM

### SQL Injection Prevention

**Decision**: Use TypeORM/Prisma ORM and parameterized queries exclusively

**Rationale**:
- ORM prevents direct SQL string construction
- Parameterized queries prevent injection attacks
- Required for security compliance
- TypeORM/Prisma provides type-safe query builders

### Authentication Security

**Decision**: 
- Store JWT secret in environment variables
- Use secure password hashing (bcrypt via bcryptjs) for user credentials
- Implement rate limiting on authentication endpoints (express-rate-limit or @fastify/rate-limit)

**Rationale**:
- Environment variables prevent secret exposure in code
- Bcrypt is industry standard for password hashing
- Rate limiting prevents brute force attacks
- bcryptjs provides pure JavaScript implementation compatible with Node.js

## Deployment Considerations

### Containerization

**Decision**: Docker container with multi-stage build for production

**Rationale**:
- Consistent deployment across environments
- Multi-stage builds reduce image size
- Enables easy scaling and orchestration

### Environment Configuration

**Decision**: Use dotenv with TypeScript types or zod for configuration validation

**Rationale**:
- Type-safe configuration with TypeScript
- Environment-specific settings (dev, staging, prod)
- Easy to override for testing
- Zod can validate and parse environment variables with type inference

## Open Questions Resolved

1. **Q**: Should we use sync or async database drivers?  
   **A**: Async drivers for both GraphDB and PostgreSQL to support high concurrency

2. **Q**: How to handle database migrations?  
   **A**: TypeORM migrations or Prisma migrations for PostgreSQL, manual Cypher scripts for GraphDB schema changes

3. **Q**: Should we use an ORM for GraphDB?  
   **A**: No, use native Cypher queries for better performance and flexibility with graph operations

4. **Q**: How to structure error responses?  
   **A**: Consistent JSON format with error code, message, and optional details

## Next Steps

All technical decisions resolved. Ready to proceed to Phase 1: Design & Contracts.

