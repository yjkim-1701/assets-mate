# Assets Mate — Assets Copilot 데모 시나리오

> 작성일: 2026-04-21
> 상태: 초안
> 문서 인덱스: [README.md](./README.md)
> 선행 문서: [07-integrated-AI.md](./07-integrated-AI.md)
> 관련: [02-feature-specification.md](./02-feature-specification.md), [sample-images.md](./sample-images.md)

---

## 1. 시연 목적 & 청중

### 1.1 목적

- Assets Copilot (`/ai/copilot`) 이 **흩어진 AI 기능을 하나의 대화에서** 어떻게 연결하는지 27분 이내로 체감시킨다.
- "거버넌스는 항상 동반된다", "기존 AEM·Firefly 자산·API 와 정합한다"는 두 메시지를 모든 시나리오에서 관통한다.

### 1.2 청중별 세션 길이

| 청중 | 구성 | 총 시간 |
|------|------|---------|
| 내부 임원 / 경영진 | 시나리오 A + C + E | ~17분 |
| 고객 PoC | A + B + C + D + E (풀 코스) | ~27분 |
| 영업 킥오프 | A + D (핵심만) | ~12분 |
| 개발 리뷰 | E (복합 체인) + Q&A | ~20분 |

### 1.3 핵심 메시지 (모든 시나리오 끝에 반복)

1. **"하나의 대화창에서"** — 메뉴 전환 없이 검색·업로드·생성·수정을 잇는다.
2. **"거버넌스가 항상 가드레일"** — 브랜드 가이드 위반은 자동 차단/경고.
3. **"기존 도구와 정합"** — 동일 엔진·데이터, Copilot 은 UX 레이어.

---

## 2. 선행 준비물

### 2.1 환경

- [ ] `npm install` → `npm run dev` → `http://localhost:5173/ai/copilot` 접속 확인.
- [ ] 브라우저: Chrome 1440×900 이상, 다크모드 끔(데모 기본), 확장/알림 비활성.
- [ ] 네트워크: 오프라인 대비 — mock 데이터만으로 동작해야 함.

### 2.2 데이터

- [ ] `src/data/mock.ts` 의 `ASSETS`, `AI_FIX_INBOX`, `CAMPAIGNS`, `COPILOT_STARTER_PROMPTS`, `COPILOT_DEMO_TRANSCRIPTS`, `COPILOT_VIOLATION_CATALOG` 로드 확인.
- [ ] `src/data/copilotIntentMock.ts` 의 `parseCopilotIntent` 가 시나리오별 입력을 예상대로 파싱하는지 사전 검증.

### 2.3 이미지

[07-integrated-AI.md §10.1](./07-integrated-AI.md#10-시연용-자산-요구사항) 의 9개 파일을 `public/sample/` 에 배치.

| 파일 | 사용 시나리오 |
|------|---------------|
| `copilot_hero_avatar.png` | 전 시나리오 — 어시스턴트 아바타 |
| `winter_promo_generated_01~04.png` | C (이미지 생성) |
| `violation_sample_red_tone.png` | D, E (수정 before) |
| `violation_fixed_cool_tone.png` | D, E (수정 after) |
| `agency_submit_warn.jpg` | B (경고 데모) |
| `agency_submit_block.jpg` | B (차단 데모, 선택) |
| `copilot_starter_thumb.png` | 빈 상태 배너 (선택) |

### 2.4 계정·상태

- [ ] 프로필: "Demo Marketer" (AppLayout 프로필 드롭다운, mock).
- [ ] 사이드바에서 `Assets Copilot ✦` 항목 노출 확인.
- [ ] 스레드 초기화 버튼("새 대화") 동작 확인 — 각 시나리오 시작 전 클릭.

### 2.5 리허설

- [ ] 각 시나리오를 **최소 2회** 라이브로 실행.
- [ ] 대본 재생 모드(`⌘ + .`) 로도 한 번 실행.
- [ ] 다크/라이트 모드 양쪽에서 이미지 렌더·콘트라스트 확인.

---

## 3. 시연 대본

각 시나리오는 동일 포맷을 따른다:

- **상황 설정**: 발표자가 청중에게 1문장으로 맥락 제시.
- **사용자 입력 스크립트**: 발표자가 실제 타이핑할 문장.
- **기대 응답**: 화면 반응 및 카드 종류.
- **내레이션 포인트**: 말하면서 강조할 3줄.
- **실패 대비**: 동작 이상 시 대체 흐름.

---

### 3.1 시나리오 A — 의도 기반 검색 (5분)

**호출되는 기능**: F-1.8 대화형 AI 검색 (의도 `search` → `inspect`).

**상황 설정**
> "여름 캠페인에 바로 쓸 수 있는 승인된 소셜 이미지를 찾고 싶다고 해볼게요. 보통은 검색 탭 들어가서 필터 세 개 클릭해야 하죠. Copilot 에서는 이렇게 말합니다."

**Step A-1 — 자연어 검색**

- 입력: `2026 여름 캠페인 중에 승인된 1:1 소셜 이미지 보여줘`
- 기대 응답:
  1. 어시스턴트 3-dot 펄스 500ms.
  2. 의도 파싱 카드 (접힌 JSON 펼침 가능): `{ campaigns: ["2026 Summer"], statuses: ["approved"], aspectRatio: "1:1", kinds: ["image"] }`.
  3. `asset_grid` 카드 — 3개 썸네일 (a3 `social_post_03.png` 포함, 각 카드에 브랜드 스코어 미터·상태 배지).
- 내레이션:
  - "캠페인·상태·비율·종류를 한 번에 추출했어요."
  - "이 엔진은 `/search` AI 탭과 동일합니다 — Copilot 은 UX 래퍼예요."
  - "Claude 처럼, 제 질문은 오른쪽 말풍선으로, 어시스턴트 응답은 좌→우 풀 폭으로 렌더됩니다. 결과 카드도 그 풀 폭 안에 인라인으로 놓여 있어요."

**Step A-2 — 지시어로 상세 열기**

- 입력: `첫 번째 자세히 볼래`
- 기대 응답: `asset_detail` 카드 — 메타·스코어·라이선스·버전·액션(다운로드/리사이즈/공유/수정).
- 내레이션:
  - `"첫 번째"` 같은 대명사가 이전 결과와 연결됩니다.
  - "상세 뷰의 모든 주요 필드를 카드 안에 축약했어요."
  - "여기서 바로 '수정'·'공유' 등 후속 의도로 이어갈 수 있습니다."

**Step A-3 (선택) — 후속 탐색**

- 입력: `비슷한 거 더 보여줘`
- 기대 응답: `search` + `referenceAssetId` 로 재호출 → 비주얼 유사 그리드.

**실패 대비**
- 의도 파싱 누락 시 "조건이 더 필요해요 — 기간·채널을 알려주세요" 클러리파이. 발표자는 "보시죠, 부족하면 되물어요"로 자연스럽게 넘어감.
- 대본 재생 모드(`⌘+.`) 로 시나리오 A 녹화본 재생 가능.

---

### 3.2 시나리오 B — 거버넌스 체크 업로드 (5분)

**호출되는 기능**: F-0.4 업로드 허브 + F-2.1 자동 검사 (의도 `governance_check`).

**상황 설정**
> "외부 에이전시가 보낸 배너를 DAM 에 올리기 전에 브랜드 가이드에 맞는지 확인해야 하죠. Copilot 에 파일만 떨어뜨리면 됩니다."

**Step B-1 — 경고 케이스**

- 동작: `agency_submit_warn.jpg` 를 채팅 입력창에 드래그 드롭.
- 기대 응답:
  1. 사용자 메시지: 첨부 썸네일 + 파일명 + 크기.
  2. 어시스턴트 "검사하는 중…" + `ProgressBar` 2.8초.
  3. `governance_report` 카드 (severity=warn): 위반 항목 2개 (예: `color-off-brand`, `logo-margin-insufficient`), 각 항목 옆 가이드 섹션 링크.
  4. 두 개 CTA: `그래도 진행` / `자동 수정 시도`.
- 내레이션:
  - "파일명·프롬프트·이미지 휴리스틱으로 통과·경고·차단을 판단합니다."
  - "위반 근거는 `/settings` 의 브랜드 거버넌스 가이드를 그대로 따릅니다 (F-0.3)."
  - "'자동 수정' 으로 바로 다음 단계를 이어갈 수 있어요."

**Step B-2 — 차단 케이스 (선택)**

- 동작: `agency_submit_block.jpg` 드롭.
- 기대 응답: `governance_report` (severity=block), 업로드 CTA 비활성, "재생성" 또는 "자동 수정" 만 제공.
- 내레이션: "차단은 거버넌스가 '진행 불가' 로 판정한 케이스 — 후속 조치 없이는 DAM 에 들어갈 수 없습니다."

**Step B-3 — 통과 후 DAM 경로 제안**

- Step B-1 에서 "그래도 진행" 선택.
- 기대 응답: `dam_path_suggest` 카드 — 제안 경로 1개(예: `/content/dam/brand/campaigns/2026-summer/agency-submits/`) + 대체 경로 3개 + "탐색" 버튼.
- 내레이션:
  - "업로드 허브(`/assets/upload`) 의 DAM 경로 엔진 그대로입니다."
  - "세션 컨텍스트(파일·캠페인 슬롯)에 따라 경로를 자동 제안해요."

**실패 대비**
- 드래그 드롭이 먹통이면 `📎` 아이콘으로 파일 선택 우회.
- 경고 케이스가 pass 로 판정되면 파일명 `warn` 키워드 포함 여부 재확인.

---

### 3.3 시나리오 C — 이미지 생성 (5분)

**호출되는 기능**: F-0.4 텍스트 모드 + F-3.6 변형 (의도 `generate`).

**상황 설정**
> "없는 자산은 만들어야 합니다. 마케터가 Firefly 열어서 프롬프트·해상도 세팅하는 대신 이렇게 씁니다."

**Step C-1 — 프롬프트 전송**

- 입력: `겨울 프로모션 히어로 배너 만들어줘, 2560×1440, 블루 톤`
- 기대 응답:
  1. 의도 파싱: `{ type: 'generate', slots: { promptText: "…", aspectRatio: "16:9", resolution: "2560x1440", palette: ["blue"] } }`.
  2. 프롬프트 거버넌스 체크 → pass.
  3. "이미지 4장 생성 중…" + `ProgressBar` 2.8초.
  4. `generation_preview` 카드 — 2×2 그리드 (`winter_promo_generated_01~04.png`), 각 썸네일 밑에 `promptAdj` 태그 (쿨 톤 / 웜 액센트 / 미니멀 / 여백형).
- 내레이션:
  - "해상도·비율·팔레트가 자연어에서 추출됩니다."
  - "생성된 결과물도 즉시 거버넌스 재검사를 거쳐요 — 프롬프트가 통과해도 산출물이 위반이면 차단."
  - "4 candidates 는 F-3.6 변형 생성과 동일 패턴입니다."

**Step C-2 — 후보 선택**

- 동작: 첫 번째 candidate 클릭 → 라디오 선택.
- 기대 응답: 선택 카드 하단에 `governance_report` (pass) + `dam_path_suggest` 자동 체이닝, `handoff_cta` ("Creative Studio 에서 세밀 편집") 버튼.
- 내레이션:
  - "선택 즉시 재검사·경로 제안까지 한 턴에 끝납니다."
  - "Studio 로 넘어가면 Generative Fill/Expand 까지 이어갈 수 있어요 (F-3.3/3.4)."

**Step C-3 (선택) — 재생성**

- 입력: `여백 더 확보해서 4개 더`
- 기대 응답: 직전 `GenerateSlots` 를 재사용 + `promptAdj` 갱신 → 새 candidates 생성.

**실패 대비**
- 4장 이미지 중 일부가 404 → `/sample/` 배치 확인. 대체로 `hero_banner_winter.jpg` 를 fallback 으로 사용.

---

### 3.4 시나리오 D — 브랜드 위반 자동 수정 (5분)

**호출되는 기능**: F-3.1 Brand AI Fix + AIFixApproval (의도 `fix`).

**상황 설정**
> "검색 결과에서 스코어가 낮은 자산을 발견했어요. 지금까지는 `/ai/inbox` 로 이동해야 했지만 Copilot 에서는 그대로 말하면 됩니다."

**Step D-1 — 대상 지정**

- 입력: `social_post_03 스코어 너무 낮네, 자동으로 고쳐줘`
- 기대 응답:
  1. 의도: `{ type: 'fix', slots: { assetId: 'a3', violationHints: ['색상 톤', '로고 여백'] } }`.
  2. "수정안 생성 중…" 2.8초.
  3. `before_after` 카드:
     - 좌 `violation_sample_red_tone.png` (45점) ↔ 우 `violation_fixed_cool_tone.png` (88점).
     - 드래그 슬라이더 또는 탭 토글.
     - 스코어 미터 변화 애니메이션 (45 → 88).
     - 위반 해결 리스트 체크마크.
  4. CTA 3종: `승인` / `거절` / `수정 요청`.
- 내레이션:
  - "자동 보정은 F-3.1 엔진과 동일 — Copilot 은 승인 워크플로를 대화에 끼워 넣었어요."
  - "스코어·위반 해결 내역이 한눈에 보입니다."
  - "승인 시 `AI_FIX_INBOX` 상태가 즉시 갱신되고, 결과물이 자산 버전으로 올라갑니다."

**Step D-2 — 승인 후 재검사**

- 동작: `승인` 클릭.
- 기대 응답: 토스트 "승인 완료" + 후속 어시스턴트 메시지 "DAM에 새 버전으로 저장할까요?" → `dam_path_suggest`.

**Step D-3 (선택) — 수정 요청**

- 동작: `수정 요청` 클릭 → 메모 입력창 나타남 → `"로고 여백은 16px 로 해줘"` 입력.
- 기대 응답: 어시스턴트 "요청을 큐에 추가했어요" + Inbox 상태 `changes_requested`.

**실패 대비**
- before/after 이미지 로드 지연 시 스켈레톤 유지. 정지 캡처 fallback 으로 `docs/presentaion/` 의 스틸컷 활용.

---

### 3.5 시나리오 E — 복합 체인: 검색 → 수정 → 재업로드 (7분)

**호출되는 기능**: `search` → `fix` → `governance_check` → `dam_path_suggest` 연쇄.

**상황 설정**
> "이게 Copilot 의 진짜 가치예요. 네 가지 의도를 한 번의 대화에서 엮습니다. 메뉴 전환 없이 업무 한 줄이 끝나는 걸 보시죠."

**Step E-1 — 저스코어 자산 검색**

- 입력: `여름 캠페인 배너 중에 스코어 60 미만인 거 보여줘`
- 기대 응답: `asset_grid` — social_post_03 포함 2~3개.

**Step E-2 — 수정 지시**

- 입력: `첫 번째 자동으로 고쳐줘`
- 기대 응답: `before_after` 카드 (시나리오 D 와 동일 구조).

**Step E-3 — 승인**

- 동작: `승인` 클릭.
- 기대 응답: 승인 토스트 + 자동 후속 메시지 "산출물을 재검사할게요."

**Step E-4 — 자동 재검사**

- 동작: (자동) `governance_check` 가 새 산출물에 대해 실행.
- 기대 응답: `governance_report` (pass, 스코어 88).

**Step E-5 — DAM 저장**

- 동작: (자동) `dam_path_suggest` 카드 출력 → 제안 경로 "확정" 클릭.
- 기대 응답: 토스트 "DAM에 새 버전으로 저장되었습니다 — /content/dam/brand/campaigns/2026-summer/social/".

**Step E-6 — 복귀 요약 (마무리)**

- 입력: `방금 한 일 요약해줘`
- 기대 응답: 어시스턴트 텍스트 —
  > "자산 `social_post_03.png` 을 찾아 브랜드 스코어를 45 → 88 로 자동 보정했고, 거버넌스 재검사를 통과해 `/content/dam/.../social/` 로 저장했어요. 걸린 시간 약 12초."

**내레이션 (E 전체)**
- "네 메뉴 이동이 다섯 개 대화로 압축됐습니다."
- "거버넌스는 입력·출력 양쪽에서 자동 동반."
- "세션 컨텍스트가 `first`, `자동으로`, `방금 한 일` 같은 지시어를 해석합니다."

**실패 대비**
- 체인 중간이 끊기면 해당 Step 의 메시지를 수동 타이핑으로 우회.
- 대본 재생 모드로 E 시나리오 녹화본 재생.

---

## 4. Q&A 대비 FAQ

| 예상 질문 | 답변 요지 |
|-----------|-----------|
| "LLM 은 어떤 모델을 쓰나요?" | 목업(M1)은 규칙 기반 파서. [07-integrated-AI §11](./07-integrated-AI.md#11-구현-로드맵) 에 따라 M3 에서 Claude API structured output 도입 예정. |
| "실제 Firefly 호출인가요?" | 현재는 2.8초 mock 대기. 실연동은 M4, Firefly Image5 / Fill / Expand / Generate API ([06-todo-integration §2.3](./06-todo-integration.md#23-firefly-services--http-api-mcp-아님)). |
| "거버넌스 규칙은 어디서 정의?" | `/settings` 의 **브랜드 거버넌스 가이드** 섹션 (F-0.3). 게시·예약·범위(전역/캠페인 오버라이드)·심각도 매핑 포함. |
| "기존 메뉴는 없어지나요?" | 아니오. Copilot 은 **독립 쇼케이스 메뉴**. `/search`, `/assets/upload`, `/ai/studio`, `/ai/inbox`, `/brand` 모두 그대로 유지. |
| "권한·ACL 은 반영되나요?" | M2 까지는 mock 전체 자산 열람. M3 부터 권한 필터를 검색 BFF에 연동 ([06-todo-integration §3.1 F-1.8](./06-todo-integration.md#31-검색ai-인프라aemfirefly-외-레이어)). |
| "AEM 실데이터 적용 시기?" | M4. Assets HTTP API + OpenAPI 로 동일 계약을 소비하도록 설계 ([06-todo-integration §2.1](./06-todo-integration.md#21-aem-assets--rest--openapi-계열)). |
| "Studio 와 어떻게 연계?" | `handoff_cta` 카드로 딥링크. 세션 컨텍스트(`selectedAssetId`, `pendingGeneration`)를 쿼리스트링으로 전달. |
| "Korean 만 되나요?" | 현재는 한국어 위주. 규칙 파서에 영어 별칭도 포함. M3 이후 다국어. |
| "다크 모드 지원?" | Provider 토큰 기반이라 자동 지원. 리허설 시 양쪽 확인 필수. |

---

## 5. 트러블슈팅 (목업 한계)

| 증상 | 원인 | 대응 |
|------|------|------|
| 샘플 이미지 404 | `public/sample/` 배치 누락 | [07-integrated-AI §10.1](./07-integrated-AI.md#10-시연용-자산-요구사항) 체크리스트로 재확인 |
| 사이드바에 Copilot 미노출 | `AppLayout.tsx` NAV_MAIN 병합 누락 | 소스 재확인 후 dev 서버 재시작 |
| 의도 파싱 잘못됨 | `copilotIntentMock.ts` 별칭 사전 누락 | 시나리오 키워드를 `SEARCH_INTENT_MOCK` 스타일 별칭에 추가 |
| 채팅 먹통 / 무응답 | 전송 중 플래그 미해제 | 새 대화 버튼으로 초기화 또는 `⌘+.` 대본 재생 |
| before/after 이미지 어긋남 | 파일 크기·비율 불일치 | 1080×1080 로 재리사이즈 |
| 스트리밍 애니메이션이 튐 | 저성능 환경 | 대본 재생 모드 사용 (애니메이션 생략 옵션) |
| DAM 경로 제안 누락 | 캠페인 슬롯 추출 실패 | 명시적 캠페인 키워드("2026 여름") 포함해 재발화 |
| `AI_FIX_INBOX` 상태 갱신 안 됨 | mock 세션 스토리지 미초기화 | 개발자 도구에서 sessionStorage 삭제 후 재시도 |

---

## 6. 체크리스트 (데모 1시간 전)

### 6.1 데이터·이미지

- [ ] `public/sample/` 에 9개 파일 배치 (필수 8 + 선택 1).
- [ ] `src/data/mock.ts` 에 `COPILOT_STARTER_PROMPTS`·`COPILOT_DEMO_TRANSCRIPTS`·`COPILOT_VIOLATION_CATALOG` 상수 존재.
- [ ] `src/data/copilotIntentMock.ts` 의 `parseCopilotIntent` 가 시나리오 6개 발화를 모두 정확 파싱.

### 6.2 리허설

- [ ] 시나리오 A~E 각 1회 라이브 + 1회 대본 재생으로 리허설.
- [ ] 다크/라이트 모드 각 1회 확인.
- [ ] 네트워크 오프라인 상태에서도 mock 만으로 동작하는지 확인.

### 6.3 발표 준비

- [ ] `docs/presentaion/` 에 각 시나리오 결정적 스틸컷 준비 (장애 대비).
- [ ] 청중별 구성표(§1.2) 중 어떤 구성으로 발표할지 확정.
- [ ] Q&A FAQ(§4) 인쇄 또는 노트앱 즐겨찾기.

### 6.4 장비

- [ ] 랩탑 배터리 70% 이상 또는 어댑터 지참.
- [ ] 외부 디스플레이 해상도 1920×1080 또는 2560×1440 권장.
- [ ] 키보드 단축키 `⌘+.` (대본 재생), `⌘+/` (슬래시 메뉴) 동작 확인.

---

## 7. 변경 이력

| 일자 | 버전 | 내용 |
|------|------|------|
| 2026-04-21 | 0.1 | 초안 작성 (시나리오 A~E + FAQ + 트러블슈팅 + 체크리스트) |
