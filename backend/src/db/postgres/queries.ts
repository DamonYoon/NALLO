/**
 * PostgreSQL query utilities
 * This file contains reusable SQL query templates for users
 *
 * Note: Document content is stored in MinIO (object storage)
 * Note: Attachment metadata is stored in GraphDB
 * GraphDB handles document metadata (id, title, status, etc.) and attachments
 * PostgreSQL handles user authentication only
 */

import { dataSource } from './connection';

// ============================================
// USER QUERIES (Future: Authentication)
// ============================================

/**
 * Create user
 */
export async function createUser(
  email: string,
  passwordHash: string,
  role: string = 'end_user'
): Promise<{ id: string; email: string; role: string }> {
  const query = `
    INSERT INTO users (email, password_hash, role)
    VALUES ($1, $2, $3)
    RETURNING id, email, role
  `;
  const result = await dataSource.query(query, [email, passwordHash, role]);
  return result[0];
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<{
  id: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
} | null> {
  const query = `
    SELECT id, email, password_hash, role, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const result = await dataSource.query(query, [email]);
  return result[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<{
  id: string;
  email: string;
  role: string;
  created_at: Date;
  updated_at: Date;
} | null> {
  const query = `
    SELECT id, email, role, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const result = await dataSource.query(query, [id]);
  return result[0] || null;
}

/**
 * Update user role
 */
export async function updateUserRole(id: string, role: string): Promise<boolean> {
  const query = `
    UPDATE users
    SET role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id
  `;
  const result = await dataSource.query(query, [role, id]);
  return result.length > 0;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<boolean> {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
  `;
  const result = await dataSource.query(query, [id]);
  return result.length > 0;
}
