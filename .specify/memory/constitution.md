# NALLO Constitution

## Core Principles

### I. GraphDB-First Architecture
GraphDB (Neo4j) MUST be the primary data store for all structural relationships:
- Document, Page, Version, Concept, Tag, Attachment nodes and their relationships
- All structural queries MUST use Cypher queries through GraphDB
- RDB (PostgreSQL) is ONLY for document content storage (markdown, OAS files)
- Document metadata and relationships MUST be stored in GraphDB, never duplicated in RDB
- GraphDB schema changes require explicit migration plans documented in `graphDB_draft.md`

### II. Glossary-Driven Consistency (NON-NEGOTIABLE)
Concept (Glossary) nodes MUST be the single source of truth for terminology:
- Concept definition changes MUST automatically propagate to all connected Documents
- Documents MUST link to Concepts via `USES_CONCEPT` relationships, not hardcode definitions
- AI-assisted term extraction MUST suggest Concept connections before document publication
- Impact analysis MUST show affected documents in graph view before Concept updates
- No document should contain standalone term definitions without Concept linkage

### III. Document Layer Architecture
Documents MUST be structured in three layers:
- **Layer 1**: Core concepts extracted and mapped to Concept nodes (for AI context, SEO, recommendations)
- **Layer 2**: AI-generated summary stored in Document.summary field (for quick preview, search)
- **Layer 3**: Full original content stored in RDB (for rendering, versioning)
- Layer generation MUST be automated via AI during document creation/update
- Layer 1 and Layer 2 MUST be kept in sync with Layer 3 through automated processes

### IV. Phase-Based Development
Features MUST be developed in defined phases with clear dependencies:
- **Phase 1**: Core features (document management, glossary, version/page management, basic search)
- **Phase 2**: AI features (AI writing assistance, quality checks, AI chat, recommendations)
- **Phase 3**: Collaboration features (team management, workflow, review system)
- **Phase 4**: Advanced features (SEO, i18n, metrics, content blocks)
- No Phase N+1 feature implementation until Phase N core features are complete and tested
- Phase boundaries MUST be documented in `functional_specification.md` with priority levels (P0/P1/P2)

### V. AI Integration Standards
AI features MUST follow consistent patterns:
- All AI operations MUST use GraphDB context (connected Documents, Concepts, Tags)
- AI responses MUST include source references (Document IDs, Concept IDs)
- AI-assisted content MUST be reviewable and editable by humans before publication
- AI quality checks MUST run before document status changes to "publish"
- AI service failures MUST degrade gracefully (fallback to manual processes, clear error messages)
- AI context size MUST be optimized using Layer 1 (concepts) and Layer 2 (summaries) to reduce token costs

### VI. Version and Page Hierarchy
Version and Page structure MUST follow strict hierarchy:
- Version nodes group Pages; Pages display Documents; Documents contain content
- One Document CAN be displayed by multiple Pages, but one Page displays one Document at a time
- Page hierarchy MUST use `CHILD_OF` relationships, not flat structures
- Version `is_main` MUST be unique per team (only one main version at a time)
- Version `is_public` controls external access; internal visibility controlled by Page `visible` property

### VII. Working Copy Pattern for Published Documents
Published documents (status: "publish") MUST use Working Copy pattern for modifications:
- Working Copy Document created with `WORKING_COPY_OF` relationship to original
- Working Copy MUST go through review workflow (draft → in_review → done) before merge
- Merge MUST update original Document's `storage_key` and preserve history
- Working Copy can be archived or deleted after successful merge
- Direct modification of published documents is FORBIDDEN

## Technology Stack Requirements

### Backend
- **Framework**: NestJS with TypeScript (MUST)
- **GraphDB**: Neo4j with official `neo4j-driver` and `@nestjs/neo4j` (MUST)
- **RDB**: PostgreSQL with TypeORM or Prisma (MUST)
- **Cache**: Redis for session management and caching (SHOULD)
- **File Storage**: AWS S3 or MinIO (S3-compatible) (MUST)
- **API**: REST API with Swagger/OpenAPI documentation (MUST)
- **Authentication**: JWT-based with `@nestjs/jwt` and `@nestjs/passport` (MUST)

### Frontend
- **Framework**: Next.js 14+ with App Router and TypeScript (MUST)
- **Styling**: Tailwind CSS with shadcn/ui or Radix UI components (MUST)
- **State Management**: Zustand or Jotai for client state; TanStack Query for server state (MUST)
- **Markdown Rendering**: `react-markdown` with `remark-gfm` and `rehype-highlight` (MUST)
- **Graph Visualization**: Neo4j NVL (Neo4j Visualization Library) for graph views (MUST)
- **OAS Rendering**: `@stoplight/elements` or `swagger-ui-react` (MUST)

### AI/ML Services
- **LLM**: OpenAI API or Anthropic Claude API (MUST for Phase 2+)
- **Embeddings**: OpenAI Embeddings or Cohere (SHOULD for Phase 2+)
- **NER**: spaCy or OpenAI API for term extraction (SHOULD for Phase 2+)

### Development Tools
- **Version Control**: Git with GitHub or GitLab (MUST)
- **Testing**: Jest for unit tests; Supertest for API tests; Playwright/Cypress for E2E (MUST)
- **Code Quality**: ESLint + Prettier (MUST)
- **CI/CD**: GitHub Actions or GitLab CI (MUST)
- **Monitoring**: Sentry or Datadog for error tracking (SHOULD)

## Development Workflow

### Document Creation Workflow
1. Admin selects or creates Version
2. Document metadata entered (title, type, tags)
3. AI suggests outline (Phase 2+)
4. Content written with AI assistance (Phase 2+)
5. First save creates Document node in GraphDB with status "draft"
6. AI extracts concepts and suggests Concept connections (Phase 2+)
7. Admin approves/rejects Concept connections
8. AI quality check runs (Phase 2+)
9. Issues fixed, then document proceeds to review/publish workflow

### Concept (Glossary) Update Workflow
1. Concept definition updated in GraphDB
2. System queries all Documents with `USES_CONCEPT` relationship
3. Impact analysis shows affected documents in graph view
4. Admin reviews impact and approves
5. System automatically updates affected document content in RDB
6. Change log recorded for audit

### Review and Publication Workflow (Phase 3+)
1. Document status: "draft" → "in_review" (review request)
2. Reviewers approve/reject with comments
3. All approvals → status: "done"
4. Admin with publish permission → status: "publish"
5. Published documents visible to end users based on Version `is_public` flag

### Code Review Requirements
- All PRs MUST include tests for new features
- GraphDB schema changes MUST include migration scripts
- API changes MUST update OpenAPI/Swagger documentation
- Frontend changes MUST follow component library patterns (shadcn/ui or Radix UI)
- AI feature changes MUST include fallback behavior documentation

## Data Model Constraints

### GraphDB Node Requirements
- All nodes MUST have `id` (UUID), `created_at`, `updated_at` properties
- Node types MUST match exactly: Version, Page, Document, Attachment, Concept, Tag, Block (Phase 4), SEOProperties (Phase 4)
- Relationship types MUST match exactly as defined in `graphDB_draft.md`
- No ad-hoc node types or relationships without schema update in `graphDB_draft.md`

### RDB Table Requirements
- Document content MUST be stored with `document_id` linking to GraphDB Document node
- User interaction data (favorites, page_views, feedbacks) MUST be in RDB
- Team and permission data (Phase 3+) MUST be in RDB
- All RDB tables MUST have audit fields (`created_at`, `updated_at`)

### Storage Key Pattern
- Document content: `/{team_id}/documents/{document_id}/content.md` (or `.yaml` for API docs)
- Attachments: `/{team_id}/attachments/{attachment_id}/{filename}`
- Storage keys MUST be stored in GraphDB Document/Attachment nodes, not duplicated in RDB

## Performance Standards

- Document search response time: < 500ms (MUST)
- AI response time: < 5 seconds (SHOULD, with timeout handling)
- Page loading time: < 2 seconds (MUST)
- Graph view rendering: < 1 second for 100 nodes (SHOULD)
- API endpoints MUST implement rate limiting
- GraphDB queries MUST be optimized (index usage, query profiling)

## Security Requirements

- JWT-based authentication REQUIRED for all admin endpoints
- RBAC (Role-Based Access Control) REQUIRED for team features (Phase 3+)
- Document access control based on Version `is_public` and Page `visible` flags
- File upload validation (type, size, virus scanning) REQUIRED
- API rate limiting REQUIRED
- Sensitive data (API keys, tokens) MUST use secrets management (AWS Secrets Manager, Vault)

## Governance

This constitution supersedes all other development practices and documentation. All team members MUST comply with these principles.

**Amendment Process**:
- Constitution changes require team review and approval
- Version number MUST follow semantic versioning (MAJOR.MINOR.PATCH)
- MAJOR version: Backward-incompatible principle changes
- MINOR version: New principles or major section additions
- PATCH version: Clarifications, wording improvements, non-breaking changes
- All amendments MUST be documented with rationale and migration impact
- Dependent documentation (`functional_specification.md`, `graphDB_draft.md`, `development_tools.md`) MUST be updated in sync

**Compliance Verification**:
- All PRs MUST be checked against constitution principles
- Code reviews MUST verify constitution compliance
- Architecture decisions MUST reference relevant constitution principles
- Violations MUST be caught in CI/CD pipeline or code review, not in production

**Reference Documentation**:
- `functional_specification.md`: Detailed feature specifications and phase breakdown
- `graphDB_draft.md`: Complete GraphDB schema definition
- `development_tools.md`: Technology stack and tooling requirements
- `features_draft.md`: Feature descriptions and user flows
- `service_overview_draft.md`: High-level service overview and pain points

**Version**: 1.0.0 | **Ratified**: 2025-01-XX | **Last Amended**: 2025-01-XX
