# Data Model: Backend API Foundation

**Feature**: Backend API Foundation  
**Date**: 2025-12-07  
**Updated**: 2025-12-09

**Changes**:
- 2025-12-09: Concept Node에서 category 필드 제거 (categorization via relationships로 대체)
- 2025-12-08: Storage 아키텍처 변경 (PostgreSQL → MinIO)

## Overview

The system uses a triple-storage architecture:

- **GraphDB (Neo4j)**: Stores metadata and relationships (Document, Attachment, Concept, Version, Page nodes)
- **MinIO (Object Storage)**: Stores document content files and attachment files
- **PostgreSQL**: Stores user authentication data only

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                               NALLO Storage Architecture                                      │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   GraphDB (Neo4j) - Metadata & Relationships                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │
│   │                                                                                         │ │
│   │                                    ┌───────────────┐                                    │ │
│   │                                    │     Tag       │                                    │ │
│   │                                    │───────────────│                                    │ │
│   │                                    │ id            │                                    │ │
│   │              ┌─────────────────────│ name          │─────────────────────┐              │ │
│   │              │        HAS_TAG      └───────────────┘      HAS_TAG        │              │ │
│   │              │                            ▲                              │              │ │
│   │              │                            │ HAS_TAG                      │              │ │
│   │              │                            │                              │              │ │
│   │              ▼                            │                              ▼              │ │
│   │   ┌───────────────┐              ┌───────┴───────┐              ┌───────────────┐       │ │
│   │   │     Page      │   DISPLAYS   │   Document    │ USES_CONCEPT │    Concept    │       │ │
│   │   │───────────────│─────────────▶│───────────────│─────────────▶│───────────────│       │ │
│   │   │ id            │              │ id            │              │ id            │       │ │
│   │   │ slug          │              │ type          │              │ term          │       │ │
│   │   │ title         │              │ status        │              │ lang          │       │ │
│   │   │ order         │              │ title         │              │ description   │       │ │
│   │   │ visible       │              │ lang          │              │               │       │ │
│   │   └───────┬───────┘              │ storage_key   │              └───┬───┬───┬───┘       │ │
│   │           │                      │ summary       │                  │   │   │           │ │
│   │           │                      └──┬──┬──┬──┬───┘                  │   │   │           │ │
│   │           │                         │  │  │  │                      │   │   │           │ │
│   │   ┌───────┴───────┐                 │  │  │  │            ┌─────────┘   │   └─────────┐ │ │
│   │   │               │                 │  │  │  │            │             │             │ │ │
│   │   │  IN_VERSION   │  CHILD_OF       │  │  │  │            │ SYNONYM_OF  │ SUBTYPE_OF  │ │ │
│   │   │               │  (self-ref)     │  │  │  │            │ (self-ref)  │ (self-ref)  │ │ │
│   │   ▼               ▼                 │  │  │  │            ▼             ▼             ▼ │ │
│   │ ┌───────────────┐ ┌──┐              │  │  │  │          ┌──┐         ┌──┐         ┌──┐ │ │
│   │ │    Version    │ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ │───────────────│ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ │ id            │ │Page             │  │  │  │          │Concept    │Concept    │Concept │
│   │ │ version       │ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ │ name          │ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ │ is_public     │ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ │ is_main       │ │  │              │  │  │  │          │  │         │  │         │  │ │ │
│   │ └───────────────┘ └──┘              │  │  │  │          └──┘         └──┘         └──┘ │ │
│   │                                     │  │  │  │                   PART_OF              │ │
│   │                   ┌─────────────────┘  │  │  │                   (self-ref)           │ │
│   │                   │  ┌─────────────────┘  │  │                                        │ │
│   │                   │  │  ┌────────────────┘  │                                         │ │
│   │                   │  │  │  ┌────────────────┘                                         │ │
│   │                   │  │  │  │                                                          │ │
│   │                   │  │  │  │ HAS_ATTACHMENT                                           │ │
│   │                   │  │  │  │                                                          │ │
│   │                   │  │  │  │       ┌───────────────┐                                  │ │
│   │                   │  │  │  │       │  Attachment   │                                  │ │
│   │                   │  │  │  │       │───────────────│                                  │ │
│   │                   │  │  │  └──────▶│ id            │                                  │ │
│   │                   │  │  │          │ filename      │                                  │ │
│   │                   │  │  │          │ storage_key   │                                  │ │
│   │                   │  │  │          │ mime_type     │                                  │ │
│   │                   │  │  │          │ file_type     │                                  │ │
│   │                   │  │  │          │ size_bytes    │                                  │ │
│   │                   │  │  │          │ checksum      │                                  │ │
│   │                   │  │  │          │ alt_text      │                                  │ │
│   │                   │  │  │          └───────┬───────┘                                  │ │
│   │                   │  │  │                  │                                          │ │
│   │                   │  │  │                  │ storage_key                              │ │
│   │                   │  │  │                  │ (MinIO 경로)                             │ │
│   │  LINKS_TO         │  │  │                  │                                          │ │
│   │  ┌──────────────┐ │  │  │                  │                                          │ │
│   │  ▼              │ │  │  │                  │                                          │ │
│   │ ┌──┐ WORKING_   │ │  │  │                  │                                          │ │
│   │ │  │ COPY_OF    │ │  │  │                  │                                          │ │
│   │ │Doc├───────────┘ │  │  │                  │                                          │ │
│   │ │  │              │  │  │                  │                                          │ │
│   │ └──┘              │  │  │                  │                                          │ │
│   │                   │  │  │                  │                                          │ │
│   │       storage_key │  │  │                  │                                          │ │
│   │       (MinIO 경로)│  │  │                  │                                          │ │
│   │                   │  │  │                  │                                          │ │
│   └───────────────────┼──┼──┼──────────────────┼──────────────────────────────────────────┘ │
│                       │  │  │                  │                                            │
│                       │  │  │                  │                                            │
│   MinIO (Object Storage)                                                                    │
│   ┌───────────────────┼──┼──┼──────────────────┼──────────────────────────────────────────┐ │
│   │                   │  │  │                  │                                          │ │
│   │                   ▼  │  │                  ▼                                          │ │
│   │   ┌─────────────────────────┐    ┌─────────────────────────┐                          │ │
│   │   │      documents/         │    │     attachments/        │                          │ │
│   │   │─────────────────────────│    │─────────────────────────│                          │ │
│   │   │ {document_id}/          │    │ {attachment_id}/        │                          │ │
│   │   │   └── content.md        │    │   └── {filename}        │                          │ │
│   │   │   └── content.yaml      │    │       (screenshot.png)  │                          │ │
│   │   │       (API spec)        │    │       (api-spec.pdf)    │                          │ │
│   │   └─────────────────────────┘    └─────────────────────────┘                          │ │
│   │                                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                             │
│   PostgreSQL (User Auth Only)                                                               │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │   users: id | email | password_hash | role ('administrator'|'end_user') | timestamps│   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Relationships Reference

| From Node | Relationship      | To Node    | Description        |
| --------- | ----------------- | ---------- | ------------------ |
| Page      | `IN_VERSION`      | Version    | 페이지 버전 소속   |
| Page      | `DISPLAYS`        | Document   | 페이지가 문서 표시 |
| Page      | `CHILD_OF`        | Page       | 페이지 계층구조    |
| Page      | `HAS_TAG`         | Tag        | 페이지 태그        |
| Document  | `USES_CONCEPT`    | Concept    | 문서가 용어 사용   |
| Document  | `HAS_ATTACHMENT`  | Attachment | 문서에 첨부파일    |
| Document  | `LINKS_TO`        | Document   | 문서 간 링크       |
| Document  | `WORKING_COPY_OF` | Document   | 작업 복사본        |
| Document  | `HAS_TAG`         | Tag        | 문서 태그          |
| Concept   | `SYNONYM_OF`      | Concept    | 동의어 관계        |
| Concept   | `SUBTYPE_OF`      | Concept    | 하위유형 관계      |
| Concept   | `PART_OF`         | Concept    | 부분-전체 관계     |
| Concept   | `HAS_TAG`         | Tag        | 용어 태그          |

### Storage Key Mapping

| Node       | storage_key → MinIO Path       |
| ---------- | ------------------------------ |
| Document   | `documents/{id}/content.{ext}` |
| Attachment | `attachments/{id}/{filename}`  |

## GraphDB Schema

### Document Node

**Node Type**: `Document`

**Properties**:

- `id` (string, UUID, required): Document unique identifier
- `type` (string, enum, required): Document type - "api" | "general" | "tutorial"
- `status` (string, enum, required, default: "draft"): Workflow status - "draft" | "in_review" | "done" | "publish"
- `title` (string, required): Document title
- `lang` (string, required): Language code (ISO 639-1, e.g., "ko", "en")
- `storage_key` (string, required): Path to content file in MinIO (e.g., "documents/{id}/content.md")
- `summary` (string, optional): Document summary (AI-generated, Layer 2)
- `created_at` (datetime, required): Creation timestamp
- `updated_at` (datetime, required): Last update timestamp

**Relationships**:

- `(:Document)-[:USES_CONCEPT]->(:Concept)`: Document uses glossary concept
- `(:Document)-[:HAS_ATTACHMENT]->(:Attachment)`: Document has attached files
- `(:Document)-[:LINKS_TO]->(:Document)`: Document links to another document
- `(:Document)-[:WORKING_COPY_OF]->(:Document)`: Working copy relationship
- `(:Document)-[:HAS_TAG]->(:Tag)`: Document tagged with tag
- `(:Page)-[:DISPLAYS]->(:Document)`: Page displays document

**Validation Rules**:

- `type` must be one of: "api", "general", "tutorial"
- `status` must be one of: "draft", "in_review", "done", "publish"
- `lang` must be valid ISO 639-1 language code
- `id` must be valid UUID format

**State Transitions**:

- `draft` → `in_review` (when review requested)
- `in_review` → `done` (when all reviewers approve)
- `in_review` → `draft` (when review rejected)
- `done` → `publish` (when deployed)
- `publish` → `draft` (via working copy)

### Concept Node

**Node Type**: `Concept`

**Properties**:

- `id` (string, UUID, required): Concept unique identifier
- `term` (string, required): Term text (e.g., "access token", "액세스 토큰")
- `lang` (string, required): Language code (ISO 639-1)
- `description` (string, required): Term definition/description
- `created_at` (datetime, required): Creation timestamp
- `updated_at` (datetime, required): Last update timestamp

**Relationships**:

- `(:Document)-[:USES_CONCEPT]->(:Concept)`: Documents using this concept
- `(:Concept)-[:SYNONYM_OF]->(:Concept)`: Synonym relationship (same language)
- `(:Concept)-[:SUBTYPE_OF]->(:Concept)`: Inheritance/classification relationship (e.g., "REST API" subtype_of "API")
- `(:Concept)-[:PART_OF]->(:Concept)`: Composition relationship (e.g., "엔진" part_of "자동차")
- `(:Concept)-[:HAS_TAG]->(:Tag)`: Concept tagged with tag

**Validation Rules**:

- `term` must be non-empty
- `description` must be non-empty
- `lang` must be valid ISO 639-1 language code
- `id` must be valid UUID format

### Version Node

**Node Type**: `Version`

**Properties**:

- `id` (string, UUID, required): Version unique identifier
- `version` (string, required): Version identifier (e.g., "v1.0.1", "v1.0.2")
- `name` (string, required): Display name (e.g., "Version 1", "2025 Q1 Release")
- `description` (string, optional): Version description
- `is_public` (boolean, required): Public access flag
- `is_main` (boolean, required, default: false): Main version flag (only one true per team)
- `created_at` (datetime, required): Creation timestamp
- `updated_at` (datetime, required): Last update timestamp

**Relationships**:

- `(:Page)-[:IN_VERSION]->(:Version)`: Pages belonging to version

**Validation Rules**:

- `version` must match pattern: `^v\d+\.\d+\.\d+$` (semantic versioning)
- `version` must be unique
- Only one version can have `is_main=true` per team
- `id` must be valid UUID format

### Page Node

**Node Type**: `Page`

**Properties**:

- `id` (string, UUID, required): Page unique identifier
- `slug` (string, required): URL path segment (e.g., "getting-started")
- `title` (string, required): Page title
- `order` (integer, optional, default: 0): Sort order within parent
- `visible` (boolean, optional, default: false): Navigation visibility
- `created_at` (datetime, required): Creation timestamp
- `updated_at` (datetime, required): Last update timestamp

**Relationships**:

- `(:Page)-[:IN_VERSION]->(:Version)`: Page belongs to version
- `(:Page)-[:DISPLAYS]->(:Document)`: Page displays document
- `(:Page)-[:CHILD_OF]->(:Page)`: Page hierarchy (child → parent)
- `(:Page)-[:HAS_TAG]->(:Tag)`: Page tagged with tag

**Validation Rules**:

- `slug` must be unique within same version
- `slug` must match pattern: `^[a-z0-9-]+$` (lowercase, alphanumeric, hyphens)
- `id` must be valid UUID format

### Attachment Node

**Node Type**: `Attachment`

**Properties**:

- `id` (string, UUID, required): Attachment unique identifier
- `filename` (string, required): Original filename (e.g., "screenshot.png")
- `storage_key` (string, required): Path to file in MinIO (e.g., "attachments/{id}/{filename}")
- `mime_type` (string, required): MIME type (e.g., "image/png", "application/pdf")
- `file_type` (string, enum, required): Categorized file type - "image" | "document" | "other"
- `size_bytes` (integer, required): File size in bytes
- `checksum` (string, optional): MD5 checksum for integrity verification
- `alt_text` (string, optional): Alternative text for images (accessibility)
- `created_at` (datetime, required): Creation timestamp
- `updated_at` (datetime, required): Last update timestamp

**Relationships**:

- `(:Document)-[:HAS_ATTACHMENT]->(:Attachment)`: Document has attached file

**Validation Rules**:

- `id` must be valid UUID format
- `filename` must be non-empty
- `storage_key` must be non-empty
- `mime_type` must be valid MIME type
- `file_type` must be one of: "image", "document", "other"
- `size_bytes` must be non-negative integer, max 10MB

**Allowed MIME Types**:

- Images: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`
- Documents: `application/pdf`
- API specs: `application/json`, `application/yaml`, `text/yaml`
- Markdown: `text/markdown`, `text/x-markdown`

## MinIO (Object Storage) Schema

### documents/ Bucket Structure

**Purpose**: Store document content files

**Path Pattern**: `documents/{document_id}/content.{ext}`

**Examples**:

- `documents/abc123/content.md` - Markdown document
- `documents/def456/content.yaml` - API specification (YAML)

### attachments/ Bucket Structure

**Purpose**: Store attachment files

**Path Pattern**: `attachments/{attachment_id}/{sanitized_filename}`

**Examples**:

- `attachments/abc123/screenshot.png`
- `attachments/def456/api-spec.pdf`

## PostgreSQL Schema

### users Table (for authentication)

**Purpose**: Store user credentials and roles

**Columns**:

- `id` (UUID, PK): Primary key
- `email` (VARCHAR(255), unique, not null): User email
- `password_hash` (VARCHAR(255), not null): Bcrypt hashed password
- `role` (VARCHAR(50), not null, default: 'end_user'): User role - 'administrator' | 'end_user'
- `created_at` (TIMESTAMP, not null, default: now()): Creation timestamp
- `updated_at` (TIMESTAMP, not null, default: now()): Last update timestamp

**Indexes**:

- Primary key on `id`
- Unique index on `email`
- Index on `role` for authorization queries

**Constraints**:

- `email` must be valid email format
- `role` must be one of: 'administrator', 'end_user'

## Data Consistency Rules

### Cross-Storage Consistency

1. **Document Consistency (GraphDB + MinIO)**:

   - When Document node is created in GraphDB, content file MUST be created in MinIO
   - When Document node is deleted in GraphDB, content file MUST be deleted from MinIO
   - `storage_key` in GraphDB Document node MUST reference existing file in MinIO

2. **Attachment Consistency (GraphDB + MinIO)**:

   - When Attachment node is created in GraphDB, file MUST be uploaded to MinIO
   - When Attachment node is deleted in GraphDB, file MUST be deleted from MinIO
   - `storage_key` in GraphDB Attachment node MUST reference existing file in MinIO

3. **Transaction Management**:

   - Document/Attachment creation MUST upload to MinIO first, then create GraphDB node
   - On MinIO upload failure, do not create GraphDB node
   - On GraphDB creation failure, delete uploaded MinIO file (rollback)

4. **Orphaned Record Prevention**:

   - GraphDB nodes without MinIO files are considered orphaned metadata
   - MinIO files without GraphDB nodes are considered orphaned files
   - Health check endpoint SHOULD detect and report orphaned records

## Relationship Patterns

### Document-Concept Relationship

**Pattern**: `(:Document)-[:USES_CONCEPT]->(:Concept)`

**Usage**:

- Track which documents use which glossary terms
- Enable impact analysis when concept definition changes
- Support search by concept

**Properties**: None (relationship is binary)

### Page-Document Relationship

**Pattern**: `(:Page)-[:DISPLAYS]->(:Document)`

**Usage**:

- Link pages to documents for rendering
- One document can be displayed on multiple pages
- Enable document retrieval by page

**Properties**: None

### Document-Attachment Relationship

**Pattern**: `(:Document)-[:HAS_ATTACHMENT]->(:Attachment)`

**Usage**:

- Link documents to their attached files (images, PDFs, etc.)
- One document can have multiple attachments
- One attachment can exist independently (standalone) or be linked to multiple documents
- Support document preview with embedded images

**Relationship Properties**:

- `order` (integer, optional, default: 0): Display order of attachment within document
- `caption` (string, optional): Caption text for the attachment

**API Operations**:

- `POST /attachments` - Upload standalone attachment
- `POST /attachments?document_id={id}` - Upload and link to document
- `POST /attachments/:id/link` - Link existing attachment to document
- `DELETE /attachments/:id/link/:documentId` - Unlink from document (keeps attachment)
- `DELETE /attachments/:id` - Delete attachment entirely

**Query Examples**:

```cypher
// Get all attachments for a document
MATCH (d:Document {id: $docId})-[r:HAS_ATTACHMENT]->(a:Attachment)
RETURN a, r.order, r.caption
ORDER BY r.order ASC

// Get documents that use an attachment
MATCH (d:Document)-[:HAS_ATTACHMENT]->(a:Attachment {id: $attId})
RETURN d.id, d.title
```

### Page Hierarchy

**Pattern**: `(:ChildPage)-[:CHILD_OF]->(:ParentPage)`

**Usage**:

- Build navigation tree structure
- Support nested page organization
- Enable breadcrumb navigation

**Properties**: None

**Constraints**:

- No circular references (page cannot be ancestor of itself)
- Maximum depth: 10 levels (to prevent deep recursion)

### Concept Relationships

#### SUBTYPE_OF Relationship

**Pattern**: `(:Concept)-[:SUBTYPE_OF]->(:Concept)`

**Usage**:

- Represent classification/hierarchical relationships
- Express "A is a kind of B" or "A is a subtype of B"
- Build taxonomy (classification hierarchy)

**Examples**:

- "REST API" subtype_of "API" (REST API is a kind of API)
- "JWT" subtype_of "토큰" (JWT is a kind of token)
- "SUV" subtype_of "자동차" (SUV is a kind of car)

**Distinguishing Rule**: If A is removed, B still exists as a category. A is a member/type of category B.

#### PART_OF Relationship

**Pattern**: `(:Concept)-[:PART_OF]->(:Concept)`

**Usage**:

- Represent composition/meronymy relationships
- Express "A is a part/component of B"
- Build meronomy (part-whole hierarchy)

**Examples**:

- "엔진" part_of "자동차" (Engine is a part of car)
- "Authorization Header" part_of "HTTP Request" (Header is a component of request)
- "API 키" part_of "인증 설정" (API key is a component of authentication settings)

**Distinguishing Rule**: If A is removed, B becomes incomplete. A is a physical or logical component of B.

#### SYNONYM_OF Relationship

**Pattern**: `(:Concept)-[:SYNONYM_OF]->(:Concept)`

**Usage**:

- Represent synonym relationships (same language)
- Link alternative terms for the same concept
- Typically one concept is canonical, others are synonyms

**Examples**:

- "액세스 토큰" synonym_of "access token" (if both exist in same language)
- "API 키" synonym_of "API Key"

**Constraints**:

- Both concepts must be in the same language
- Relationship should be bidirectional or one-way to canonical term

## Query Patterns

### Document Retrieval

**GraphDB Query** (Get metadata):

```cypher
MATCH (d:Document {id: $document_id})
RETURN d
```

**MinIO Operation** (Get content):

```javascript
// Get storage_key from GraphDB Document node
const storageKey = document.storage_key; // e.g., "documents/abc123/content.md"

// Download content from MinIO
const contentBuffer = await minioClient.getObject(bucketName, storageKey);
const content = contentBuffer.toString("utf-8");
```

### Document with Attachments Retrieval

**GraphDB Query**:

```cypher
MATCH (d:Document {id: $document_id})
OPTIONAL MATCH (d)-[r:HAS_ATTACHMENT]->(a:Attachment)
RETURN d, collect({attachment: a, order: r.order, caption: r.caption}) as attachments
```

### Concept Impact Analysis

**GraphDB Query**:

```cypher
MATCH (c:Concept {id: $concept_id})<-[:USES_CONCEPT]-(d:Document)
RETURN d.id, d.title, d.status
```

### Navigation Tree

**GraphDB Query**:

```cypher
MATCH (v:Version {id: $version_id})<-[:IN_VERSION]-(p:Page)
OPTIONAL MATCH (p)-[:CHILD_OF]->(parent:Page)
WHERE p.visible = true
RETURN p, parent
ORDER BY p.order, p.created_at DESC
```

## Validation Rules Summary

### UUID Format

- All IDs must be valid UUID v4 format
- Pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`

### Language Codes

- Must be valid ISO 639-1 two-letter codes
- Examples: "ko", "en", "ja", "zh"

### Version Format

- Must match semantic versioning: `^v\d+\.\d+\.\d+$`
- Examples: "v1.0.0", "v2.1.3"

### Slug Format

- Lowercase alphanumeric with hyphens
- Pattern: `^[a-z0-9-]+$`
- Examples: "getting-started", "api-reference"
