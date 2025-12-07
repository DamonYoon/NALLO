> **Key Experience**
> 
> - **1. 문서를 작성한 것이 아니라, AI와 함께 지식을 구축한 것처럼 느껴지는 경험**
>     - AI가 문서 구조, 내용을 제안 및 보완
>     - 작성자의 부담 최소화 → 초기 입력 장벽 제거
>     - Knowledge Graph 구축을 최소로 노출하고 뒤에서 자동 생성됨
> - **2. 문서를 단순한 텍스트로 보지 않고, 서로 연결된 지식 그래프로 바라본다.**
>     - 문서 간 관계, 용어, 버전, 페이지가 자동으로 연결됨
>     - admin에게는 직관적인 graph view 제공
>     - end user에게는 graph는 최소한만 노출
>     - AI는 Graph 기반 context 활용 → 토큰 비용 감소, 추론 정확도 증가
> - **3. 문서를 검색하고 읽는 것이 아니라 문서와 대화(상호작용)하는 경험**
>     - 문서 기반 Q&A
>     - Context-aware chat (현재 페이지, 즐겨찾기, 드래그한 텍스트)
>     - 페이지 검색 + 의미 기반 탐색
>     - 필요시 Try It 등 API 실행도 함께 제공

## 문서 작성자 (Admin)

- 문서 작성 및 관리 `Document Node`
    - Import 기능
        - 마크다운, OAS 파일 업로드
    - 작성 전
        - 이전에 작성된 내용을 기반으로 어떤 문서를 작성하면 좋을지 AI 추천
    - 작성 중
        - type 선택으로 API 또는 일반 문서를 선택할 수 있게 함 (API 문서는 OAS파일로, 일반 문서로 md파일로 저장될 예정)
        - AI 문서 작성 보조
            - AI가 문맥 기반 단락 단위 추천(section suggestion) 제공
            - 기존 작성된 문서 기반으로 placeholder 추천  → 탭을 누르면 자동 완성
        - 문서가 처음 저장(Draft 저장)되는 시점에 Document 노드 생성
        - 사진, 영상 첨부시 Attachment 노드로 생성
    - 작성 완료시
        - 작성된 파일은 마크다운(.md) 또는 OAS(.yaml)로 저장
        - 기존 Document 노드의 내용/메타데이터 업데이트
        - 첨부된 Attachment 노드와 Document 노드와 relation 생성/갱신
        - 용어집에 추가할 새로운 단어를 추천해줌 → 사용자가 작성을 원하면 용어집 작성 단계로 이동
        - 기존에 작성했던 용어 중에서 해당 문서와 관련이 있어보이면 연결 추천 → 사용자가 선택 및 승인하면 기존 Concept 노드가 해당 Document 노드와 relation이 생김
        - 작성된 내용을 기반으로 연결할 용어(Concept 노드)를 추천해줌 → 연결에 대한 승인은 모두 작성자가 수행
    - 기존 문서를 수정할때
        - 어떤 페이지에 영향이 가는지 경고 (문서간 직접 링크 혹은 동일한 Concept 노드와 연결된 Document 노드가 있다면 영향도가 있다고 판단) → 이때 연결된 노드들을 graph view로 보여주면 좋을듯
        - 다른 페이지도 수정하면 좋을 것 같다고 추천하는 기능
        - 이미 publish 상태의 문서를 수정하면
            - 작업용 Document(Working Copy)를 생성
            - 원본 Document와 Working Copy Document는 `WORKING_COPY_OF` 로 연결
            - 작업이 완료되면 리뷰 후 "배포 문서에 반영하기"를 통해 Merge 진행
                - 원본 Document의 storage_key를 작업이 완료된 문서의 값으로 덮어쓰기
                - Working Copy Document는 merge 후 삭제하거나 보관 (히스토리 관리 목적)
    - 작성된 문서 관리할때
        - 문서 간의 연결성을 보여주는 graph view 제공
            - 필터링 기능
            - 노드, 엣지의 색상 선택
        - 연결이 안되어있는 문서를 토대로 필요한 용어 또는 문서 작성 추천
        - 문서 품질 관리 (AI 기반 문서 피드백, 검증)
            - 맞춤범/문체/톤 검사
            - 문서 간 용어 일관성 검사 (glossary 기반)
            - 중복 섹션 감지 (다른 문서에 동일한 내용 있으면 Block 생성 추천)
            - 문서간 링크 깨짐 검사
            - 외부 링크 검사 (404가 뜬다면 경고 메시지 제공)
            - 변경 사항 Diff + 요약 제공
- 문서 간 콘텐츠 블록 재사용 (추후 고도화 단계에서 추가)
    - 문서 내 일부 섹션을 여러 문서에서 재사용할 수 있음
- 용어집(Glossary) 작성 및 관리 `Concept Node`
    - 작성 전
        - 작성된 문서가 있다면
            - 문서들을 기반으로 작성하면 좋은 용어 추천
        - 작성된 문서가 없다면
            - 용어집 예시(더미데이터)를 보여줌
            - 용어집을 작성하면 어떤 기능을 추가로 할 수 있는지 보여주면 좋음
    - 작성 중
        - 용어 작성시 AI가 작성을 도와줌 (사용자가 노드 생성하는 코스트를 최대한 줄여줘야함)
    - 작성 완료시
        - 새로운 용어를 작성하면 DB에는 Concept 노드 생성
        - Graph view를 통해 작성자에게 뿌듯함 주기
    - 동의어 관리
        - 같은 언어 내에서 Concept 간 `SYNONYM_OF` 관계로 동의어 연결
        - ~~다른 언어의 동일 개념은 `TRANSLATION_OF` 관계로 연결~~
- 번역 관리 `TBD`
    - 설정한 언어로 AI 번역본 생성 → 생성 후 수정할 수 있음
    - 번역본은 별도의 Document 노드로 생성되며, 원문 Document와 `TRANSLATION_OF`로 연결
- 배포 관리
    - Public으로 오픈할 버전을 선택할 수 있음 (여러 버전을 동시에 public으로 둘 수 있음)
        - Version Node의 `is_public` 속성으로 관리
    - `/latest` 등 기본 경로에서 어떤 버전을 사용할지 설정
        - Version Node의 `is_main` 속성으로 관리 (동시에 하나만 true)
- 문서 버전 관리 `Version Node`
    - 문서 버전 생성시 Version 노드가 생성됨
- 페이지 관리 `Page Node`
    - Page 노드에서는 endpoint url 등의 페이지 관련 속성들 관리
    - Page 노드와 Document 노드 연결 (`Page -[:DISPLAYS]-> Document`)
    - Page 노드와 Version 노드 연결 (`Page -[:IN_VERSION]-> Version`)
    - 기존 문서 소비자들도 익숙한 상하 계층 구조로 페이지 구성 (Page - SubPage - …)
        - Page 노드 간의 관계로 설정 (`Page -[:CHILD_OF]-> Page`)
- 팀 관리 `TBD`
    - 공동 작업할 팀원 초대 (무조건 회원가입해야 팀 참여 가능)
    - 팀원 권한 관리 `RDB`
    - Draft / In Review / Done / Publish 워크플로우
        - Draft:
            - 외부 공개하지 않은 상태, 팀원들에게는 공유(단, Draft로 표시)
            - 작성자가 Reviewer 목록에서 설정된 최소인원만큼을 선택하여 리뷰 요청하면 In Review로 상태가 변경됨
        - In Review:
            - Reviewer에게 리뷰 요청이 들어간 상태
            - Reviewer: 기본 Reviewer를 지정해두고, 해당 Reviewer들은 Draft 문서들을 검수
        - Done:
            - 내부적으로 승인 완료된 상태
            - publish 권한이 있는 Admin이 배포를 하면 publish로 상태 변경
        - publish: 배포가 되어 외부에 공개되는 문서들
- SEO 관리 `TBD`
    - 페이지와 연결된 Concept 노드를 이용하여 SEO 메타데이터를 자동 생성함
    - 사용자가 자유롭게 수정 가능
- AI 채팅
    - Document 노드, Concept 노드를 기반으로 내 문서 작성에 관한 피드백 등의 대화를 이어갈 수 있음
- 그룹핑 `Tag Node`
    - Tag로 묶인 데이터를 AI Context로 활용
    - 예시: 처음 Nodit을 사용해보는 사람이 랜딩페이지에 접근하면 #Beginner로 묶인 Document, Page, Concept를 기반으로 추천 페이지를 가져옴
- Metrics `TBD`
    - 페이지 뷰 수: 전체, 버전별, 문서별, 기간별
    - Unique 방문자 수: user 기분/anonymous session 기준
    - 평균 체류 시간
    - 이탈률
- 사이트 구성 (GUI)
    - 사이트 전역 설정
        - 어떤 Version을 공개할지
    - 네비게이션/GNB 구성
        - 최상위 메뉴: 랜딩 페이지, Guides, API Reference, ChangeLog, Tutorials, …
        - 각 메뉴 아래 Page 계층: Page - SubPage - …
        - 각 페이지가 어떤 Document를 보여줄지 매핑
    - 랜딩 페이지 레이아웃 구성
        - 미리 정의된 컴포넌트 끌어다 놓기
- API 문서 페이지
    - OAS 파일을 변환하여 읽기 쉬운 GUI로 보여줌
        - 자주 사용되는 필드, 파라미터는 component로 정의(`Block Node`)해서 재사용 가능
        - oneOf, allOf, default, examples 등의 OAS 속성을 최대한 지원
        - 예시 이미지
            
            ![image.png](attachment:7c2fc91e-afe5-4993-9bf8-783ed74aab79:image.png)
            
    - Try it 기능
        - 해당 페이지에서 직접 API call 시도 가능
        - admin이 지정한 언어에서 API 호출 예제 코드 작성
        - 예시 이미지
            
            
            ![image.png](attachment:3211f758-320e-47f4-9931-f58b056404bc:image.png)
            
            ![image.png](attachment:f2bfaa50-8946-4f64-84e3-07f703515832:image.png)
            
- 그 외 하면 좋을 것 같은 기능들 `TBD`
    - 사용자의 AI 채팅 히스토리 기반으로 FAQ 작성 보조

---

## 문서 소비자 (End user)

- 문서 열람
    - 문서 버전 선택 (문서 버전을 admin에서 오픈한 경우만)
    - 문서 보기
        - 문서 페이지 UI
        - Markdown 문서 랜더링
        - API 문서 랜더링
        - API Try it 기능
        - admin이 설정한 언어의 API 호출 예제 코드 포함
        - 문서 내 코드블록, 예제, 이미지, 영상 표시
    - 페이지 네비게이션
        - 좌측 네비게이션 트리 (Page - SubPage - …)
        - 문서 내부 목차
    - 다국어/번역 지원 `TBD`
        - 언어 전환 (admin에서 언어 설정한 경우)
        - AI로 번역하기 (admin이 선택한 언어로 문서를 작성하지 않은 경우)
- 검색 (페이지만 찾을 수 있음)
    - 제목, 본문, 태그, Concept 기반으로 탐색하여 관련성이 높은 순으로 페이지 목록을 반환
- AI 채팅창 (publish된 문서의 내용을 토대로 답변을 제공)
    - 자연어 질문으로 문서 기반 답변 제공
    - 온라인 검색 허용 토글 버튼: On 되면 탐색한 노드 정보와 외부 검색을 함께 사용하여 답변 제공
    - 특정 커맨드(e.g. `/`, `@`, ...)로 즐겨찾기, 나만의 노트를 context로 주입
    - Context 주입 추천 (즐겨찾기, 최근 본 문서 등)
    - 내가 보고 있는 페이지에서 채팅장을 연 경우,
        - 자동으로 해당 문서가 context로 주입됨
        - 페이지에서 드래그로 선택한 텍스트를 context에 자동 주입
- 즐겨찾기
    - 사용자가 원하는 페이지를 즐겨찾기로 등록 가능
    - 등록된 즐겨찾기를 AI 채팅에서 Context로 주입할 수 있음
- 나만의 노트 (외부 공유 안됨)
    - 직접 Markdown으로 노트를 작성
    - AI 채팅창에 context로 주입 가능
- 최근 본 문서 (최근 10개 문서만)
- 문서 피드백 기능
    - 페이지 피드백
        - 이 문서가 도움이 되었나요? (Yes / No)
        - 개선 의견 작성
    - 문서 에러 신고
        - 오탈자 신고
        - API 문서 내 스키마/예제 오류 신고
    - ~~피드백, 신고를 위한 보상 제도..Token?~~

# User flow

## 문서 작성자 (Admin)

- Mermaid Code
    
    ```mermaid
    flowchart TD
    
        %% 시작
        start([시작])
        start --> dashboard[관리자 워크스페이스 화면]
    
        %% 글로벌 버전 상태와 드롭다운
        dashboard --> versionSwitcher[현재 선택된 버전 표시 메인 버전이 기본 선택]
        versionSwitcher --> versionChoice{다른 버전으로 변경할지 선택}
        versionChoice --> keepVersion[현재 버전을 그대로 사용]
        versionChoice --> changeVersion[버전 드롭다운에서 다른 버전 선택]
        changeVersion --> versionApply[선택한 버전을 현재 버전으로 설정]
        keepVersion --> action[현재 버전 기준 작업 선택]
        versionApply --> action
    
        %% 최상위 액션 선택
        action --> newDoc[새 문서 작성 선택]
        action --> editDoc[기존 문서 수정 선택]
        action --> glossary[용어집 관리 선택]
        action --> graphView[그래프 뷰 열기]
        action --> pageManageCurrent[현재 버전의 페이지 관리 선택]
        action --> versionManage[버전 전체 관리 선택]
    
        %% =========================
        %% 1 문서 작성 플로우 일반 진입
        %% =========================
        newDoc --> docMeta[문서 기본 정보 입력 제목 타입 태그]
        docMeta --> docType{문서 타입 선택}
        docType --> typeGuide[가이드 문서 타입 선택]
        docType --> typeApi[API 문서 타입 선택]
    
        typeGuide --> aiOutline[AI가 문서 아웃라인과 섹션 제안]
        typeApi --> aiOutline
    
        aiOutline --> writing[본문 작성과 편집 AI 문단 제안 자동 완성]
    
        %% 작성 도중 첨부 여부
        writing --> mediaEvent{작성 도중 이미지나 영상 첨부 여부}
        mediaEvent --> mediaAttached[첨부한 파일을 Attachment 노드로 저장]
        mediaEvent --> mediaNone[첨부 없이 작성 완료]
    
        mediaAttached --> firstSave[초기 저장으로 드래프트 생성]
        mediaNone --> firstSave
    
        firstSave --> docNode[Document 노드 생성과 메타데이터 저장]
        docNode --> conceptSuggest[AI가 문서에서 용어 후보 추출과 Concept 추천]
    
        %% 여기서 기존 용어 연결과 새 용어 작성 둘 다 지원
        conceptSuggest --> conceptDecision{추천 용어 처리 방식 선택}
        conceptDecision --> conceptLinkExisting[기존 Concept와 연결할 용어 선택]
        conceptDecision --> conceptCreateNew[새 Concept로 등록할 용어 선택]
        conceptDecision --> conceptSkip[지금은 용어 연결 없이 진행]
    
        conceptLinkExisting --> conceptApprove[선택한 용어를 기존 Concept 노드와 연결]
        conceptCreateNew --> conceptNewFlow[선택한 용어들에 대해 새 Concept 노드 생성과 정의 작성]
        conceptSkip --> qualityCheck[문서 품질 검사 실행으로 이동]
    
        conceptApprove --> qualityCheck
        conceptNewFlow --> qualityCheck
    
        qualityCheck --> qualityFix{수정이 필요한 문제가 있는지 확인}
        qualityFix --> fixIssues[AI 제안 기반으로 문서 내용 수정]
        qualityFix --> skipFix[수정 없이 그대로 유지]
    
        fixIssues --> docEnd[문서 작성 플로우 종료 이후 페이지와 버전에서 사용]
        skipFix --> docEnd
        docEnd([문서 작성 플로우 종료])
    
        %% 기존 문서 수정 플로우
        editDoc --> openDoc[수정할 문서 선택 후 편집 화면 열기]
        openDoc --> isPublished{해당 문서가 공개 상태인지 확인}
    
        isPublished --> createWorking[Working Copy Document 생성과 WORKING_COPY_OF 관계 설정]
        isPublished --> editDraft[아직 공개하지 않은 드래프트 수정]
    
        createWorking --> editWorking[Working Copy에서 내용 수정 AI 보조와 품질 검사]
        editDraft --> editWorking
    
        editWorking --> reviewStep[리뷰 요청과 승인 진행]
        reviewStep --> mergeDecision{승인 후 원본에 반영할지 결정}
        mergeDecision --> mergeOk[Working Copy 내용을 원본 Document에 병합 후 저장 키 갱신]
        mergeDecision --> mergeCancel[병합 보류 또는 추가 수정]
    
        mergeOk --> cleanupWorking[사용이 끝난 Working Copy 정리 또는 보관]
        cleanupWorking --> editEnd[문서 수정 플로우 종료]
        mergeCancel --> editWorking
        editEnd([문서 수정 플로우 종료])
    
        %% =========================
        %% 2 용어집 관리 플로우
        %% =========================
        glossary --> glossaryView[기존 Concept 목록과 상세 보기]
        glossaryView --> glossarySuggest[AI가 문서를 기반으로 신규 용어 후보 제안]
        glossarySuggest --> glossaryDecision{신규 용어를 Concept으로 생성할지 결정}
        glossaryDecision --> createConcept[Concept 노드 생성과 정의 저장]
        glossaryDecision --> skipConcept[새 Concept 생성 없이 종료]
    
        createConcept --> synonymStep{동의어를 설정할지 결정}
        synonymStep --> setSynonym[동일 언어의 Concept를 SYNONYM_OF 관계로 연결]
        synonymStep --> skipSynonym[동의어 설정 없이 Concept 저장]
    
        setSynonym --> glossaryEnd[용어집 관리 플로우 종료]
        skipSynonym --> glossaryEnd
        skipConcept --> glossaryEnd
        glossaryEnd([용어집 관리 플로우 종료])
    
        %% =========================
        %% 3 그래프 뷰 플로우
        %% =========================
        graphView --> graphShowCurrent[현재 선택된 버전 기준으로 그래프 표시]
        graphShowCurrent --> graphFilterVersion[버전 필터 설정으로 하나 또는 여러 버전 선택]
        graphFilterVersion --> graphFilter[노드 타입와 태그 필터 설정]
        graphFilter --> graphInsight[연결이 부족한 영역과 고립된 문서 확인]
        graphInsight --> graphAction{그래프에서 바로 작업을 할지 결정}
        graphAction --> graphCreateDoc[그래프에서 새 Document 작성으로 이동]
        graphAction --> graphCreateConcept[그래프에서 새 Concept 생성으로 이동]
        graphAction --> graphDone[그래프 상태만 확인하고 종료]
    
        graphCreateDoc --> docMeta
        graphCreateConcept --> createConcept
        graphDone --> graphEnd
        graphEnd([그래프 뷰 플로우 종료])
    
        %% =========================
        %% 4 버전 전체 관리 플로우
        %% =========================
        versionManage --> versionList[버전 리스트와 각 속성 보기]
        versionList --> versionSelect{관리할 버전을 선택}
        versionSelect --> versionSettings[선택한 버전의 공개 상태와 메인 여부 설정]
        versionSettings --> exposureMode[사용자에게 노출할 버전 방식 설정 메인만 또는 모든 공개 버전]
        exposureMode --> versionNextAction{선택한 버전에서 페이지를 관리할지 결정}
        versionNextAction --> openPageManagerFromVersion[이 버전의 페이지 관리 화면으로 이동]
        versionNextAction --> versionEnd[버전 설정만 저장하고 종료]
    
        versionEnd([버전 관리 플로우 종료])
    
        %% =========================
        %% 5 페이지 관리 플로우 선택된 버전 기준
        %% =========================
        pageManageCurrent --> pageManager[현재 선택된 버전의 페이지 관리 화면]
        openPageManagerFromVersion --> pageManager
    
        pageManager --> pageTree[선택한 버전의 Page 트리와 속성 보기]
        pageTree --> pageAction{페이지 작업 선택}
        pageAction --> createPage[새 Page 생성]
        pageAction --> editPage[기존 Page 선택 후 편집]
        pageAction --> pageManageEnd[페이지 관리 작업 없이 종료]
    
        createPage --> pageDetail[Page 기본 정보 입력 경로 제목 타입]
        editPage --> pageDetail
    
        pageDetail --> pageDocConnect[이 Page에서 보여줄 Document 선택 또는 연결]
        pageDocConnect --> docExists{연결할 Document가 이미 존재하는지 확인}
        docExists --> selectDoc[기존 Document 리스트에서 선택 후 DISPLAYS 관계로 연결 준비]
        docExists --> createDocFromPage[이 Page에서 새 Document 작성]
    
        %% 페이지에서 새 문서 작성 플로우
        createDocFromPage --> pdDocMeta[Page에서 새 문서 작성 기본 정보 입력]
        pdDocMeta --> pdDocType{문서 타입 선택}
        pdDocType --> pdTypeGuide[가이드 문서 타입 선택]
        pdDocType --> pdTypeApi[API 문서 타입 선택]
    
        pdTypeGuide --> pdAiOutline[AI가 문서 아웃라인과 섹션 제안]
        pdTypeApi --> pdAiOutline
    
        pdAiOutline --> pdWriting[본문 작성과 편집 AI 문단 제안 자동 완성]
    
        %% 작성 도중 첨부 여부 처리
        pdWriting --> pdMediaEvent{작성 도중 이미지나 영상 첨부 여부}
        pdMediaEvent --> pdMediaAttached[첨부한 파일을 Attachment 노드로 저장]
        pdMediaEvent --> pdMediaNone[첨부 없이 작성 완료]
    
        pdMediaAttached --> pdFirstSave[초기 저장으로 드래프트 생성]
        pdMediaNone --> pdFirstSave
    
        pdFirstSave --> pdDocNode[새 Document 노드 생성과 메타데이터 저장]
        pdDocNode --> pdConceptSuggest[AI가 문서에서 용어 후보 추출과 Concept 추천]
    
        %% 여기서도 새 Concept 생성 분기 포함
        pdConceptSuggest --> pdConceptDecision{추천 용어 처리 방식 선택}
        pdConceptDecision --> pdConceptLinkExisting[기존 Concept와 연결할 용어 선택]
        pdConceptDecision --> pdConceptCreateNew[새 Concept로 등록할 용어 선택]
        pdConceptDecision --> pdConceptSkip[지금은 용어 연결 없이 진행]
    
        pdConceptLinkExisting --> pdConceptApprove[선택한 용어를 기존 Concept 노드와 연결]
        pdConceptCreateNew --> pdConceptNewFlow[선택한 용어들에 대해 새 Concept 노드 생성과 정의 작성]
        pdConceptSkip --> pdQualityCheck[문서 품질 검사 실행으로 이동]
    
        pdConceptApprove --> pdQualityCheck
        pdConceptNewFlow --> pdQualityCheck
    
        pdQualityCheck --> pdQualityFix[수정이 필요한 문제가 있는지 확인]
        pdQualityFix --> pdFixIssues[AI 제안 기반으로 문서 내용 수정]
        pdQualityFix --> pdSkipFix[수정 없이 그대로 유지]
    
        pdFixIssues --> pdDocEnd[Page에서 새 문서 작성 완료]
        pdSkipFix --> pdDocEnd
        pdDocEnd[Page에서 새 문서 작성 플로우 종료]
    
        %% 새 문서 작성 후 Page와 연결 여부 선택
        pdDocEnd --> linkDecisionFromPage{이 Page에 새 문서를 연결할지 선택}
        linkDecisionFromPage --> linkYes[현재 Page와 새 Document를 DISPLAYS 관계로 연결]
        linkDecisionFromPage --> linkNo[문서는 저장만 하고 나중에 연결하기]
    
        linkYes --> pageSeo[페이지 공개 여부와 SEO 메타데이터 설정]
        linkNo --> pageDocConnect
    
        %% 기존 문서 선택 후 흐름 또한 DISPLAYS 관계 명시
        selectDoc --> pageSeo[페이지 공개 여부와 SEO 메타데이터 설정]
        pageSeo --> pageSave[Page와 선택된 Document를 DISPLAYS 관계로 연결 후 버전에 포함]
    
        pageSave --> pageManagerBack[선택한 버전의 페이지 관리 화면으로 돌아감]
        pageManagerBack --> pageTree
    
        pageManageEnd --> pageEnd
        pageEnd([페이지 관리 플로우 종료])
    ```
    

https://mermaid.live/edit#pako:eNq9WntPG1cW_yojS5VSKYl4hTZIuxILoYo2AbqOGrHGqlx7AiPA9o7HAdZCMsFULNAGNhAMsVnYJSFEVOuAmzhS8oU8d77Dnvu-d2bMK-3mj8S-vud37j33vE8KkWQmZUZ6Io8mM9PJ8YTtGA_6R9OjaQP-fPGFgVYqaHedfs058PO1GF2Kf6ksGjdu_NFIJXLjP2QSdirWrBfdV8dod81AL1a9-WO0fOD9XEbVOnwwvO0N96geV3g0G0V3v-KerBruSQntlQy0MO8tVNB20XCfVdz9X9yVA7RTp_sFF8LzsWnnrEw6Om05yXHTjnnlEto9NlBpz1uoumsVjuitV-DYhnu0gaoNtgjnAdY197TB9scpBx-myqdvPGMlzQKcx30pYCof4fSGe1psnnzyNvfQYZHhzWl4lJagTZhm9ju6yk_Mj1Qymu8b7ioWiIGeHKOdo3grFHit9JjJcdhFVYGhrTVUgpOpp9WvqkGoF-3NZidnY3Svt1lRjqefl94dlQ7Q3ibDVC5HEBNJJ3BPLHd0AHLaXUdbi6HiJydQAFSd_LUCGoIqcJnNfbRYZvT0d7qbEKbN6f5MMoYWlgz3uIFFgfmV3ur8FAIzZTmYAp9uvy6Ilspwu5ZEY5OZXC5hg7R2jtDzOjpcN6j-t6awE9nx7yxzOobferfsbcC7va8ZaKsOnIP7s4kx834iDX_35W3bTDt-pSkbzLxA9c7hzaRL4bjSYJCTeoBUCPwPrf6IHe0-CXsbq6AYaAcuVf3o1uCJDuHEixdFpC9HvUomed90EjGGzw12b9M9rQO3RXfvJXyruG-ODG-hCAvwTwXkyq7OyDnUg9ksmC-FYts1W2VbyHYHPnyTt1JmrFkrgnTBtIww0ng4aW_WivUO321FQokED6rp1lDembTSZqz3LvAUMt0soRcLbvUj-K7m6UfA-EC0fq-CNpfiEgg46jCci1ggP0_blmOlx2IgR2DAXgzjej83sPb2kjO7K68ZB9ix5j7dNtB2CTaqesEe231aQgfrBjp57b4Dm946hn_oHsaKsJ0C60rceQzqW_DRgWj_C5yL7hO4VHkebFvHYm8jASRer-MkwEmnYpQAuypvdRVhUZUM-uMUJnAXG8QzgjD34B1exltDDmZA_oL_jzhKcLexXXL_syoEoB2A0D-y7JwTTTwG-voSaCpjxiMEHIAYu7cMUl-oUmEKJMxXR-GMxALX4kEI2TEwkLxyN4aI3xGiHGib-1MNzu6VavqVGTmNIJl00sw60fzYmJlzNKVjsYP6NMN7USLm9m4DvatgFn2UkqycVDSd2DrG7pOaKvaiDAJt1ZonNaK-4I_5IlOE9TKOUuAkiujFGgtN2tnU4_abSQv7sAJlLrBOyth7ubUjtFLVrdpHqILds9ITd2asHLEIdmJ2OZx_0FNDVBdctPDZGrfPNhOOOQg-Hl-XIVIteOvuV6-AGJ2wsjGQULOxhKpFXaxCUQ9L3vN_iOcIuaOKCCHWzmBlFWGegrovPxq6KJiOSYnoxxWXVdHh6wDklEH0ZwegXAbkON5m3VCkE1Rk8PI4uFEt0VliaRBuf8snJi1ntm_cTE7wIOH9cwkdLhnNkyKkUJDCHoBQeKoCzubptl9CTBIBQG0Tu1DIJrpNXVM3DVgzBZpD4CfywJnvbJCcCg67V8Emh3aX3OUNHL29bdjUmNMAgZ75hZm7uVzezIGhcteMw2GtzB0Mvb37pA6SZmlLPBQqB9KDzzGe2lDtUTLPCk5j49IBMc7cAd1Jp2ItA_6_F8FLYkGD15CJCcnmab7CXIua3bIDKfjCW8Hna-cww7WIUk2EJG-Cgm5jiR5hl8maaZImkp3YMDkpUVyD3oJERlq66HkaIydQVm44_8OklYN4UADldlc-MCz8yM3TX5u1Cq9tqg3tuSmWQk8tidjVw4w9gb0T-xfMJTtrCO8vreXh0F_-fHfwm-_7hoZHvh8awOlc87SkJ-d-DkQQduKRE8NJxuE8O6W3WSZlzOYydjV64OJqxWxDPaKADDsyr0ZU7SS5xmkd7dewemhmG1deCh_Qj80PoCyRLbb5GDLrqGNmYxAOSFq9A2HiF-JPlj_g8k94SUwv97MUwB4zZYShBFgFIDBBwkQ8FxhceZ5VeuAL4R4iQ1GIJdzQhP52VAQ4Q6Gg4jEJ-um6t3lEWZK4bXhPDoxm7S1a2YufyaYvAW5qMsYAQKzuSwir5TVwLThOE0ejPx47HdW1STORzmf5y1HrxF7Bna-6TyqGdgOcfuNYS8GBFega988ajng11WP4TJIbsXImepXgk_MH13xCC7gvL1XAdBiB8s3nM86H4ZWgVhbSOs8XTd8cQQ5Ac6F5VGoQCQqPolJqUGF5GovVMgiAmjTfBxI3tVTwwWkspOarMJgJT4oYF-J1wmzAj6Q4MgYROzfeq_lqKB4OFxxNzSAolMiGuF6propvJTCz6Ux6dgobfwGyAuDNLkt9Ztj1FBIKYTpRuhQjCED7vIH1CO7Bsz4AjI4MDg2O3JdumQhRTaUCwHBFDblMk8UDJWCLa3OBMShxJu1tsQm2VnLdChXufgy5QRVlYIOycO0CbC9nrZ2G3jm5vKnyFoxsyETHM9O-_kqgjUjbVswG5BFodzGuQCtgksOANemYtq9hB_kgqdHIwzJkCL-4Fua-G4rgfx2H9u-CsH5uMWZktP1Aoixpj-h8g3AS5246Z42Ng50RbSUR4V0R7b8lGT1U61sktDZP99xXn4ioWA5OUhsVmAFJ5F7SlioIOfIMobZBrIP0BknLMczNSAAJSOsQ0sHzYWInIVMmkkX6C4JzULm7CUPW3c-Fgftxp0FqEc0M3cNVJjvQApCq34vpF1VbZIHfVfvUnJ-ys593Hcg3ab3s27VYC0O7mt12GaEdx0ubr9bFVPua96DKFa3wV2TwsNzAWt-szRvox59It0ENtgqdNlAwJ82kU6DnIzWBaICH9fbpdh3AweV2LqSHXvaVArgwonMJ2u7SbdKHR3OimWwml7fN-7gPxDK13TVQyCaeoSw20LuKPLPsiJDQQVlhLePZ25vX7rM9fiZKw5NvhY96uUFzxmHGG7getQpR9pH8hEsxYMUBPFGRDYuetz1gZ6a40yTup3XXmxZoYQYYzomtkuSUu1csJSweGlTDjVDSXeOEv01guxVyJ4kYHo4uCh8YI_iGCy2nZ2eIWimCw1_Mz4NLQ1kSWx7YphlqLxjaAEPGFo1bUCF2zOkFGNNPeW5t1jQnqRR1oE4ScyNZJWGrNWp9-3EpQnaz_J4S-NsG4bRSAFj7gvMbdtozMtlh7vswVD8EAGsyRtZCZyTNk0-0_a2MSpQaOwRMfSq6IjdkkhBK0uDziEViYh68oZrfOkYHJSXcUoGIbEZJenUs0f3BvcpcQfZeORQpYcm0wABxg6riRCmkcSYwWIqOnbMy15OdcxEhWCyXT9d_Nzp8r3ckGkjXDbA490MpHsYpycMyNgCqRrp0QtIQtXcum2Vye4vOl6oICkP6Qql-NjTzsdaxwtSEvwtHkHjnTc7EJkby4HLTszDyC03QFE6MtPfqUzTB1w8lufVqs7Rs6uH_Y5rGhhv8DA-VsVo2df9zB2sqhIr5mcO1VrAXHrD5jsEwBq44ZFO4-5EkwwFt1EaUkgzbNMO93MBNgDDIvt9z6AYvH1KRQMVWwpLynoLHfM2P1RecsInFy8_YAqQ64GfN2c7BvuKs7RzUK8zbQm-ro37-zC14bZ3D7zR30-TCOH77WbM3v0xCQH0b1QmcfyPf-q1_CieW5MDronO4uA-UT6iwn7j6LC4ELnq5eZzCX_opnEaeGe-Fd6UQUWXkxgEUj3UuXEjnUPqj4G7IqQicUGdZ7cr_vMU5k0NBkJ3gpsnzm4KSUClcSM-Wu5DAf8ALAxIcRuANWd0jzqc4e4zcMheMXwB_MMMsgyS_JDCQFg-tKyEyQ6Qml2HHL9OaRiKP8EcG1KiZUUsF1kYgcsQHj94ZCsYitZlADxSSxreenyrVTHXNfVXCeTy2Gp9QDPfNIlqp8AY0y7h_s4MzDImH4794L1GvXujVyGVEt4IFxbha7cgEQFapf0qAjwsrTs9uQrhPVyHxbNbW4oG6FyNqtW-wNuamkKWf5c-k83BWq4A1HyLXI2O2lYr0OHbevB6ZMu2pBP4aKWCs0Ygzbk6Zo5Ee-JhK2BOjkdH0HNBkE-m_ZjJTnMzO5MfGIz2PEpM5-JbPpnDRYSXG7ITcYqZTpt2XyaedSE9nZ8dtAhLpKURm4HvbrZtdnd0d7Z23bne2f93ZdT0yG-m50dHRfrOzrav9q7bOjrZbbbe7u-euR_5O-Lbf_Lrrq-729u7b3bdvtXV3tXXM_Q9uNEXj

## 문서 소비자 (End user)

- Mermaid Code
    
    ```mermaid
    flowchart TD
    
        %% 시작
        start([시작])
        start --> portal[문서 포털 메인 화면]
    
        %% 전역 상태 선택 버전과 언어
        portal --> versionSwitch[현재 선택된 버전 표시 메인 버전이 기본 선택]
        versionSwitch --> versionChoice{다른 버전으로 변경할지 선택}
        versionChoice --> keepVersion[현재 버전을 그대로 사용]
        versionChoice --> changeVersion[버전 드롭다운에서 다른 버전 선택]
        changeVersion --> versionApplied[선택한 버전을 현재 버전으로 설정]
        keepVersion --> langSwitch[언어 전환 메뉴 사용 가능]
        versionApplied --> langSwitch
    
        langSwitch --> langChoice{언어를 변경할지 선택}
        langChoice --> keepLang[현재 언어 유지]
        langChoice --> changeLang[언어 목록에서 다른 언어 선택]
        changeLang --> langApplied[선택한 언어로 화면 갱신]
        keepLang --> mainActions[메인 화면에서 할 작업 선택]
        langApplied --> mainActions
    
        %% 메인 액션 선택
        mainActions --> navBrowse[좌측 네비게이션 트리로 탐색]
        mainActions --> searchStart[검색창에서 검색 시작]
        mainActions --> openChatGlobal[AI 채팅 바로 열기]
        mainActions --> openFavorites[즐겨찾기 목록 보기]
        mainActions --> openRecent[최근 본 문서 목록 보기]
        mainActions --> openMyNotes[나만의 노트 목록 보기]
    
        %% =========================
        %% 1 네비게이션 기반 문서 열람 플로우
        %% =========================
        navBrowse --> navTree[Page 트리에서 상위와 하위 페이지 탐색]
        navTree --> selectPageFromNav[네비게이션에서 페이지를 선택]
        selectPageFromNav --> docPage[문서 상세 페이지 보기]
    
        %% 문서 상세 페이지 내 상호작용
        docPage --> docView[문서 본문과 코드 예제와 이미지와 영상 보기]
        docView --> apiTryCheck{API 문서이며 Try 기능이 사용 가능한지 확인}
        apiTryCheck --> apiTryUse[요청 파라미터 입력 후 API 호출 실행]
        apiTryCheck --> apiTrySkip[API 호출 없이 문서만 보기]
    
        apiTryUse --> docActions[문서 화면에서 할 작업 선택]
        apiTrySkip --> docActions
    
        docActions --> docOpenChat[현재 문서 컨텍스트로 AI 채팅 열기]
        docActions --> docAddFavorite[이 문서를 즐겨찾기에 추가]
        docActions --> docAddNote[이 문서에 대한 노트 작성]
        docActions --> docFeedback[문서 피드백과 오류 신고]
        docActions --> backToNav[다른 페이지 탐색으로 돌아가기]
    
        backToNav --> navTree
    
        %% 문서 피드백 플로우
        docFeedback --> feedbackChoice{어떤 피드백을 보낼지 선택}
        feedbackChoice --> fbHelpfulness[도움이 되었는지 평가와 의견 작성]
        feedbackChoice --> fbError[오탈자 또는 내용 오류 신고]
        fbHelpfulness --> fbEnd[피드백 전송 완료]
        fbError --> fbEnd
        fbEnd([문서 피드백 플로우 종료])
    
        %% 즐겨찾기 추가 플로우
        docAddFavorite --> favoriteSaved[이 문서가 즐겨찾기에 저장됨]
        favoriteSaved --> docActions
    
        %% 노트 작성 플로우
        docAddNote --> noteEditor[현재 문서와 연결된 개인 노트 작성 화면]
        noteEditor --> noteSave[노트 저장 및 개인 노트 목록에 추가]
        noteSave --> docActions
    
        %% =========================
        %% 2 검색 기반 탐색 플로우
        %% =========================
        searchStart --> searchInput[검색어 입력 제목과 본문과 태그와 Concept로 탐색]
        searchInput --> searchResult[검색 결과로 페이지 목록과 간단 설명 표시]
        searchResult --> selectPageFromSearch[검색 결과에서 페이지를 선택]
        selectPageFromSearch --> docPage
    
        %% =========================
        %% 3 AI 채팅 플로우
        %% =========================
        openChatGlobal --> chatPanel[AI 채팅 패널 열림]
        docOpenChat --> chatPanel
    
        chatPanel --> chatContextInit[기본 컨텍스트 설정 현재 페이지와 선택된 버전 사용]
        chatContextInit --> chatModeChoice{온라인 검색 허용 여부 선택}
        chatModeChoice --> chatLocal[내부 문서와 그래프만 사용]
        chatModeChoice --> chatWeb[내부 문서와 그래프와 외부 검색 함께 사용]
    
        chatLocal --> chatReady[질문 입력 대기 상태]
        chatWeb --> chatReady
    
        chatReady --> contextAction{컨텍스트를 추가로 주입할지 선택}
        contextAction --> useCurrentPage[현재 보고 있는 페이지를 컨텍스트로 사용]
        contextAction --> useSelection[문서에서 드래그한 텍스트를 컨텍스트로 추가]
        contextAction --> useFavorites[즐겨찾기 문서들을 컨텍스트 후보로 선택]
        contextAction --> useRecent[최근 본 문서를 컨텍스트 후보로 선택]
        contextAction --> useNotes[개인 노트 내용을 컨텍스트로 추가]
        contextAction --> noExtraContext[추가 컨텍스트 없이 질문]
    
        useCurrentPage --> chatAsk[질문 입력 후 전송]
        useSelection --> chatAsk
        useFavorites --> chatAsk
        useRecent --> chatAsk
        useNotes --> chatAsk
        noExtraContext --> chatAsk
    
        chatAsk --> chatAnswer[AI가 문서와 그래프 기반으로 답변과 관련 문서 링크 제시]
        chatAnswer --> chatNext{추가 질문을 이어갈지 선택}
        chatNext --> chatReady
        chatNext --> chatClose[채팅 패널 닫기]
        chatClose --> portal
    
        %% =========================
        %% 4 즐겨찾기 플로우
        %% =========================
        openFavorites --> favoritesList[즐겨찾기 문서 목록 보기]
        favoritesList --> favAction{즐겨찾기에서 할 작업 선택}
        favAction --> favOpenDoc[선택한 즐겨찾기 문서 열기]
        favAction --> favOpenChat[즐겨찾기들을 컨텍스트로 해서 AI 채팅 열기]
        favAction --> favRemove[즐겨찾기에서 문서 제거]
    
        favOpenDoc --> docPage
        favOpenChat --> chatPanel
        favRemove --> favoritesUpdated[즐겨찾기 목록이 갱신됨]
        favoritesUpdated --> favoritesList
    
        %% =========================
        %% 5 최근 본 문서 플로우
        %% =========================
        openRecent --> recentList[최근 본 문서 최대 열 개 목록 보기]
        recentList --> recentAction{최근 본 문서에서 할 작업 선택}
        recentAction --> recentOpenDoc[선택한 문서 다시 열기]
        recentAction --> recentOpenChat[최근 본 문서들을 컨텍스트로 해서 AI 채팅 열기]
    
        recentOpenDoc --> docPage
        recentOpenChat --> chatPanel
    
        %% =========================
        %% 6 나만의 노트 플로우
        %% =========================
        openMyNotes --> notesList[개인 노트 목록 보기]
        notesList --> notesAction{노트에서 할 작업 선택}
        notesAction --> openNote[선택한 노트 내용 보기]
        notesAction --> editNote[선택한 노트 수정]
        notesAction --> deleteNote[노트 삭제]
        notesAction --> chatWithNote[이 노트를 컨텍스트로 해서 AI 채팅 열기]
    
        openNote --> notesList
        editNote --> notesList
        deleteNote --> notesList
        chatWithNote --> chatPanel
    ```
    

https://mermaid.live/edit#pako:eNqdWX1PG0ca_yorS5VaKYkS81JAupM4ktxFSnNVSHvSGf7Y2BOwMLvWeoHkEBKBpSLgO6hqwFCDTAsJ9IjOgJv6VHIfyDv7He6Z153ZXfMS_vLOzPOb5_1lmE1l7RxKDaReFOyZ7LjpuMaz-yPWiGXA32efGXi1hve-Z58lF7Y_z7Cl0S-UReP27T8aRdtxzULGP2lhr2YEayeB1zL84wrebRnBdsU_bo6qwHUPb7038OLrYLFmYK8eLO4a_pkH6-3zCwNvtvBmk51mwPSOaeSU8rY1PJN3s-OZoOrhvRNO7K_XOL0RfF8DJsXdbBHvNo12q-Gft_j5UQauIap3DI3b-Sya9VcP_EMJUrvw9wH4fL599jHYqON38xxtTkNjtBRtAqHit2xV8CsY8oz2by2_PE8g8cIJ3jke7YQClrHGkMDhYvo_1Pz998Ag3mnirXWidY1bXVANQhV0sFgs5FEuw04HGzWFQZ1jJj32DnB9g6Mq4lHMAlzCrcNMSAwdbFeJMfw3TS6n0W7M-yuHuricjwiMcJlwRR7gFmL3-IcXl9glPC6N8hiWpAdxVmuEcjSRhKmPEvHT_i_H_v6urngBFFc8oZScx1XOhQD1slABDZ3i1bqiZQkwaeatwawLGitltPDirID8BgQo3lrS-VAujuIocckR8cY-XqpyALapnKf0ljn9J8eeKaEM_qmMW_uG7x34__XaZ2WINUIcrLT8tydUpsV1vPhmNBmnhEwnOz5M8kimfTYPB3HjI5eFffMs1IHeLiIIFdP9c8F-Dvln8JGBT72gvGT4jQr1160mBP4lxA_NadvJu6iUwW_X22dHuPE_IOD2Bae6gvwpyiLLzeBfa-3fiA9C-LEUeF2Ar149scnt_kLVfwfKg2BZaoHyYgDSSH_o9CdP3ItZgyS_RlXwBkrx98pGUCmDivBO47rQ0ujCBZ45CGW-NscQNzc3HOR1XPPw9jy4YxV-GcG_qoQRCEzNGTgCd4QCyroE66FjTz4xpzMRGYSDCygS85qLxxAobs7OkiVRmQhrUJlChuL67XhyoUkrVrVFAmznmBFwfHHXt3k0I-4Cb4BftKB9rEC-NnB1GddrRC8A6f-nBaj0o_oacHVX4VAU1izmnzmvhsZRdmJ28OtHnEECcdwwYIdad-WQFDktw0JqoSrf3oCg5rlQwVKwvyFxvFPBZ--NoFz2dy-AucBrQCZZ8uuHRvCjZ5CLiegfQIzVg2BT2DAZcHgiX8yoJFvfEfYY5-DnUbVLNoQeZY7jDcV1clx4dQRF3BKuiAN_5elDVmdu-9-PgqV_4pUD4taQRcK0ouWTON5gLicSSkYRmLiqkl1ADgN_qICVLgMieUEBIUTQL9ASzTIE0YF32hHiIUK552Z2QuqwckGahsYp9cgqlCxI8av19nk9GYLQPrNpJLL6Fo1i0RCtlfGGB8KoBpXEaqqIB5nkKZqMFP4pwgv-Ict-0988CMlJuwIu5S9cxKq_TsnAnv8FFYovpgoWKoGLrXn4x3mq6HXIMsv-SoXKuPYGZGLBWm2fnejqTkR94Di2kwHVBovLeA_MVV0HMJI4SFAmqVzjRKBYuUyoF9J6fbdv4G3P_7ksqehN4Xm5bOU-z3RWrYF_WiIoX6ituFr1mFMm2ELxa3Yr_xg2p0knI52UUMc8vT6P9w799SPBvUrbIVKJh6hOnswSiRDmX_DjQS7vgva1QKbW22q0zxpkQGg3anQk0IHFcEILksSRsITLjCChkkBrsRbBkt2gHtaCvrOQV9fytGiDeAlnoXfz2q00Wkrj9cgqTsnGi_SuLOFDlQKRSJ4IaxhMajCxEI0O2VYWFd1Yb6dAKlc8RaWpgrgDhGkAGCUNCyvVHrmj3fD81SMyZPi_LPFJTgNnYAkNwzDd1m-5YcfAINSm4UaG6lKqxI2to7exYuYA1iykNrVB-cj31mn_9vYizNqiiul0gnu5ILfBgC566T6y8mAXPhYrFY8PeWL-k_qj0RQdt7XZNQIuL_zKziGRuatH0F-Q2OG2CraWaXbcOvE_RFK3TirRHttZ8tSw0CQEYaCTeXqvGlQ80l_E2ErA-Rt6fgkKlXa7RXYFpxtH7d-rIXQITjmSuE-RmXuVwe-WAVVEFFRummDpi4fCFvCg06mwdIFtM6WyBDKrtSfEqWnSoePOzxdwYdIQrCFQzKkSGppyHBhfaIMsEic0ZuekvyJ1MBI7ka5I13ES_jANMPpqIXoY2hhDXdqrgqZJM6NLEr1CTaeJV3Sa31jj9cMB6Qw054ZmlnQK-7XIoJ4E3mm6i7J6I1A270UKCG0RorxeQwOW_eCl65g86DK8gOvRzHpv5o_SbXXrSx8cLE1EPJc0_6wJGZWU0q4qndyVJkncZTpN3KKaie_oMur7YbDAZ7hllWaQA4mTKCMhtnkxFQ3s6q_k8YjUn-a8Xz-SI_y718HrE1IMwzIUosvLngBTs0LxVHXUjhA2m812YzkeiZwmGveJe0MFm8xmWvr3V_8dziDykPIMe6O61a23gJ9UunSLiwav9DhfcpPCMvFxRKMSOCLh6S1l4hA4J2GU8IAvUhzv21n1uS2BI22uS8SgY6JKmpBcaF-z0SSAHUbGGPRTNGlDh5kgoeCsXmufhoNVKJHeqSh7Sa0A32a36Vb6ppgzXdLFx9-_6Ls5fYuMt--CLm7yG7lfjxF_O_skH1TyikN_Mu-LgcMKFGNiFdLEJ7piSK_ACVeMAl7hjyqxghb3ShEaqwfk3xea01yCwbwyVp9u6prqPR3dS781udm8ls17jdhr5yeZnL-dylmNJZyk0Uy3rzwbUnLrMqIrTKoQyGdc9lgTGlMt6wmXK9QI5s1karxcDf_XEiXLQQl2acWU0-nCe8gVHY7TXjPvjoePSpQoqee6ykuEuLra2Z4QJmkv5DhpV2VQd63UrdSYk8-lBlxnCt1KTSJn0iSfqVlCOZJyx9EkGkkNwM-c6UyMpEasOaApmtbfbXtSkDn21Nh4auCFWSjB1xTNXffz5phjhkeQlUPOkD1luamBrvRdipEamE29JJ93ert67vXfTXd19_X196V7b6VepQZu9_b03-lKd6W703e__DKd7uueu5X6B702fedeV09XT09Xf09fb_-9ru65_wN-U8Tb