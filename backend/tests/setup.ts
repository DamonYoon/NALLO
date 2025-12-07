// Jest setup file for test configuration
// This file runs before all tests

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = 'test-secret-key';
process.env.GRAPHDB_URI = 'bolt://localhost:7687';
process.env.POSTGRES_HOST = 'localhost';

// Global test utilities can be added here

