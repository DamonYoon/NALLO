import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Database Configuration
  NEO4J_URI: z.string().url().default('bolt://localhost:7687'),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().min(1),

  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  // MinIO Configuration
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_NAME: z.string().default('nallo-files'),

  // JWT Configuration
  JWT_SECRET_KEY: z.string().min(32),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  JWT_EXPIRATION_HOURS: z.coerce.number().default(24),

  // Application Configuration
  API_V1_PREFIX: z.string().default('/api/v1'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // TypeORM Configuration (if using TypeORM)
  TYPEORM_SYNCHRONIZE: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  TYPEORM_LOGGING: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    // Prepare environment variables with test defaults if needed
    const env = { ...process.env };

    // In test environment, provide defaults for missing required variables
    if (process.env.NODE_ENV === 'test') {
      if (!env.NEO4J_PASSWORD) env.NEO4J_PASSWORD = 'test_password';
      if (!env.POSTGRES_DB) env.POSTGRES_DB = 'nallo_test';
      if (!env.POSTGRES_USER) env.POSTGRES_USER = 'test_user';
      if (!env.POSTGRES_PASSWORD) env.POSTGRES_PASSWORD = 'test_password';
      if (!env.JWT_SECRET_KEY || env.JWT_SECRET_KEY.length < 32) {
        env.JWT_SECRET_KEY = 'test-secret-key-minimum-32-characters-long-for-jwt-validation';
      }
    }

    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // In test environment, don't exit - just log warning
      if (process.env.NODE_ENV === 'test') {
        console.warn(
          '⚠️  Test environment: Some environment variables are invalid, using defaults'
        );
        // Return with test defaults
        return envSchema.parse({
          NEO4J_URI: 'bolt://localhost:7687',
          NEO4J_USER: 'neo4j',
          NEO4J_PASSWORD: 'test_password',
          POSTGRES_HOST: 'localhost',
          POSTGRES_PORT: 5432,
          POSTGRES_DB: 'nallo_test',
          POSTGRES_USER: 'test_user',
          POSTGRES_PASSWORD: 'test_password',
          MINIO_ENDPOINT: 'localhost',
          MINIO_PORT: 9000,
          MINIO_USE_SSL: 'false',
          MINIO_ACCESS_KEY: 'minioadmin',
          MINIO_SECRET_KEY: 'minioadmin',
          MINIO_BUCKET_NAME: 'nallo-files-test',
          JWT_SECRET_KEY: 'test-secret-key-minimum-32-characters-long-for-jwt-validation',
          JWT_ALGORITHM: 'HS256',
          JWT_EXPIRATION_HOURS: 24,
          API_V1_PREFIX: '/api/v1',
          NODE_ENV: 'test',
          PORT: 3000,
          LOG_LEVEL: 'info',
          TYPEORM_SYNCHRONIZE: 'false',
          TYPEORM_LOGGING: 'false',
        });
      }
      console.error('❌ Invalid environment variables:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

// Export typed configuration
export type Config = typeof config;
