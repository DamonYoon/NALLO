# 데이터베이스 연결 설정 가이드

이 가이드는 PostgreSQL과 Neo4j 데이터베이스를 설정하고 연결하는 방법을 설명합니다.

## 방법 1: Docker Compose 사용 (권장)

가장 간단한 방법입니다. Docker와 Docker Compose가 설치되어 있어야 합니다.

### 1단계: .env 파일 생성

`backend/` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Database Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=nallo
POSTGRES_USER=nallo_user
POSTGRES_PASSWORD=your_password

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Application Configuration
API_V1_PREFIX=/api/v1
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# TypeORM Configuration
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false
```

**⚠️ 중요**: 프로덕션 환경에서는 반드시 비밀번호와 JWT_SECRET_KEY를 변경하세요!

### 2단계: Docker Compose로 데이터베이스 시작

```bash
cd backend
docker compose up -d
```

이 명령은 다음을 실행합니다:

- PostgreSQL 14 컨테이너 시작 (포트 5432)
- Neo4j 5.14 컨테이너 시작 (포트 7474, 7687)

### 3단계: 데이터베이스 스키마 초기화

```bash
./scripts/init-databases.sh
```

또는 수동으로:

**PostgreSQL:**

```bash
# 데이터베이스 생성
createdb -U nallo_user nallo

# 또는 psql 사용
psql -U nallo_user -d postgres -c "CREATE DATABASE nallo;"

# 테이블 생성
psql -U nallo_user -d nallo -f scripts/postgres-schema.sql
```

**Neo4j:**

```bash
# Neo4j Browser에서 실행 (http://localhost:7474)
# 또는 cypher-shell 사용
docker exec -it nallo-neo4j cypher-shell -u neo4j -p your_password

# 인덱스 생성
CREATE INDEX document_id_index IF NOT EXISTS FOR (d:Document) ON (d.id);
CREATE INDEX concept_id_index IF NOT EXISTS FOR (c:Concept) ON (c.id);
CREATE INDEX version_id_index IF NOT EXISTS FOR (v:Version) ON (v.id);
CREATE INDEX page_id_index IF NOT EXISTS FOR (p:Page) ON (p.id);
```

### 4단계: 연결 확인

```bash
# Health check 엔드포인트로 확인
npm run dev
# 다른 터미널에서
curl http://localhost:3000/health
```

또는 테스트 실행:

```bash
npm test
```

## 방법 2: 로컬에 직접 설치

### PostgreSQL 설치 및 설정

**macOS (Homebrew):**

```bash
brew install postgresql@14
brew services start postgresql@14

# 데이터베이스 생성
createdb nallo
psql -d nallo -c "CREATE USER nallo_user WITH PASSWORD 'your_password';"
psql -d nallo -c "GRANT ALL PRIVILEGES ON DATABASE nallo TO nallo_user;"
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get update
sudo apt-get install postgresql-14

# 데이터베이스 생성
sudo -u postgres createdb nallo
sudo -u postgres psql -c "CREATE USER nallo_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nallo TO nallo_user;"
```

### Neo4j 설치 및 설정

**Neo4j Desktop 사용 (권장):**

1. https://neo4j.com/download/ 에서 Neo4j Desktop 다운로드
2. Neo4j Desktop에서 새 프로젝트 생성
3. 데이터베이스 시작
4. 연결 정보 확인 (기본: bolt://localhost:7687, 사용자: neo4j)

**또는 Docker로만 Neo4j 실행:**

```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  neo4j:5.14
```

## 연결 테스트

### 1. Health Check API

서버를 시작한 후:

```bash
npm run dev
```

다른 터미널에서:

```bash
curl http://localhost:3000/health
```

예상 응답:

```json
{
  "status": "healthy",
  "graphdb": {
    "status": "connected"
  },
  "postgresql": {
    "status": "connected"
  }
}
```

### 2. 직접 데이터베이스 연결 테스트

**PostgreSQL:**

```bash
psql -h localhost -U nallo_user -d nallo
# 비밀번호 입력 후
SELECT 1;
```

**Neo4j:**

```bash
# Neo4j Browser에서 (http://localhost:7474)
RETURN 1;

# 또는 cypher-shell
docker exec -it nallo-neo4j cypher-shell -u neo4j -p your_password
RETURN 1;
```

## 문제 해결

### PostgreSQL 연결 실패

1. PostgreSQL이 실행 중인지 확인:

   ```bash
   # Docker 사용 시
   docker ps | grep postgres

   # 로컬 설치 시
   brew services list | grep postgresql
   # 또는
   sudo systemctl status postgresql
   ```

2. 포트가 사용 중인지 확인:

   ```bash
   lsof -i :5432
   ```

3. .env 파일의 연결 정보 확인:
   - POSTGRES_HOST
   - POSTGRES_PORT
   - POSTGRES_USER
   - POSTGRES_PASSWORD
   - POSTGRES_DB

### Neo4j 연결 실패

1. Neo4j가 실행 중인지 확인:

   ```bash
   docker ps | grep neo4j
   ```

2. Neo4j Browser 접속 확인:
   - http://localhost:7474 에 접속 가능한지 확인

3. .env 파일의 연결 정보 확인:
   - NEO4J_URI (기본: bolt://localhost:7687)
   - NEO4J_USER (기본: neo4j)
   - NEO4J_PASSWORD

### 환경 변수 오류

`.env` 파일이 제대로 로드되지 않으면:

1. `.env` 파일이 `backend/` 디렉토리에 있는지 확인
2. 파일 이름이 정확히 `.env`인지 확인 (`.env.example` 아님)
3. 환경 변수 값이 올바른지 확인 (특히 JWT_SECRET_KEY는 32자 이상)

## 다음 단계

데이터베이스 연결이 완료되면:

1. Phase 3 (Document Management API) 구현 시작
2. API 엔드포인트 테스트
3. 데이터베이스 마이그레이션 설정 (TypeORM)

## 유용한 명령어

```bash
# Docker Compose 관리
docker-compose up -d          # 시작
docker-compose down           # 중지
docker-compose logs -f        # 로그 확인
docker-compose ps             # 상태 확인

# 데이터베이스 접속
psql -h localhost -U nallo_user -d nallo
docker exec -it nallo-neo4j cypher-shell -u neo4j -p your_password

# 데이터베이스 초기화 스크립트 실행
./scripts/init-databases.sh
```
