#!/bin/bash

# Database initialization script
# This script sets up the initial database schemas

set -e

echo "🚀 Initializing databases..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables from .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

if [ -f "$ENV_FILE" ]; then
  echo -e "${BLUE}📁 Loading environment variables from .env${NC}"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo -e "${RED}❌ .env file not found at ${ENV_FILE}${NC}"
  exit 1
fi

# Check if Docker containers are running
if ! docker ps | grep -q nallo-postgres; then
  echo -e "${RED}❌ PostgreSQL container is not running. Please run 'docker compose up -d' first.${NC}"
  exit 1
fi

if ! docker ps | grep -q nallo-neo4j; then
  echo -e "${RED}❌ Neo4j container is not running. Please run 'docker compose up -d' first.${NC}"
  exit 1
fi

# PostgreSQL Setup
echo -e "${BLUE}📊 Setting up PostgreSQL...${NC}"

# Wait for PostgreSQL to be ready (using docker exec)
until docker exec nallo-postgres pg_isready -U "${POSTGRES_USER}" -d postgres > /dev/null 2>&1; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Create database if it doesn't exist
docker exec nallo-postgres psql -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE ${POSTGRES_DB};" 2>/dev/null || echo "Database '${POSTGRES_DB}' already exists"

# Create tables
docker exec -i nallo-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<EOF
-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID UNIQUE NOT NULL,
    content TEXT NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_document_id ON documents(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'end_user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
EOF

echo -e "${GREEN}✅ PostgreSQL schema initialized${NC}"

# Neo4j Setup
echo -e "${BLUE}🕸️  Setting up Neo4j...${NC}"

# Wait for Neo4j to be ready
until docker exec nallo-neo4j cypher-shell -u "${NEO4J_USER}" -p "${NEO4J_PASSWORD}" "RETURN 1" > /dev/null 2>&1; do
  echo "⏳ Waiting for Neo4j to be ready..."
  sleep 2
done

echo -e "${GREEN}✅ Neo4j is ready${NC}"

# Create indexes
docker exec nallo-neo4j cypher-shell -u "${NEO4J_USER}" -p "${NEO4J_PASSWORD}" <<EOF
// Create indexes for better query performance
CREATE INDEX document_id_index IF NOT EXISTS FOR (d:Document) ON (d.id);
CREATE INDEX concept_id_index IF NOT EXISTS FOR (c:Concept) ON (c.id);
CREATE INDEX version_id_index IF NOT EXISTS FOR (v:Version) ON (v.id);
CREATE INDEX page_id_index IF NOT EXISTS FOR (p:Page) ON (p.id);
EOF

echo -e "${GREEN}✅ Neo4j indexes created${NC}"

echo -e "${GREEN}🎉 Database initialization complete!${NC}"
