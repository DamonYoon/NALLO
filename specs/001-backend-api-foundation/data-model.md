# Data Model: Backend API Foundation

**Feature**: Backend API Foundation  
**Date**: 2025-12-07

## Overview

The system uses a dual-database architecture:
- **GraphDB (Neo4j)**: Stores metadata and relationships (Document, Concept, Version, Page nodes)
- **PostgreSQL**: Stores document content and user interaction data

## GraphDB Schema

### Document Node

**Node Type**: `Document`

**Properties**:
- `id` (string, UUID, required): Document unique identifier
- `type` (string, enum, required): Document type - "api" | "general" | "tutorial"
- `status` (string, enum, required, default: "draft"): Workflow status - "draft" | "in_review" | "done" | "publish"
- `title` (string, required): Document title
- `lang` (string, required): Language code (ISO 639-1, e.g., "ko", "en")
- `storage_key` (string, required): Reference to content in PostgreSQL (document_id)
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
- `category` (string, optional): Concept category (e.g., "api", "domain", "ui")
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

## PostgreSQL Schema

### documents Table

**Purpose**: Store document content

**Columns**:
- `id` (UUID, PK): Primary key
- `document_id` (UUID, FK, unique, not null): References GraphDB Document node id
- `content` (TEXT, not null): Document content (markdown or YAML)
- `storage_key` (VARCHAR(255), not null): File storage location (S3 path, etc.)
- `created_at` (TIMESTAMP, not null, default: now()): Creation timestamp
- `updated_at` (TIMESTAMP, not null, default: now()): Last update timestamp

**Indexes**:
- Primary key on `id`
- Unique index on `document_id`
- Index on `created_at` for sorting

**Constraints**:
- `document_id` must reference existing Document node in GraphDB
- `content` cannot be null or empty

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

### Cross-Database Consistency

1. **Document Consistency**:
   - When Document node is created in GraphDB, corresponding row MUST be created in PostgreSQL `documents` table
   - When Document node is deleted in GraphDB, corresponding row MUST be deleted from PostgreSQL
   - `document_id` in PostgreSQL MUST always reference existing Document node in GraphDB

2. **Transaction Management**:
   - Document creation/update MUST use distributed transaction or two-phase commit
   - On failure, rollback both GraphDB and PostgreSQL changes
   - Use transaction logs to detect and repair inconsistencies

3. **Orphaned Record Prevention**:
   - GraphDB Document nodes without PostgreSQL content are considered orphaned
   - PostgreSQL rows without GraphDB Document nodes are considered orphaned
   - Health check endpoint MUST detect and report orphaned records

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

**GraphDB Query**:
```cypher
MATCH (d:Document {id: $document_id})
RETURN d
```

**PostgreSQL Query**:
```sql
SELECT content, storage_key 
FROM documents 
WHERE document_id = $document_id
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

