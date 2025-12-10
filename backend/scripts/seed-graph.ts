#!/usr/bin/env ts-node
/**
 * GraphDB Seed Script
 * Creates test data for development and testing
 *
 * Usage:
 *   npm run seed              # Create seed data
 *   npm run seed -- --reset   # Clear existing data and create seed data
 *
 * Per Constitution Principle VI: No hardcoding - uses constants for seed data
 */

import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import neo4j, { Session } from 'neo4j-driver';

// Load .env file from backend directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

if (!NEO4J_PASSWORD) {
  console.error('❌ NEO4J_PASSWORD environment variable is required');
  console.error('   Please set it in your .env file or environment');
  process.exit(1);
}

// Type assertion after validation
const config = {
  uri: NEO4J_URI,
  user: NEO4J_USER,
  password: NEO4J_PASSWORD as string,
};

// Parse command line arguments
const args = process.argv.slice(2);
const shouldReset = args.includes('--reset') || args.includes('-r');

// ============================================================================
// SEED DATA CONSTANTS
// ============================================================================

const SEED_DOCUMENTS = [
  {
    title: 'API 인증 가이드',
    type: 'tutorial',
    status: 'publish',
    lang: 'ko',
    summary: 'API 인증 방법에 대한 종합 가이드',
  },
  {
    title: 'REST API 개요',
    type: 'api',
    status: 'publish',
    lang: 'ko',
    summary: 'REST API의 기본 개념과 엔드포인트 설명',
  },
  {
    title: '시작하기',
    type: 'tutorial',
    status: 'publish',
    lang: 'ko',
    summary: 'NALLO 플랫폼 시작 가이드',
  },
  {
    title: 'Web3 통합 가이드',
    type: 'general',
    status: 'draft',
    lang: 'ko',
    summary: 'Web3 기술 통합 방법',
  },
  {
    title: '블록체인 기초',
    type: 'tutorial',
    status: 'in_review',
    lang: 'ko',
    summary: '블록체인 기술의 기초 개념',
  },
  {
    title: 'Webhook 설정',
    type: 'general',
    status: 'publish',
    lang: 'ko',
    summary: 'Webhook 구성 및 보안 가이드',
  },
  {
    title: 'GraphQL API 레퍼런스',
    type: 'api',
    status: 'done',
    lang: 'ko',
    summary: 'GraphQL API 상세 문서',
  },
  {
    title: 'SDK 설치 가이드',
    type: 'tutorial',
    status: 'publish',
    lang: 'ko',
    summary: '다양한 언어별 SDK 설치 방법',
  },
  {
    title: '에러 핸들링',
    type: 'general',
    status: 'publish',
    lang: 'ko',
    summary: 'API 에러 코드 및 처리 방법',
  },
  {
    title: 'Rate Limiting 정책',
    type: 'api',
    status: 'publish',
    lang: 'ko',
    summary: 'API 호출 제한 정책 설명',
  },
];

const SEED_CONCEPTS = [
  { term: 'API Key', description: '개발자 인증을 위한 고유 식별자', lang: 'ko' },
  { term: 'Authentication', description: '사용자 신원 확인 및 인증 프로세스', lang: 'ko' },
  { term: 'Token', description: '인증 및 권한 부여를 위한 디지털 키', lang: 'ko' },
  { term: 'Smart Contract', description: '블록체인에서 자동 실행되는 계약 코드', lang: 'ko' },
  { term: 'Endpoint', description: 'API 리소스에 접근하기 위한 URL', lang: 'ko' },
  { term: 'Webhook', description: '이벤트 기반 실시간 데이터 전송 방식', lang: 'ko' },
  { term: 'Rate Limiting', description: 'API 호출 횟수 제한 정책', lang: 'ko' },
  { term: 'JSON Response', description: 'API 응답 데이터의 표준 형식', lang: 'ko' },
];

const SEED_TAGS = [
  { name: 'API', color: '#3B82F6', description: 'API 관련 문서' },
  { name: 'Tutorial', color: '#10B981', description: '튜토리얼 및 가이드' },
  { name: 'Guide', color: '#8B5CF6', description: '사용 가이드' },
  { name: 'Blockchain', color: '#F59E0B', description: '블록체인 기술' },
  { name: 'Web3', color: '#EC4899', description: 'Web3 기술' },
  { name: 'Security', color: '#EF4444', description: '보안 관련' },
];

const SEED_VERSION = {
  version: 'v1.0.0',
  name: 'Initial Release',
  description: '첫 번째 공식 릴리스',
  is_public: true,
  is_main: true,
};

const SEED_PAGES = [
  { slug: 'getting-started', title: 'Getting Started', order: 1, visible: true },
  { slug: 'api-reference', title: 'API Reference', order: 2, visible: true },
  { slug: 'tutorials', title: 'Tutorials', order: 3, visible: true },
  { slug: 'concepts', title: 'Concepts', order: 4, visible: true },
  { slug: 'faq', title: 'FAQ', order: 5, visible: true },
];

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

async function clearDatabase(session: Session): Promise<void> {
  console.log('🗑️  Clearing existing data...');
  await session.run('MATCH (n) DETACH DELETE n');
  console.log('✅ Database cleared');
}

async function createDocuments(session: Session): Promise<string[]> {
  console.log('📄 Creating documents...');
  const ids: string[] = [];

  for (const doc of SEED_DOCUMENTS) {
    const id = uuidv4();
    ids.push(id);

    await session.run(
      `CREATE (d:Document {
        id: $id,
        title: $title,
        type: $type,
        status: $status,
        lang: $lang,
        storage_key: $storage_key,
        summary: $summary,
        created_at: datetime(),
        updated_at: datetime()
      })`,
      {
        id,
        ...doc,
        storage_key: `documents/${id}.json`,
      }
    );
    console.log(`  ✓ ${doc.title}`);
  }

  return ids;
}

async function createConcepts(session: Session): Promise<string[]> {
  console.log('📚 Creating concepts...');
  const ids: string[] = [];

  for (const concept of SEED_CONCEPTS) {
    const id = uuidv4();
    ids.push(id);

    await session.run(
      `CREATE (c:Concept {
        id: $id,
        term: $term,
        description: $description,
        lang: $lang,
        created_at: datetime(),
        updated_at: datetime()
      })`,
      { id, ...concept }
    );
    console.log(`  ✓ ${concept.term}`);
  }

  return ids;
}

async function createTags(session: Session): Promise<string[]> {
  console.log('🏷️  Creating tags...');
  const ids: string[] = [];

  for (const tag of SEED_TAGS) {
    const id = uuidv4();
    ids.push(id);

    await session.run(
      `CREATE (t:Tag {
        id: $id,
        name: $name,
        color: $color,
        description: $description,
        created_at: datetime(),
        updated_at: datetime()
      })`,
      { id, ...tag }
    );
    console.log(`  ✓ ${tag.name}`);
  }

  return ids;
}

async function createVersion(session: Session): Promise<string> {
  console.log('📦 Creating version...');
  const id = uuidv4();

  await session.run(
    `CREATE (v:Version {
      id: $id,
      version: $version,
      name: $name,
      description: $description,
      is_public: $is_public,
      is_main: $is_main,
      created_at: datetime(),
      updated_at: datetime()
    })`,
    { id, ...SEED_VERSION }
  );
  console.log(`  ✓ ${SEED_VERSION.name}`);

  return id;
}

async function createPages(session: Session, versionId: string): Promise<string[]> {
  console.log('📑 Creating pages...');
  const ids: string[] = [];

  for (const page of SEED_PAGES) {
    const id = uuidv4();
    ids.push(id);

    await session.run(
      `CREATE (p:Page {
        id: $id,
        slug: $slug,
        title: $title,
        order: $order,
        visible: $visible,
        created_at: datetime(),
        updated_at: datetime()
      })
      WITH p
      MATCH (v:Version {id: $version_id})
      CREATE (p)-[:IN_VERSION]->(v)`,
      { id, version_id: versionId, ...page, order: neo4j.int(page.order) }
    );
    console.log(`  ✓ ${page.title}`);
  }

  return ids;
}

async function createRelationships(
  session: Session,
  documentIds: string[],
  conceptIds: string[],
  tagIds: string[],
  pageIds: string[]
): Promise<void> {
  console.log('🔗 Creating relationships...');

  // Document-Concept relationships (USES_CONCEPT)
  console.log('  📄➡️📚 USES_CONCEPT relationships...');
  const docConceptPairs = [
    [0, 0],
    [0, 1],
    [0, 2], // API 인증 가이드 -> API Key, Authentication, Token
    [1, 4],
    [1, 7], // REST API 개요 -> Endpoint, JSON Response
    [2, 0],
    [2, 1], // 시작하기 -> API Key, Authentication
    [3, 3],
    [3, 2], // Web3 통합 가이드 -> Smart Contract, Token
    [4, 3], // 블록체인 기초 -> Smart Contract
    [5, 5], // Webhook 설정 -> Webhook
    [6, 4],
    [6, 7], // GraphQL API -> Endpoint, JSON Response
    [7, 0], // SDK 설치 가이드 -> API Key
    [8, 7], // 에러 핸들링 -> JSON Response
    [9, 6], // Rate Limiting 정책 -> Rate Limiting
  ];

  for (const [docIdx, conceptIdx] of docConceptPairs) {
    await session.run(
      `MATCH (d:Document {id: $doc_id}), (c:Concept {id: $concept_id})
       MERGE (d)-[:USES_CONCEPT]->(c)`,
      { doc_id: documentIds[docIdx], concept_id: conceptIds[conceptIdx] }
    );
  }
  console.log(`    ✓ Created ${docConceptPairs.length} USES_CONCEPT relationships`);

  // Document-Document relationships (LINKS_TO)
  console.log('  📄➡️📄 LINKS_TO relationships...');
  const docDocPairs = [
    [0, 1], // API 인증 가이드 -> REST API 개요
    [2, 0], // 시작하기 -> API 인증 가이드
    [2, 7], // 시작하기 -> SDK 설치 가이드
    [3, 4], // Web3 통합 가이드 -> 블록체인 기초
    [5, 8], // Webhook 설정 -> 에러 핸들링
    [9, 1], // Rate Limiting 정책 -> REST API 개요
  ];

  for (const [sourceIdx, targetIdx] of docDocPairs) {
    await session.run(
      `MATCH (s:Document {id: $source_id}), (t:Document {id: $target_id})
       MERGE (s)-[:LINKS_TO]->(t)`,
      { source_id: documentIds[sourceIdx], target_id: documentIds[targetIdx] }
    );
  }
  console.log(`    ✓ Created ${docDocPairs.length} LINKS_TO relationships`);

  // Document-Tag relationships (HAS_TAG)
  console.log('  📄➡️🏷️ HAS_TAG relationships...');
  const docTagPairs = [
    [0, 0],
    [0, 2],
    [0, 5], // API 인증 가이드 -> API, Guide, Security
    [1, 0], // REST API 개요 -> API
    [2, 1],
    [2, 2], // 시작하기 -> Tutorial, Guide
    [3, 4],
    [3, 2], // Web3 통합 가이드 -> Web3, Guide
    [4, 3],
    [4, 1], // 블록체인 기초 -> Blockchain, Tutorial
    [5, 0],
    [5, 5], // Webhook 설정 -> API, Security
    [6, 0], // GraphQL API -> API
    [7, 1],
    [7, 2], // SDK 설치 가이드 -> Tutorial, Guide
    [8, 0], // 에러 핸들링 -> API
    [9, 0], // Rate Limiting 정책 -> API
  ];

  for (const [docIdx, tagIdx] of docTagPairs) {
    await session.run(
      `MATCH (d:Document {id: $doc_id}), (t:Tag {id: $tag_id})
       MERGE (d)-[:HAS_TAG]->(t)`,
      { doc_id: documentIds[docIdx], tag_id: tagIds[tagIdx] }
    );
  }
  console.log(`    ✓ Created ${docTagPairs.length} HAS_TAG relationships`);

  // Page-Document relationships (DISPLAYS)
  console.log('  📑➡️📄 DISPLAYS relationships...');
  const pageDocPairs = [
    [0, 2], // Getting Started -> 시작하기
    [1, 1],
    [1, 6],
    [1, 9], // API Reference -> REST API, GraphQL, Rate Limiting
    [2, 0],
    [2, 7], // Tutorials -> API 인증 가이드, SDK 설치
    [3, 4],
    [3, 3], // Concepts -> 블록체인 기초, Web3 통합
    [4, 8], // FAQ -> 에러 핸들링
  ];

  for (const [pageIdx, docIdx] of pageDocPairs) {
    await session.run(
      `MATCH (p:Page {id: $page_id}), (d:Document {id: $doc_id})
       MERGE (p)-[:DISPLAYS]->(d)`,
      { page_id: pageIds[pageIdx], doc_id: documentIds[docIdx] }
    );
  }
  console.log(`    ✓ Created ${pageDocPairs.length} DISPLAYS relationships`);

  // Concept-Concept relationships (SUBTYPE_OF)
  console.log('  📚➡️📚 SUBTYPE_OF relationships...');
  await session.run(
    `MATCH (child:Concept {id: $child_id}), (parent:Concept {id: $parent_id})
     MERGE (child)-[:SUBTYPE_OF]->(parent)`,
    { child_id: conceptIds[0], parent_id: conceptIds[1] } // API Key is subtype of Authentication
  );
  await session.run(
    `MATCH (child:Concept {id: $child_id}), (parent:Concept {id: $parent_id})
     MERGE (child)-[:SUBTYPE_OF]->(parent)`,
    { child_id: conceptIds[2], parent_id: conceptIds[1] } // Token is subtype of Authentication
  );
  console.log(`    ✓ Created 2 SUBTYPE_OF relationships`);

  console.log('✅ All relationships created');
}

async function printStats(session: Session): Promise<void> {
  console.log('\n📊 Seed Data Statistics:');

  const nodeCountResult = await session.run(`
    CALL {
      MATCH (d:Document) RETURN 'Documents' as type, count(d) as cnt
      UNION ALL
      MATCH (c:Concept) RETURN 'Concepts' as type, count(c) as cnt
      UNION ALL
      MATCH (t:Tag) RETURN 'Tags' as type, count(t) as cnt
      UNION ALL
      MATCH (p:Page) RETURN 'Pages' as type, count(p) as cnt
      UNION ALL
      MATCH (v:Version) RETURN 'Versions' as type, count(v) as cnt
    }
    RETURN type, cnt
  `);

  console.log('  Nodes:');
  for (const record of nodeCountResult.records) {
    const type = record.get('type');
    const cnt = record.get('cnt').toNumber();
    console.log(`    ${type}: ${cnt}`);
  }

  const edgeCountResult = await session.run(`
    MATCH ()-[r]->()
    RETURN type(r) as type, count(r) as cnt
    ORDER BY cnt DESC
  `);

  console.log('  Relationships:');
  for (const record of edgeCountResult.records) {
    const type = record.get('type');
    const cnt = record.get('cnt').toNumber();
    console.log(`    ${type}: ${cnt}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main(): Promise<void> {
  console.log('🚀 NALLO GraphDB Seed Script');
  console.log('============================');
  console.log(`URI: ${config.uri}`);
  console.log(`Reset mode: ${shouldReset ? 'YES' : 'NO'}`);
  console.log('');

  const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
  const session = driver.session();

  try {
    // Verify connection
    await session.run('RETURN 1');
    console.log('✅ Connected to Neo4j\n');

    // Clear if reset mode
    if (shouldReset) {
      await clearDatabase(session);
      console.log('');
    }

    // Create nodes
    const documentIds = await createDocuments(session);
    console.log('');

    const conceptIds = await createConcepts(session);
    console.log('');

    const tagIds = await createTags(session);
    console.log('');

    const versionId = await createVersion(session);
    console.log('');

    const pageIds = await createPages(session, versionId);
    console.log('');

    // Create relationships
    await createRelationships(session, documentIds, conceptIds, tagIds, pageIds);

    // Print statistics
    await printStats(session);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nYou can now test the Graph API at:');
    console.log('  GET /api/v1/graph/nodes');
    console.log('  GET /api/v1/graph/edges');
    console.log('  GET /api/v1/graph/stats');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await session.close();
    await driver.close();
  }
}

main();
