# Quickstart: Admin Frontend UI

## Prerequisites

- `002-admin-frontend-foundation` 컴포넌트 개발 완료
- Figma 디자인 접근 권한
- Node.js 18+

## Getting Started

### 1. Figma 디자인 확인

Figma에서 디자인을 확인하고 필요한 노드 ID를 수집합니다.

### 2. 디자인 토큰 추출

Figma에서 다음 정보를 추출합니다:

- 색상 팔레트 (Primary, Secondary, Neutral, Semantic)
- 타이포그래피 스케일
- 스페이싱 스케일
- 그림자, 테두리 반경

### 3. 개발 서버 실행

```bash
cd admin-frontend
npm run dev
```

### 4. 작업 순서

1. **TASK-001**: 디자인 토큰을 `globals.css`에 설정
2. **TASK-002**: 메인 레이아웃 컴포넌트 구현
3. **TASK-003~008**: 페이지별 통합
4. **TASK-009~010**: 폴리시 및 QA

## Figma MCP 도구 사용

Cursor에서 Figma MCP 도구를 사용하여 디자인 정보를 가져올 수 있습니다:

```
# 현재 선택된 노드의 디자인 컨텍스트 가져오기
mcp_figma_get_design_context

# 특정 노드의 스크린샷 가져오기
mcp_figma_get_screenshot

# 변수 정의 가져오기 (색상 등)
mcp_figma_get_variable_defs
```

## 참고 사항

- Figma 코드는 최적화되지 않았으므로 **참고용**으로만 사용
- 기존 shadcn/ui 컴포넌트 구조 유지
- 새로운 컴포넌트가 필요한 경우 `002` 스펙에 추가

