# Tasks: Backend API Foundation

**Input**: Design documents from `/specs/001-backend-api-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per Constitution Principle II (Testing Standards), tests are MANDATORY for all features. All user stories MUST have corresponding acceptance tests. Unit tests MUST achieve minimum 80% code coverage for business logic. Contract tests MUST be written for external-facing APIs.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- Paths shown below follow plan.md structure

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETED

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan in backend/
- [x] T002 Initialize TypeScript project with package.json, tsconfig.json
- [x] T003 [P] Configure ESLint and Prettier in backend/
- [x] T004 [P] Setup Jest or Vitest configuration in backend/jest.config.ts or backend/vitest.config.ts
- [x] T005 [P] Create .gitignore and .env.example in backend/
- [x] T006 [P] Setup TypeScript compilation configuration in backend/tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETED

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Setup PostgreSQL database connection in backend/src/db/postgres/connection.ts
- [x] T008 Setup GraphDB (Neo4j) connection in backend/src/db/graphdb/connection.ts
- [x] T009 [P] Implement connection pooling for PostgreSQL (TypeORM/Prisma configuration)
- [x] T010 [P] Implement connection pooling for GraphDB (neo4j-driver configuration)
- [x] T011 [P] Implement retry logic utility in backend/src/utils/retry.ts
- [x] T012 Create base error handling infrastructure in backend/src/utils/errors.ts
- [x] T013 Create logging infrastructure in backend/src/utils/logger.ts
- [x] T014 Setup environment configuration management in backend/src/config/settings.ts
- [x] T015 [P] Create Express/Fastify app structure in backend/src/app.ts
- [x] T016 [P] Implement health check endpoint in backend/src/api/routes/health.ts (US5)
- [x] T017 [US5] Create health check service in backend/src/services/healthService.ts
- [x] T018 [US5] Acceptance test for health check in backend/tests/acceptance/health.test.ts
- [x] T019 [US5] Unit tests for health service in backend/tests/unit/healthService.test.ts
- [x] T020 [US5] Integration test for database connections in backend/tests/integration/database.test.ts
- [x] T020a [NEW] Setup MinIO connection in backend/src/db/storage/connection.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Document Management API (Priority: P1) 🎯 MVP - ✅ COMPLETED

**Goal**: Administrators can create, read, update, and manage documents through REST API endpoints. Documents can be created from scratch or imported from markdown/OAS files.

**Independent Test**: Can be fully tested by creating a document via POST /api/v1/documents, retrieving it via GET /api/v1/documents/{id}, and updating it via PUT /api/v1/documents/{id}. The test verifies that document metadata is stored in GraphDB and content is stored in MinIO, and both can be retrieved correctly.

**Storage Architecture** (Updated 2025-12-08):

- GraphDB: Document & Attachment metadata + relationships
- MinIO: Document content files + Attachment files
- PostgreSQL: User authentication only

### Tests for User Story 1 (MANDATORY per Constitution Principle II) ⚠️

> **NOTE: Per Constitution, tests MUST be written FIRST using TDD approach. Write tests, ensure they FAIL, then implement. Tests MUST be independent, repeatable, and fast (< 1 second per test).**

- [x] T021 [P] [US1] Acceptance test for document CRUD in backend/tests/acceptance/documents.test.ts (verifies independent functionality)
- [x] T022 [P] [US1] Unit tests for document service in backend/tests/unit/documentService.test.ts (minimum 80% coverage)
- [x] T023 [P] [US1] Contract test for POST /api/v1/documents in backend/tests/contract/documents.test.ts
- [x] T024 [P] [US1] Contract test for GET /api/v1/documents/{id} in backend/tests/contract/documents.test.ts
- [x] T025 [P] [US1] Contract test for PUT /api/v1/documents/{id} in backend/tests/contract/documents.test.ts
- [x] T026 [P] [US1] Contract test for POST /api/v1/documents/import in backend/tests/contract/documents.test.ts
- [x] T027 [P] [US1] Integration test for document creation workflow in backend/tests/integration/documents.test.ts

### Implementation for User Story 1

- [x] T028 [P] [US1] Create Document node model in backend/src/models/graphdb/documentNode.ts
- [x] ~~T029~~ [REMOVED] Document content now stored in MinIO (see T028a)
- [x] T028a [NEW] [US1] Create Attachment node model in backend/src/models/graphdb/attachmentNode.ts
- [x] T030 [P] [US1] Create document schema in backend/src/api/schemas/document.ts (Zod/class-validator)
- [x] T030a [NEW] [US1] Create attachment schema in backend/src/api/schemas/attachment.ts
- [x] T031 [US1] Implement document service in backend/src/services/documentService.ts (uses GraphDB + MinIO)
- [x] T031a [NEW] [US1] Implement storage service in backend/src/services/storageService.ts (Attachment CRUD)
- [x] T032 [US1] Implement GraphDB queries for documents in backend/src/db/graphdb/queries.ts
- [x] T032a [NEW] [US1] Implement GraphDB queries for attachments in backend/src/db/graphdb/queries.ts
- [x] ~~T033~~ [MODIFIED] PostgreSQL now only handles users (see backend/src/db/postgres/queries.ts)
- [x] T034 [US1] Implement POST /api/v1/documents route in backend/src/api/routes/documents.ts
- [x] T035 [US1] Implement GET /api/v1/documents/{id} route in backend/src/api/routes/documents.ts
- [x] T036 [US1] Implement PUT /api/v1/documents/{id} route in backend/src/api/routes/documents.ts
- [x] T037 [US1] Implement POST /api/v1/documents/import route in backend/src/api/routes/documents.ts
- [x] T038 [US1] Add validation and error handling (per Constitution Principle I: Code Quality)
- [x] T039 [US1] Add logging for document operations
- [x] T040 [US1] Add API documentation (TypeScript types and JSDoc comments per Constitution Principle I)

### Additional Attachment API (Added 2025-12-08)

- [x] T040a [US1] Implement POST /api/v1/attachments route (upload)
- [x] T040b [US1] Implement GET /api/v1/attachments/:id route
- [x] T040c [US1] Implement GET /api/v1/attachments/:id/download route
- [x] T040d [US1] Implement DELETE /api/v1/attachments/:id route
- [x] T040e [US1] Implement POST /api/v1/attachments/:id/link route (link to document)
- [x] T040f [US1] Implement DELETE /api/v1/attachments/:id/link/:documentId route (unlink)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Glossary Management API (Priority: P1) ✅ COMPLETED

**Goal**: Administrators can create and manage glossary terms (Concepts) through REST API endpoints. When a Concept definition is updated, the system can identify all documents using that concept and provide impact analysis.

**Independent Test**: Can be fully tested by creating a Concept via POST /api/v1/concepts, retrieving it via GET /api/v1/concepts/{id}, updating its description, and verifying that the system can identify all documents using that concept via GET /api/v1/concepts/{id}/documents.

### Tests for User Story 2 (MANDATORY per Constitution Principle II) ⚠️

> **NOTE: Per Constitution, tests MUST be written FIRST using TDD approach. Tests MUST be independent, repeatable, and fast (< 1 second per test).**

- [ ] T041 [P] [US2] Acceptance test for concept CRUD in backend/tests/acceptance/concepts.test.ts (verifies independent functionality)
- [ ] T042 [P] [US2] Unit tests for concept service in backend/tests/unit/conceptService.test.ts (minimum 80% coverage)
- [x] T043 [P] [US2] Contract test for POST /api/v1/concepts in backend/tests/contract/concepts.test.ts
- [x] T044 [P] [US2] Contract test for GET /api/v1/concepts/{id} in backend/tests/contract/concepts.test.ts
- [x] T045 [P] [US2] Contract test for PUT /api/v1/concepts/{id} in backend/tests/contract/concepts.test.ts
- [x] T046 [P] [US2] Contract test for GET /api/v1/concepts/{id}/documents in backend/tests/contract/concepts.test.ts
- [ ] T047 [P] [US2] Integration test for concept impact analysis in backend/tests/integration/concepts.test.ts

### Implementation for User Story 2

- [x] T048 [P] [US2] Create Concept node model in backend/src/models/graphdb/conceptNode.ts
- [x] T049 [P] [US2] Create concept schema in backend/src/api/schemas/concept.ts (Zod/class-validator)
- [x] T050 [US2] Implement concept service in backend/src/services/conceptService.ts
- [x] T051 [US2] Implement GraphDB queries for concepts in backend/src/db/graphdb/queries.ts
- [x] T052 [US2] Implement impact analysis query (find documents using concept) in backend/src/db/graphdb/queries.ts
- [x] T053 [US2] Implement POST /api/v1/concepts route in backend/src/api/routes/concepts.ts
- [x] T054 [US2] Implement GET /api/v1/concepts/{id} route in backend/src/api/routes/concepts.ts
- [x] T055 [US2] Implement PUT /api/v1/concepts/{id} route in backend/src/api/routes/concepts.ts
- [x] T056 [US2] Implement GET /api/v1/concepts/{id}/documents route in backend/src/api/routes/concepts.ts
- [x] T057 [US2] Add validation and error handling (per Constitution Principle I: Code Quality)
- [x] T058 [US2] Add API documentation (TypeScript types and JSDoc comments per Constitution Principle I)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Version and Page Management API (Priority: P1)

**Goal**: Administrators can create versions, create pages, and link pages to documents through REST API endpoints. Pages are organized in a hierarchy and belong to a specific version.

**Independent Test**: Can be fully tested by creating a version via POST /api/v1/versions, creating a page via POST /api/v1/pages, linking page to document via POST /api/v1/pages/{id}/documents, and retrieving navigation tree via GET /api/v1/versions/{id}/navigation.

### Tests for User Story 3 (MANDATORY per Constitution Principle II) ⚠️

> **NOTE: Per Constitution, tests MUST be written FIRST using TDD approach. Tests MUST be independent, repeatable, and fast (< 1 second per test).**

- [ ] T059 [P] [US3] Acceptance test for version and page management in backend/tests/acceptance/versions-pages.test.ts (verifies independent functionality)
- [ ] T060 [P] [US3] Unit tests for version service in backend/tests/unit/versionService.test.ts (minimum 80% coverage)
- [ ] T061 [P] [US3] Unit tests for page service in backend/tests/unit/pageService.test.ts (minimum 80% coverage)
- [ ] T062 [P] [US3] Contract test for POST /api/v1/versions in backend/tests/contract/versions.test.ts
- [ ] T063 [P] [US3] Contract test for POST /api/v1/pages in backend/tests/contract/pages.test.ts
- [ ] T064 [P] [US3] Contract test for POST /api/v1/pages/{id}/documents in backend/tests/contract/pages.test.ts
- [ ] T065 [P] [US3] Contract test for GET /api/v1/versions/{id}/navigation in backend/tests/contract/versions.test.ts
- [ ] T066 [P] [US3] Integration test for navigation tree in backend/tests/integration/versions-pages.test.ts

### Implementation for User Story 3

- [ ] T067 [P] [US3] Create Version node model in backend/src/models/graphdb/versionNode.ts
- [ ] T068 [P] [US3] Create Page node model in backend/src/models/graphdb/pageNode.ts
- [ ] T069 [P] [US3] Create version schema in backend/src/api/schemas/version.ts (Zod/class-validator)
- [ ] T070 [P] [US3] Create page schema in backend/src/api/schemas/page.ts (Zod/class-validator)
- [ ] T071 [US3] Implement version service in backend/src/services/versionService.ts
- [ ] T072 [US3] Implement page service in backend/src/services/pageService.ts
- [ ] T073 [US3] Implement GraphDB queries for versions in backend/src/db/graphdb/queries.ts
- [ ] T074 [US3] Implement GraphDB queries for pages in backend/src/db/graphdb/queries.ts
- [ ] T075 [US3] Implement navigation tree query (hierarchical page structure) in backend/src/db/graphdb/queries.ts
- [ ] T076 [US3] Implement POST /api/v1/versions route in backend/src/api/routes/versions.ts
- [ ] T077 [US3] Implement POST /api/v1/pages route in backend/src/api/routes/pages.ts
- [ ] T078 [US3] Implement POST /api/v1/pages/{id}/documents route in backend/src/api/routes/pages.ts
- [ ] T079 [US3] Implement GET /api/v1/versions/{id}/navigation route in backend/src/api/routes/versions.ts
- [ ] T080 [US3] Add validation and error handling (per Constitution Principle I: Code Quality)
- [ ] T081 [US3] Add API documentation (TypeScript types and JSDoc comments per Constitution Principle I)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Search API (Priority: P2)

**Goal**: End users can search for documents by title, content, tags, and concepts through REST API endpoints. Search results are ranked by relevance and filtered by version.

**Independent Test**: Can be fully tested by creating multiple documents with different titles and content, then searching via GET /api/v1/search?query={term} and verifying that relevant documents are returned in relevance order.

### Tests for User Story 4 (MANDATORY per Constitution Principle II) ⚠️

> **NOTE: Per Constitution, tests MUST be written FIRST using TDD approach. Tests MUST be independent, repeatable, and fast (< 1 second per test).**

- [ ] T082 [P] [US4] Acceptance test for search functionality in backend/tests/acceptance/search.test.ts (verifies independent functionality)
- [ ] T083 [P] [US4] Unit tests for search service in backend/tests/unit/searchService.test.ts (minimum 80% coverage)
- [ ] T084 [P] [US4] Contract test for GET /api/v1/search in backend/tests/contract/search.test.ts
- [ ] T085 [P] [US4] Integration test for search across multiple data sources in backend/tests/integration/search.test.ts

### Implementation for User Story 4

- [ ] T086 [US4] Implement search service in backend/src/services/searchService.ts
- [ ] T087 [US4] Implement PostgreSQL full-text search queries in backend/src/db/postgres/queries.ts
- [ ] T088 [US4] Implement GraphDB queries for concept-based search in backend/src/db/graphdb/queries.ts
- [ ] T089 [US4] Implement relevance ranking algorithm in backend/src/services/searchService.ts
- [ ] T090 [US4] Implement GET /api/v1/search route in backend/src/api/routes/search.ts
- [ ] T091 [US4] Add validation and error handling (per Constitution Principle I: Code Quality)
- [ ] T092 [US4] Add API documentation (TypeScript types and JSDoc comments per Constitution Principle I)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 6 - Basic Authentication and Authorization (Priority: P2)

**Goal**: The system provides JWT-based authentication for API endpoints. Basic role-based access control (RBAC) distinguishes between administrators and end users. Protected endpoints require valid authentication tokens.

**Independent Test**: Can be fully tested by attempting to access protected endpoint without token (should return 401), with invalid token (should return 401), and with valid token (should return 200). Test also verifies that admin-only endpoints reject end-user tokens.

### Tests for User Story 6 (MANDATORY per Constitution Principle II) ⚠️

> **NOTE: Per Constitution, tests MUST be written FIRST using TDD approach. Tests MUST be independent, repeatable, and fast (< 1 second per test).**

- [ ] T093 [P] [US6] Acceptance test for authentication flow in backend/tests/acceptance/auth.test.ts (verifies independent functionality)
- [ ] T094 [P] [US6] Unit tests for auth service in backend/tests/unit/authService.test.ts (minimum 80% coverage)
- [ ] T095 [P] [US6] Unit tests for auth middleware in backend/tests/unit/authMiddleware.test.ts (minimum 80% coverage)
- [ ] T096 [P] [US6] Contract test for POST /api/v1/auth/login in backend/tests/contract/auth.test.ts
- [ ] T097 [P] [US6] Integration test for protected endpoints in backend/tests/integration/auth.test.ts

### Implementation for User Story 6

- [ ] T098 [P] [US6] Create User model in backend/src/models/rdb/user.ts (TypeORM/Prisma entity)
- [ ] T099 [P] [US6] Create auth schema in backend/src/api/schemas/auth.ts (Zod/class-validator)
- [ ] T100 [US6] Implement auth service in backend/src/services/authService.ts
- [ ] T101 [US6] Implement JWT token generation and validation in backend/src/services/authService.ts
- [ ] T102 [US6] Implement password hashing (bcryptjs) in backend/src/services/authService.ts
- [ ] T103 [US6] Implement authentication middleware in backend/src/api/middleware/auth.ts
- [ ] T104 [US6] Implement authorization middleware (role-based) in backend/src/api/middleware/auth.ts
- [ ] T105 [US6] Implement POST /api/v1/auth/login route in backend/src/api/routes/auth.ts
- [ ] T106 [US6] Apply authentication middleware to protected endpoints
- [ ] T107 [US6] Add validation and error handling (per Constitution Principle I: Code Quality)
- [ ] T108 [US6] Add API documentation (TypeScript types and JSDoc comments per Constitution Principle I)

**Checkpoint**: At this point, all user stories should work with authentication

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T109 [P] Documentation updates in backend/README.md
- [ ] T110 Code cleanup and refactoring across all services
- [ ] T111 Performance optimization across all stories (connection pooling tuning, query optimization)
- [ ] T112 [P] Verify test coverage meets 80% minimum for business logic (per Constitution Principle II)
- [ ] T113 [P] Additional unit tests in backend/tests/unit/ to meet coverage requirements
- [ ] T114 Security hardening (input sanitization, rate limiting)
- [ ] T115 Run quickstart.md validation
- [ ] T116 [P] Generate OpenAPI documentation from code annotations
- [ ] T117 [P] Setup API documentation endpoint (swagger-ui-express or @fastify/swagger)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - May use Document nodes from US1 but should be independently testable
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - May use Document nodes from US1 but should be independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Requires documents from US1, concepts from US2, but should be independently testable
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories, but should be applied to all endpoints after implementation

### Within Each User Story

- **Tests MUST be written FIRST** (per Constitution Principle II: TDD approach)
- Tests MUST fail before implementation begins
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority
- All code MUST pass linting/formatting (per Constitution Principle I)
- Test coverage MUST meet 80% minimum for business logic (per Constitution Principle II)

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Acceptance test for document CRUD in backend/tests/acceptance/documents.test.ts"
Task: "Unit tests for document service in backend/tests/unit/documentService.test.ts"
Task: "Contract test for POST /api/v1/documents in backend/tests/contract/documents.test.ts"
Task: "Contract test for GET /api/v1/documents/{id} in backend/tests/contract/documents.test.ts"

# Launch all models for User Story 1 together:
Task: "Create Document node model in backend/src/models/graphdb/documentNode.ts"
Task: "Create Document content model in backend/src/models/rdb/documentContent.ts"
Task: "Create document schema in backend/src/api/schemas/document.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Document Management)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 6 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Document Management)
   - Developer B: User Story 2 (Glossary Management)
   - Developer C: User Story 3 (Version/Page Management)
3. After P1 stories complete:
   - Developer A: User Story 4 (Search)
   - Developer B: User Story 6 (Authentication)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths use TypeScript (.ts) extension
- Database migrations should be created as needed (TypeORM migrations or Prisma migrations)
