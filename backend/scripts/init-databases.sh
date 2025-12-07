#!/bin/bash

# Database initialization script
# This script sets up the initial database schemas

set -e

echo "🚀 Initializing databases..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PostgreSQL Setup
echo -e "${BLUE}📊 Setting up PostgreSQL...${NC}"

# Wait for PostgreSQL to be ready
until PGPASSWORD=your_password psql -h localhost -U nallo_user -d postgres -c '\q' 2>/dev/null; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

# Create database if it doesn't exist
PGPASSWORD=your_password psql -h localhost -U nallo_user -d postgres -c "CREATE DATABASE nallo;" 2>/dev/null || echo "Database 'nallo' already exists"

# Create tables
PGPASSWORD=your_password psql -h localhost -U nallo_user -d nallo <<EOF
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
until docker exec nallo-neo4j cypher-shell -u neo4j -p your_password "RETURN 1" 2>/dev/null; do
  echo "⏳ Waiting for Neo4j to be ready..."
  sleep 2
done

echo -e "${GREEN}✅ Neo4j is ready${NC}"

# Create indexes
docker exec nallo-neo4j cypher-shell -u neo4j -p your_password <<EOF
// Create indexes for better query performance
CREATE INDEX document_id_index IF NOT EXISTS FOR (d:Document) ON (d.id);
CREATE INDEX concept_id_index IF NOT EXISTS FOR (c:Concept) ON (c.id);
CREATE INDEX version_id_index IF NOT EXISTS FOR (v:Version) ON (v.id);
CREATE INDEX page_id_index IF NOT EXISTS FOR (p:Page) ON (p.id);
EOF

echo -e "${GREEN}✅ Neo4j indexes created${NC}"

echo -e "${GREEN}🎉 Database initialization complete!${NC}"
