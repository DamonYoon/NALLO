# API 테스트 예제

NALLO Backend API 테스트를 위한 curl 명령어 모음입니다.

## 📋 목차

- [사전 준비](#사전-준비)
- [Health Check](#health-check)
- [Document API](#document-api)
- [Attachment API](#attachment-api)

---

## 사전 준비

### 서버 실행

```bash
# 1. Docker 컨테이너 시작
docker-compose up -d

# 2. 데이터베이스 초기화
./scripts/init-databases.sh

# 3. 서버 실행
npm run dev
```

### 기본 URL

```bash
BASE_URL="http://localhost:3000"
API_URL="http://localhost:3000/api/v1"
```

---

## Health Check

### 시스템 상태 확인

```bash
curl http://localhost:3000/health | jq .
```

**예상 응답:**

```json
{
  "status": "healthy",
  "graphdb": { "status": "connected" },
  "postgresql": { "status": "connected" }
}
```

### API 정보 확인

```bash
curl http://localhost:3000/api/v1 | jq .
```

---

## Document API

### 1. 문서 생성 (POST)

```bash
# 기본 문서 생성
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started Guide",
    "type": "tutorial",
    "content": "# Getting Started\n\nWelcome to NALLO!",
    "lang": "en"
  }' | jq .

# 한국어 API 문서 생성
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 레퍼런스",
    "type": "api",
    "content": "# API Reference\n\n## 인증\n\nAPI 키를 사용합니다.",
    "lang": "ko"
  }' | jq .

# 일반 문서 생성
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "일반 문서",
    "type": "general",
    "content": "# 일반 문서 내용",
    "lang": "ko"
  }' | jq .
```

**type 옵션:** `general`, `api`, `tutorial`
**lang 옵션:** `ko`, `en`, `ja` 등 ISO 639-1 코드

### 2. 문서 조회 (GET)

```bash
# ID로 조회 (ID를 실제 값으로 교체)
curl http://localhost:3000/api/v1/documents/{document_id} | jq .

# 예시
curl http://localhost:3000/api/v1/documents/78074c4f-4c63-475c-9eb7-187d4d9fe747 | jq .
```

### 3. 문서 목록 조회 (GET)

```bash
# 기본 목록 조회
curl "http://localhost:3000/api/v1/documents?limit=10&offset=0" | jq .

# 타입별 필터링
curl "http://localhost:3000/api/v1/documents?type=api" | jq .

# 상태별 필터링
curl "http://localhost:3000/api/v1/documents?status=draft" | jq .

# 언어별 필터링
curl "http://localhost:3000/api/v1/documents?lang=ko" | jq .

# 복합 필터링
curl "http://localhost:3000/api/v1/documents?type=api&lang=ko&status=draft&limit=5" | jq .
```

**status 옵션:** `draft`, `in_review`, `done`, `publish`

### 4. 문서 수정 (PUT)

```bash
# 제목만 수정
curl -X PUT http://localhost:3000/api/v1/documents/{document_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목"
  }' | jq .

# 내용만 수정
curl -X PUT http://localhost:3000/api/v1/documents/{document_id} \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 수정된 내용\n\n새로운 내용입니다."
  }' | jq .

# 제목과 내용 동시 수정
curl -X PUT http://localhost:3000/api/v1/documents/{document_id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 제목",
    "content": "# 수정된 내용"
  }' | jq .

# 상태 변경 (draft → in_review)
curl -X PUT http://localhost:3000/api/v1/documents/{document_id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_review"
  }' | jq .
```

**상태 전환 규칙:**

- `draft` → `in_review`
- `in_review` → `done` 또는 `draft`
- `done` → `publish`
- `publish` → `draft`

### 5. 문서 삭제 (DELETE)

```bash
curl -X DELETE http://localhost:3000/api/v1/documents/{document_id}
# 성공 시 HTTP 204 (No Content)

# 삭제 확인 (404 예상)
curl http://localhost:3000/api/v1/documents/{document_id} | jq .
```

---

## Attachment API

### 1. 파일 업로드 (POST)

```bash
# 이미지 업로드
curl -X POST http://localhost:3000/api/v1/attachments \
  -F "file=@/path/to/image.png" | jq .

# 문서에 연결된 파일 업로드
curl -X POST http://localhost:3000/api/v1/attachments \
  -F "file=@/path/to/file.pdf" \
  -F "document_id={document_id}" | jq .

# 마크다운 파일 업로드
curl -X POST http://localhost:3000/api/v1/attachments \
  -F "file=@/path/to/document.md" | jq .

# JSON/YAML (OAS) 파일 업로드
curl -X POST http://localhost:3000/api/v1/attachments \
  -F "file=@/path/to/openapi.yaml" | jq .
```

**지원 파일 형식:**

- 이미지: `jpeg`, `png`, `gif`, `webp`, `svg`
- 문서: `pdf`, `txt`
- 마크다운: `md`
- OAS/API: `json`, `yaml`

**최대 파일 크기:** 10MB

### 2. 첨부파일 조회 (GET)

```bash
# 메타데이터만 조회
curl http://localhost:3000/api/v1/attachments/{attachment_id} | jq .

# 다운로드 URL 포함 조회
curl "http://localhost:3000/api/v1/attachments/{attachment_id}?include_download_url=true" | jq .
```

### 3. 파일 다운로드 (GET)

```bash
# 파일 다운로드
curl http://localhost:3000/api/v1/attachments/{attachment_id}/download -o downloaded-file.png

# 다운로드 후 확인
ls -la downloaded-file.png
```

### 4. 첨부파일 목록 조회 (GET)

```bash
# 전체 목록
curl "http://localhost:3000/api/v1/attachments?limit=10&offset=0" | jq .

# 타입별 필터링
curl "http://localhost:3000/api/v1/attachments?attachment_type=image" | jq .

# 문서별 필터링
curl "http://localhost:3000/api/v1/attachments?document_id={document_id}" | jq .
```

**attachment_type 옵션:** `image`, `document`, `oas`, `markdown`, `other`

### 5. 첨부파일 삭제 (DELETE)

```bash
curl -X DELETE http://localhost:3000/api/v1/attachments/{attachment_id}
# 성공 시 HTTP 204 (No Content)
```

### 6. 파일 검증 규칙 조회 (GET)

```bash
curl http://localhost:3000/api/v1/attachments/validation-rules | jq .
```

---

## 🧪 통합 테스트 스크립트

전체 API를 순차적으로 테스트하는 스크립트입니다.

```bash
#!/bin/bash
# test-all-apis.sh

echo "=== Document API 테스트 ==="

# 문서 생성
echo "1. 문서 생성"
DOC_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Doc", "type": "general", "content": "# Test", "lang": "ko"}')
DOC_ID=$(echo $DOC_RESPONSE | jq -r '.id')
echo "생성된 문서 ID: $DOC_ID"

# 문서 조회
echo "2. 문서 조회"
curl -s http://localhost:3000/api/v1/documents/$DOC_ID | jq '{id, title, status}'

# 문서 수정
echo "3. 문서 수정"
curl -s -X PUT http://localhost:3000/api/v1/documents/$DOC_ID \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Test Doc"}' | jq '{id, title}'

# 문서 목록
echo "4. 문서 목록"
curl -s "http://localhost:3000/api/v1/documents?limit=5" | jq '{total, count: (.items | length)}'

# 문서 삭제
echo "5. 문서 삭제"
curl -s -X DELETE http://localhost:3000/api/v1/documents/$DOC_ID -w "Status: %{http_code}\n"

echo ""
echo "=== Attachment API 테스트 ==="

# 테스트 파일 생성
echo "6. 테스트 파일 생성"
echo "Test content" > /tmp/test-file.txt

# 파일 업로드
echo "7. 파일 업로드"
ATT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/attachments \
  -F "file=@/tmp/test-file.txt")
ATT_ID=$(echo $ATT_RESPONSE | jq -r '.id')
echo "업로드된 첨부파일 ID: $ATT_ID"

# 첨부파일 조회
echo "8. 첨부파일 조회"
curl -s http://localhost:3000/api/v1/attachments/$ATT_ID | jq '{id, filename, mime_type}'

# 파일 다운로드
echo "9. 파일 다운로드"
curl -s http://localhost:3000/api/v1/attachments/$ATT_ID/download -o /tmp/downloaded.txt
cat /tmp/downloaded.txt

# 첨부파일 삭제
echo "10. 첨부파일 삭제"
curl -s -X DELETE http://localhost:3000/api/v1/attachments/$ATT_ID -w "Status: %{http_code}\n"

echo ""
echo "=== 테스트 완료 ==="
```

---

## 📌 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지",
    "details": {}
  }
}
```

**에러 코드:**

- `VALIDATION_ERROR` - 입력값 검증 실패 (400)
- `NOT_FOUND` - 리소스 없음 (404)
- `INVALID_STATUS_TRANSITION` - 잘못된 상태 전환 (400)
- `UNAUTHORIZED` - 인증 필요 (401)
- `FORBIDDEN` - 권한 없음 (403)
- `INTERNAL_SERVER_ERROR` - 서버 에러 (500)

---

## 🔗 참고 링크

- **MinIO Console**: http://localhost:9003 (minioadmin / minioadmin)
- **Neo4j Browser**: http://localhost:7474 (neo4j / 1234qwer)
- **API Docs** (예정): http://localhost:3000/api-docs
