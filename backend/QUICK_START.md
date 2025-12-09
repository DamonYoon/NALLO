# 빠른 시작 가이드

## 서버 실행 및 Health Check 테스트

### 1단계: 서버 실행

터미널에서 다음 명령어를 실행하세요:

```bash
cd backend
npm run dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:

```
[INFO] Server running on port 8000
```

### 2단계: Health Check 호출

서버가 실행 중인 상태에서 **새로운 터미널 창**을 열고 다음 명령어를 실행하세요:

#### 방법 1: curl 사용

```bash
curl http://localhost:8000/health
```

#### 방법 2: curl with JSON formatting (jq 필요)

```bash
curl http://localhost:8000/health | jq .
```

#### 방법 3: 브라우저에서 확인

브라우저에서 다음 URL을 열어보세요:

```
http://localhost:8000/health
```

### 예상 응답

데이터베이스가 정상적으로 연결되어 있다면:

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

데이터베이스 연결에 문제가 있다면:

```json
{
  "status": "unhealthy",
  "graphdb": {
    "status": "disconnected",
    "error": "Connection error message"
  },
  "postgresql": {
    "status": "disconnected",
    "error": "Connection error message"
  }
}
```

### 3단계: 서버 중지

서버를 중지하려면 서버가 실행 중인 터미널에서 `Ctrl + C`를 누르세요.

## 추가 테스트

### API 엔드포인트 확인

현재 사용 가능한 엔드포인트:

- `GET /health` - Health check
- `GET /api/v1` - API v1 정보 (준비 중)

```bash
# API v1 정보 확인
curl http://localhost:8000/api/v1
```

## 문제 해결

### 포트가 이미 사용 중인 경우

다른 프로세스가 8000번 포트를 사용하고 있다면:

1. `.env` 파일에서 `PORT=8001`로 변경
2. 서버 재시작
3. `http://localhost:8001/health`로 접속

### 데이터베이스 연결 실패

1. Docker Compose가 실행 중인지 확인:

   ```bash
   docker compose ps
   ```

2. 데이터베이스가 준비될 때까지 대기 (약 10-20초)

3. `.env` 파일의 데이터베이스 설정 확인

### 서버가 시작되지 않는 경우

1. 의존성이 설치되어 있는지 확인:

   ```bash
   npm install
   ```

2. TypeScript 컴파일 확인:

   ```bash
   npm run build
   ```

3. 로그 확인:
   - 서버 실행 시 표시되는 에러 메시지 확인
