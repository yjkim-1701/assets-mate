# Assets Mate — Assets Copilot (AI 채팅 기반 통합 관리)

> 작성일: 2026-04-21
> 상태: 초안
> 문서 인덱스: [README.md](./README.md)
> 선행 문서: [02-feature-specification.md](./02-feature-specification.md), [03-information-architecture.md](./03-information-architecture.md), [04-ui-design-guide.md](./04-ui-design-guide.md)
> 관련 데이터: [sample-images.md](./sample-images.md), [06-todo-integration.md](./06-todo-integration.md)

---

## 1. 개요

Assets Mate 는 검색(F-1.8), 업로드·생성(F-0.4), AI 편집(F-3.2~3.4), 자동 보정 승인(F-3.1), 브랜드 거버넌스(F-2.x) 등 AI 관련 기능이 **다섯 개의 메뉴·라우트**에 분산되어 있다. 전문가에게는 편리하지만, 데모 상황이나 초심 마케터에게는 "어느 메뉴에서 무엇을 해야 하는지" 진입 장벽이 된다.

**Assets Copilot** (`/ai/copilot`) 은 **Claude AI 스타일의 단일 대화창**에서 위 기능들을 **의도 기반**으로 자연스럽게 전환하며 사용하도록 묶어주는 **쇼케이스 메뉴**이다.

### 1.1 타깃 사용자

| 세그먼트 | 사용 목적 |
|----------|-----------|
| 데모 청중 (임원·고객 PoC) | "흩어진 AI 기능이 하나의 대화에서 동작한다"는 메시지를 27분 안에 체감 |
| 마케터 (신규 온보딩) | 메뉴 구조 학습 전 먼저 Copilot 으로 전체 능력을 탐색 |
| 외부 에이전시 | 단일 대화에서 업로드·거버넌스·피드백 루프 완결 |

### 1.2 차별점

- **단일 진입점**: 검색·업로드·생성·수정을 `/ai/copilot` 한 경로에서 처리.
- **의도 자동 라우팅**: 자연어를 파싱해 적합한 도구(Tool) 실행.
- **거버넌스 상시 동반**: 입력·출력 양쪽에서 브랜드 가이드 (F-0.3) 자동 검사.
- **세션 컨텍스트 연속성**: "세 번째 자산을 수정해줘" 같은 대명사·지시어 지원.
- **기존 화면 보존**: `/search`, `/assets/upload`, `/ai/studio`, `/ai/inbox`, `/brand` 은 그대로 유지 — Copilot 은 추가 진입점.

### 1.3 비포함 (범위 제외)

- 실시간 LLM 호출(M3 단계): 본 명세는 **M1 목업** 중심이고, M2~M4 는 [§11](#11-구현-로드맵) 에서 단계별 기술.
- 소셜 리사이즈(F-5.x), 최적화(F-6.x), 협업(F-4.x): 1차 범위 제외 — 후속 확장 영역.

---

## 2. 기존 기능 매핑

Copilot 은 새 기능을 만들지 않고, **기존 F-번호 기능을 의도에 따라 호출**한다. 세부 인수 조건은 [02-feature-specification.md](./02-feature-specification.md) 의 해당 항목을 따른다.

| Copilot 의도 | 호출되는 기능 | 소스 화면 | Copilot 의 역할 |
|--------------|---------------|-----------|-----------------|
| `search` | F-1.8 대화형 AI 검색 | `/search` AI 탭 | 동일 엔진·결과 표시, 채팅 스레드 안에서 카드로 렌더 |
| `governance_check` | F-0.4 업로드 허브 + F-2.1 자동 검사 | `/assets/upload` | 파일 드롭 → pass/warn/block 리포트 → DAM 경로 제안 |
| `generate` | F-0.4 텍스트 생성 + F-3.6 변형 생성 | `/assets/upload` (텍스트 모드), `/ai/studio` | 프롬프트 → 4 candidates → 선택 후 업로드/핸드오프 |
| `fix` | F-3.1 Brand AI Fix | `/ai/inbox`, `/ai/inbox/:fixId` | before/after + 스코어 변화 인라인 카드, 승인 상태 머신 |
| `inspect` | F-0.2 에셋 상세 | Asset Detail 화면 | 채팅에서 자산 상세 요약 카드 (메타·스코어·라이선스) |
| `handoff` | F-3.2~3.4 Studio | `/ai/studio/:assetId` | "더 세밀하게 편집" 시 Studio 로 심화 이동 CTA 제공 |

**원칙**: Copilot 은 동일 기능을 재구현하지 않는다. 기존 데이터·파서·평가 함수(`parseChatToIntent`, `evaluateBrandGuardrail`, `mockIngestGovernance`, `AI_FIX_INBOX` 등)를 재사용한다.

---

## 3. 사용자 의도 분류 (Intent Taxonomy)

### 3.1 최상위 의도 6종

| 의도 | 설명 | 트리거 예시 |
|------|------|-------------|
| `search` | 자산 찾기 | "여름 캠페인 승인된 소셜 이미지", "파란 톤 배너" |
| `governance_check` | 첨부 파일·프롬프트가 브랜드 가이드에 맞는지 확인 | 파일 드롭, "이거 업로드 가능해?" |
| `generate` | 신규 이미지 생성 | "겨울 프로모션 히어로 배너 만들어줘" |
| `fix` | 위반·저스코어 자산 자동 보정 | "이거 스코어 낮네 고쳐줘", "색 톤 너무 빨갛다" |
| `inspect` | 자산 상세·라이선스·버전 요약 | "첫 번째 자세히 볼래", "이 자산 만료일 언제야?" |
| `clarify` | 의도 모호 → 되물음 | 사용자 입력이 짧거나 슬롯 부족 |

### 3.2 슬롯 스키마 (TypeScript)

```ts
type CopilotIntent =
  | { type: 'search'; slots: SearchSlots }
  | { type: 'governance_check'; slots: GovernanceSlots }
  | { type: 'generate'; slots: GenerateSlots }
  | { type: 'fix'; slots: FixSlots }
  | { type: 'inspect'; slots: { assetId: string } }
  | { type: 'clarify'; question: string };

type SearchSlots = {
  query?: string;
  campaigns?: string[];      // '2026 Summer', '2025 Winter'
  channels?: string[];       // 'instagram-feed', 'email'
  seasons?: ('spring'|'summer'|'fall'|'winter')[];
  statuses?: ('approved'|'pending'|'rejected'|'exception')[];
  kinds?: ('image'|'video')[];
  aspectRatio?: '1:1'|'9:16'|'16:9'|'3:1'|string;
  dominantColors?: string[]; // HEX
  taxonomyPrefix?: string;   // 'Brand/Product/Digital'
  referenceAssetId?: string; // 비주얼 유사도
};

type GovernanceSlots = {
  attachmentSrc: string;     // object URL 또는 /sample/ 경로
  filename: string;
  promptText?: string;       // 텍스트 세션이면 프롬프트도 함께 검사
  targetDAMPath?: string;
};

type GenerateSlots = {
  promptText: string;
  aspectRatio?: string;
  resolution?: string;       // '2560x1440'
  palette?: string[];        // 선호 색
  referenceAssetId?: string; // 스타일 참조
  useCustomModel?: boolean;  // F-3.5
};

type FixSlots = {
  assetId: string;
  violationHints?: string[]; // 사용자가 지목한 위반 종류
};
```

`SearchSlots` 는 `src/data/searchIntentMock.ts` L11~L29 의 `SearchIntent` 를 그대로 확장한다 (신규 필드: `kinds`, `aspectRatio`, `referenceAssetId`).

### 3.3 파서 전략

| 단계 | 방식 | 구현 위치 (제안) |
|------|------|------------------|
| M1 | 규칙 기반 (키워드·정규식·별칭 사전) | `src/data/copilotIntentMock.ts` (신규) — 기존 `parseChatToIntent` 를 재사용·확장 |
| M2 | 규칙 + 휴리스틱 스코어링 + confirm 플로우 | 동일 파일 |
| M3 | Claude API structured output (tool_use 또는 JSON schema) | BFF 엔드포인트 `/api/copilot/intent` |
| M4 | LLM + 권한·ACL 필터 + 세션 로그 | 검색 BFF 와 통합 |

**의도 우선순위** (충돌 시): `governance_check`(첨부 존재) > `fix`(대상 자산 선택됨) > `generate`(명시적 생성 동사) > `search`(기본값).

### 3.4 대명사·지시어 해석

세션 상태에 `selectedAssetId`, `lastResultAssetIds[]`, `lastIntent` 를 보관해 다음과 같은 후속 표현을 해석한다.

| 표현 | 해석 |
|------|------|
| "첫 번째" / "세 번째" | `lastResultAssetIds[n-1]` |
| "이거" / "그 자산" | `selectedAssetId` |
| "비슷한 거 더" | `search` + `referenceAssetId = selectedAssetId` |
| "다시 만들어줘" | `generate` + 직전 `GenerateSlots` 재사용 |

---

## 4. 대화 UX 설계

### 4.1 레이아웃

**Claude 스타일** 싱글 스트림 챗봇 레이아웃을 따른다. 검색 결과·생성 후보·거버넌스 리포트 등 **모든 도구 카드는 대화 스트림 안에 인라인**으로 렌더한다. 우측 결과 패널·분할 뷰는 두지 않는다.

**메시지 정렬 원칙 (Claude 스타일)**

- **사용자 메시지**: 작성한 분량만큼의 **말풍선(pill bubble)** 으로 **우측 정렬**. 최대 폭은 스트림 폭의 약 70% (대략 560px 까지). 배경색으로 시각 구분.
- **어시스턴트 응답**: 말풍선 없이 **스트림 폭 전체에 좌→우로 꽉 차게** 렌더. 좌측에 32×32 아바타, 텍스트·도구 카드·CTA 는 아바타 우측부터 **콘텐츠 폭(최대 880px) 전체를 사용**. 배경은 페이지 배경과 동일(레이어 없음).

```
┌───────────────┬──────────────────────────────────────────────────────┐
│  기존 사이드바 │          대화 스트림 (싱글 컬럼, max 880px 중앙)       │
│  (260px)      │                                                      │
│               │                                                      │
│ · Dashboard   │  ◉  (assistant — 풀 폭, 좌→우 꽉 참, 배경 없음)         │
│ · Assets      │  자산 3개를 찾았어요.                                 │
│   Copilot ✦   │  ┌────────── asset_grid (인라인, 풀 폭) ───────────┐  │
│ · AI Creative │  │ [썸네일]  [썸네일]  [썸네일]                     │  │
│ · Search      │  └────────────────────────────────────────────────┘  │
│ · Brand       │                                                      │
│ ─────────     │                   ╭─ user ─────────────────╮         │
│ · Workspace…  │                   │ 첫 번째 자세히 볼래     │ ← 우측  │
│               │                   ╰───────────────────────╯  정렬    │
│               │                                                      │
│               │  ◉  (assistant — 풀 폭)                               │
│               │  요청하신 자산 상세입니다.                            │
│               │  ┌────────── asset_detail (인라인, 풀 폭) ─────────┐ │
│               │  │ [큰 미리보기]  [메타 · 스코어 · 라이선스 · CTA]  │ │
│               │  └────────────────────────────────────────────────┘ │
│               │                                                      │
│               │  ┌─ 입력창 (sticky 하단, 콘텐츠 폭과 동일, 중앙) ─┐   │
│               │  │ 📎  무엇을 도와드릴까요…                    ↵ │   │
│               │  └─────────────────────────────────────────────────┘   │
└───────────────┴──────────────────────────────────────────────────────┘
```

- **좌 사이드바**: [04-ui-design-guide.md](./04-ui-design-guide.md) 의 기존 NAV_MAIN 을 유지하고, `Assets Copilot` 항목을 추가. 아이콘 후보: `Chat` / `MagicWand` / `RobotSparkle` (Spectrum Workflow Icons).
- **대화 스트림 (싱글 컬럼)**: 사이드바 우측 전 영역을 사용하되 **콘텐츠 폭은 중앙 고정(최대 880px)**. Claude·ChatGPT 식 "하나의 세로 스크림". 모든 메시지·도구 카드·CTA 가 위→아래로 시간순 누적.
- **사용자 메시지 (우측 정렬 말풍선)**: 옅은 accent 배경(`#EFF6FF` 또는 `informative-200`), borderRadius 16, 패딩 12/16, `maxWidth: 70%`, 오른쪽 끝 정렬 (`margin-left: auto`). 짧은 텍스트는 짧게, 긴 텍스트는 자동 줄바꿈.
- **어시스턴트 메시지 (풀 폭)**: 배경 없음(페이지 배경 그대로). 좌측 아바타(32×32) 고정, 아바타 우측부터 **콘텐츠 폭 전체**를 본문·카드·CTA 에 할당. 텍스트는 자유 줄바꿈. 도구 카드는 이 풀 폭 안에서 내부 그리드를 구성.
- **도구 카드 인라인 렌더**: `asset_grid`, `asset_detail`, `generation_preview`, `before_after`, `governance_report`, `dam_path_suggest`, `handoff_cta` 가 **모두 어시스턴트 메시지 풀 폭 안**에 카드 형태로 삽입 — 별도 패널·말풍선으로 승격하지 않는다.
- **카드 내부 스크롤**: 카드가 뷰포트를 넘길 가능성이 있는 경우(다수 candidates, 긴 위반 리스트) 카드 자체에 가로 스크롤 또는 "더 보기" 접기. 대화 스트림의 수직 흐름은 깨지 않는다.
- **입력창**: 스트림 하단에 sticky, 콘텐츠 폭과 동일하게 중앙 정렬.
- **반응형**: 1024px 미만에서도 동일 싱글 컬럼 유지 (사이드바만 아이콘 모드/오버레이로 축소). 사용자 말풍선의 `maxWidth` 는 화면 폭에 비례해 좁은 화면에서 최대 85%까지 허용.

### 4.2 메시지 타입

| 역할 | 종류 | 정렬·폭 | 렌더 |
|------|------|---------|------|
| `user` | `text` | **우측 정렬**, `maxWidth: 70%` (모바일 85%) | 옅은 accent 배경(`#EFF6FF` 또는 `informative-200`) 말풍선, borderRadius 16, 패딩 12/16. 짧으면 짧게, 내용 길이만큼만 부푼다. 아바타 없음. |
| `user` | `attachment` | **우측 정렬**, `maxWidth: 70%` | 말풍선 내부에 썸네일(80×80) + 파일명 + 사이즈(옵션 텍스트 동반 가능). |
| `assistant` | `text` | **풀 폭**, 콘텐츠 폭(880px) 전체 사용 | 배경 없음(페이지 배경). 좌측 아바타(32×32, `copilot_hero_avatar.png`) 고정, 아바타 우측부터 본문. 긴 응답은 자연스러운 문단 흐름. |
| `assistant` | `tool_card` | **풀 폭**, 콘텐츠 폭 전체 | 어시스턴트 본문 아래에 카드(borderRadius 12, 옅은 테두리 `CM.cardBorder`, 선택적 `CM.panelBg` 배경) 로 삽입. 카드 자체가 풀 폭을 차지. |
| `assistant` | `error` | **풀 폭** | `InlineAlert variant="negative"` + 재시도 버튼. |

> **Claude 스타일 정렬 요약**: 사용자 = 말풍선 + 우측 정렬, 어시스턴트 = 말풍선 없이 좌→우 풀 폭. 좌우 대비로 발화자가 구분되고, 도구 카드는 어시스턴트의 풀 폭 영역에만 놓여 시각 위계가 선명하다.

### 4.3 도구 카드 종류

| 카드 | 표시 내용 | 재사용 컴포넌트 |
|------|-----------|-----------------|
| `asset_grid` | 최대 6개 썸네일 + 이름 + 스코어 배지 + "상세" CTA | `CardView`, `MutedBadge` |
| `asset_detail` | 미리보기 + 메타 + 스코어 미터 + 라이선스 칩 + 액션 링크 | `Meter`, `TagGroup`, `MutedProgressBar` |
| `governance_report` | pass/warn/block 헤더 + 위반 항목 리스트 + 근거 가이드 링크 | `InlineAlert`, `<ul>`, `MutedBadge` |
| `generation_preview` | 4 candidates 2×2 그리드 + "이걸로 선택" 라디오 + 재생성 버튼 | `GenerativeFillPanel.tsx` 패턴 |
| `before_after` | 좌 before + 우 after + 스코어 변화 미터 + 승인/거절/수정요청 CTA | `AIFixApproval.tsx` 패턴 |
| `dam_path_suggest` | 제안 경로 + "폴더 탐색" + "확정" | `AssetUpload.tsx` L80~L90 패턴 |
| `handoff_cta` | "AI Creative Studio 에서 계속 편집하기" 버튼 | `AccentButton` + 외부 링크 아이콘 |

### 4.4 입력 어포던스

| 요소 | 동작 |
|------|------|
| TextArea | Enter 전송, Shift+Enter 줄바꿈, auto-height 40~160px |
| 📎 파일 첨부 | 클릭 업로드 또는 드래그 드롭, image/*, video/* 제한, 최대 20MB |
| ✦ 제안 칩 (Starter Prompts) | 스레드 비어있을 때만 6개 노출, 클릭 시 입력창 주입 후 커서 고정 |
| ↵ 전송 버튼 | `AccentButton` + `Send` 아이콘, disabled 조건: 입력 비어있음 또는 전송 중 |
| ⌨ ⌘/ | 슬래시 메뉴 — `/search`, `/generate`, `/upload`, `/fix` 로 의도 강제 |
| ⌨ ⌘. | 대본 재생 모드(데모용) — `COPILOT_DEMO_TRANSCRIPTS` 순차 재생 |

### 4.5 스트리밍·로딩 표현

M1 목업에서는 실제 스트리밍이 없으므로 다음 애니메이션으로 대체한다.

| 단계 | 동작 (목업) | 지속 시간 |
|------|-------------|-----------|
| 의도 파싱 | 아바타 옆 3-dot 펄스 | 500ms |
| 도구 실행 | 카드 자리에 스켈레톤 + `ProgressBar` | 800~2800ms |
| 텍스트 출력 | 글자 한 글자씩 페이드인 (≈ 20ms/char) | 가변 |
| 완료 | 카드 opacity 0→1, 스크롤 스냅 | 200ms |

`MOCK_AI_MS = 2800` (AICreativeStudio.tsx 재사용 상수)를 기준으로 유지한다.

### 4.6 제안 프롬프트 (Starter Prompts)

`src/data/mock.ts` 에 `COPILOT_STARTER_PROMPTS: string[]` 배열로 보관:

1. `"2026 여름 캠페인 중에 승인된 1:1 소셜 이미지 보여줘"` → `search`
2. `"이 파일 브랜드 가이드에 맞는지 확인해줘"` (파일 드롭 유도) → `governance_check`
3. `"겨울 프로모션 히어로 배너 만들어줘, 2560×1440, 블루 톤"` → `generate`
4. `"social_post_03 스코어 너무 낮네, 자동으로 고쳐줘"` → `fix`
5. `"product_lifestyle_01 라이선스 상태 알려줘"` → `inspect`
6. `"이 에이전시 제출본 검토하고 DAM에 올려도 될지 봐줘"` (파일 드롭 유도) → `governance_check`

---

## 5. 핵심 플로우 4종

### 5.1 검색 플로우 (`search`)

**호출되는 기능**: F-1.8 대화형 AI 검색.

**상태 다이어그램**

```
user(text) → parser → assistant(tool_card: asset_grid)
                   ↘ (clarify 필요 시) assistant(text: 되물음)
user("첫 번째 자세히") → selectedAssetId 갱신 → assistant(tool_card: asset_detail)
```

**의도 파싱 예시**

입력: `"2026 여름 캠페인 중에 승인된 1:1 소셜 이미지 보여줘"`

```json
{
  "type": "search",
  "slots": {
    "campaigns": ["2026 Summer"],
    "statuses": ["approved"],
    "aspectRatio": "1:1",
    "kinds": ["image"]
  }
}
```

**결과**: `src/lib/assetSearch.ts` 가 `ASSETS` 필터링 → `asset_grid` 카드를 어시스턴트 메시지 **인라인**에 렌더 (상위 6개 썸네일, 각 카드에 상태 배지 `MutedBadge tone="success"` + 브랜드 스코어 `Meter`). 카드 폭은 스트림 최대 폭(768~880px)에 맞춰 2~3열로 자동 조정.

**인수 조건**
- [ ] 승인 상태·캠페인·비율·종류 슬롯이 정규식으로 파싱된다.
- [ ] 결과 카드 클릭 시 `asset_detail` 카드를 동일 스레드에 추가한다.
- [ ] 결과 0건이면 "찾지 못했어요. 조건을 완화해볼까요?" 와 완화 제안 칩.

### 5.2 거버넌스 체크 업로드 (`governance_check`)

**호출되는 기능**: F-0.4 업로드 허브 + F-2.1 자동 검사.

**트리거**: 파일 드롭 / 클립 아이콘 / "검사해줘" 발화.

**상태 머신** (기존 F-0.4 재사용)

```
awaiting_content ── user attaches image ──▶ check_running
check_running ── mockIngestGovernance() ──▶ result ∈ {pass, warn, block}
pass  → dam_path_suggest → user 확정 → done
warn  → 위반 나열 + "그래도 올릴까요?" → 확인 시 done
block → 차단 사유 + "자동 수정 시도" CTA (→ fix 의도 핸드오프)
```

**mockIngestGovernance 확장 규칙** (기존 `src/pages/AssetUpload.tsx` L24~L49 재사용, 추가 규칙 명세)

| 파일명 힌트 | 결과 |
|-------------|------|
| `block`, `금지`, `forbidden` 포함 | block — "금지 자산 규칙 위반" |
| `warn`, `위반`, `risk` 포함 | warn — 경고 나열 |
| 해상도 < 800px | warn — "해상도가 낮습니다" |
| 기타 | pass |

**프롬프트 검사** (텍스트 생성과 함께 첨부한 경우): `mockGovernanceForTextPrompt` (`AssetUpload.tsx` L52~L77) 재사용.

**DAM 경로 제안**: `DAM_SELECTABLE_PATHS` (`AssetUpload.tsx` L80~L90) + 캠페인 슬롯 기반 후보 1개 자동 선택.

**인수 조건**
- [ ] 파일 첨부 후 2.8초 내 `governance_report` 카드가 스트리밍된다.
- [ ] block 결과에서 "자동 수정 시도" CTA 클릭 시 동일 파일을 `fix` 의도로 핸드오프한다.
- [ ] pass 결과에서 DAM 경로 제안 카드가 이어서 출력된다.

### 5.3 이미지 생성 플로우 (`generate`)

**호출되는 기능**: F-0.4 텍스트 모드 + F-3.6 변형.

**입력 예시**: `"겨울 프로모션 히어로 배너 만들어줘, 2560×1440, 블루 톤"`

**파이프라인**

1. 프롬프트 거버넌스 체크 (`mockGovernanceForTextPrompt`): 금지 단어·경쟁 브랜드 필터.
2. 통과 시 4 candidates 생성 mock — `winter_promo_generated_01~04.png` 로테이션.
3. `generation_preview` 카드에 2×2 그리드 + 각 썸네일의 `promptAdj` (예: "더 쿨한 톤", "여백 더 확보") 표시.
4. 사용자가 1개 선택 → `governance_check` 재실행(출력물 재검사) → pass 면 DAM 경로 제안.
5. warn/block 결과면 "재생성" 또는 "자동 수정" 제시.

**후속 의도 핸드오프**
- "더 세밀하게 편집할래" → `/ai/studio/:assetId` 로 딥링크 (`handoff_cta` 카드).
- "변형 4개 더" → `generate` + 선택한 이미지를 `referenceAssetId` 로 재실행 (F-3.6).

**인수 조건**
- [ ] 해상도·비율·팔레트 슬롯이 프롬프트에서 추출된다.
- [ ] 생성 후 자동 재검사가 동반된다.
- [ ] Studio 핸드오프 CTA 가 항상 candidates 카드 하단에 존재한다.

### 5.4 브랜드 위반 수정 플로우 (`fix`)

**호출되는 기능**: F-3.1 Brand AI Fix.

**진입 경로 3가지**
- 검색 결과 자산 카드의 "수정" 버튼.
- 업로드 block 결과의 "자동 수정 시도" CTA.
- 직접 발화: `"social_post_03 스코어 낮네 고쳐줘"`.

**카드 렌더**: `before_after` 카드 — 좌 before(`violation_sample_red_tone.png`), 우 after(`violation_fixed_cool_tone.png`), 하단 스코어 미터(45 → 88).

**승인 상태 머신** (기존 `AI_FIX_INBOX` 재사용)

```
pending → approved / rejected / changes_requested
```

각 CTA 는 `AI_FIX_INBOX` 의 해당 레코드 상태를 갱신(mock).

**인수 조건**
- [ ] before/after 이미지가 좌우로 정렬되며 드래그 슬라이더로 비교 가능하다.
- [ ] 승인 시 `AI_FIX_INBOX[].status` 가 `approved` 로 갱신되고 토스트로 알린다.
- [ ] "수정요청" 선택 시 사용자 메모를 받는 하위 입력창이 열린다.

---

## 6. 복합·연쇄 플로우

Copilot 의 핵심 가치는 여러 의도를 한 세션에서 매끄럽게 잇는 것이다.

### 6.1 예시 시나리오 — "여름 배너 찾기 → 위반 자산 수정 → 재업로드"

```
1. user: "여름 캠페인 배너 중에 스코어 낮은 것 보여줘"
   → search (statuses 생략, brandScore < 60 필터)
   → asset_grid (social_post_03 포함)

2. user: "첫 번째 수정해줘"
   → selectedAssetId = 'a3' (social_post_03)
   → fix (violationHints 자동 추론: ['색상 톤', '로고 여백'])
   → before_after 카드 + 승인 CTA

3. user: "승인할래, 그리고 DAM에 새 버전으로 저장"
   → fix.approve() → AI_FIX_INBOX 갱신
   → governance_check (출력물 재검사) → pass
   → dam_path_suggest → 사용자 확정 → done
```

### 6.2 세션 컨텍스트 모델

```ts
type CopilotSession = {
  messages: CopilotMessage[];
  selectedAssetId?: string;
  lastResultAssetIds: string[];
  lastIntent?: CopilotIntent;
  lastGovernanceReport?: ToolCard & { kind: 'governance_report' };
  pendingGeneration?: GenerateSlots;
  pendingUploadFile?: { src: string; filename: string };
};
```

컨텍스트는 라우트 이탈 시 sessionStorage 에 저장(신규 세션 진입 시 "이어서 하기" 제안).

### 6.3 핸드오프 매트릭스

| 원 의도 | 다음 의도 후보 | 트리거 |
|---------|----------------|--------|
| `search` | `inspect`, `fix`, `generate(참조)` | 결과 카드 클릭, "수정", "비슷한 거 더" |
| `governance_check` | `fix`, `generate(재작성)` | block 결과 CTA |
| `generate` | `governance_check`(자동), `handoff(Studio)`, `generate(변형)` | 완료 후 / "편집"/"변형" |
| `fix` | `governance_check`(재검사), `inspect` | 승인 후 |
| `inspect` | `search(유사)`, `fix` | "비슷한 거", "고쳐줘" |

---

## 7. 데이터 모델

### 7.1 메시지·세션 타입

[§3.2](#32-슬롯-스키마-typescript), [§6.2](#62-세션-컨텍스트-모델) 참고. 추가:

```ts
type CopilotMessage =
  | {
      id: string;
      role: 'user';
      kind: 'text' | 'attachment';
      text?: string;
      attachment?: {
        type: 'image' | 'asset';
        src: string;
        filename?: string;
        assetId?: string;
      };
      ts: number;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'text' | 'tool_card' | 'error';
      text?: string;
      card?: ToolCard;
      ts: number;
    };

type ToolCard =
  | { kind: 'asset_grid'; assets: AssetLite[] }
  | { kind: 'asset_detail'; asset: AssetFull }
  | { kind: 'governance_report'; result: 'pass'|'warn'|'block'; violations: ViolationRef[]; sourceRuleId?: string }
  | { kind: 'generation_preview'; candidates: { src: string; promptAdj: string }[]; chosenIndex?: number }
  | { kind: 'before_after'; fixId: string; before: string; after: string; scoreBefore: number; scoreAfter: number; status: 'pending'|'approved'|'rejected'|'changes_requested' }
  | { kind: 'dam_path_suggest'; suggested: string; alternatives: string[] }
  | { kind: 'handoff_cta'; targetRoute: string; label: string };

type AssetLite = Pick<Asset, 'id'|'name'|'brandScore'|'status'|'dim'|'type'|'thumbnail'>;
type AssetFull = Asset; // src/data/mock.ts 의 Asset
type ViolationRef = { code: string; label: string; guideSectionId?: string };
```

### 7.2 Mock 데이터 추가

`src/data/mock.ts` 에 추가해야 할 상수:

```ts
export const COPILOT_STARTER_PROMPTS: string[] = [ /* §4.6 6개 */ ];

export type CopilotDemoTranscript = {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  steps: CopilotMessage[]; // 사전 녹화 대본
};

export const COPILOT_DEMO_TRANSCRIPTS: CopilotDemoTranscript[] = [ /* 99-demo-scenario.md 와 1:1 매핑 */ ];

export const COPILOT_VIOLATION_CATALOG: { code: string; label: string; severity: 'pass'|'warn'|'block' }[] = [
  { code: 'color-red-dominant', label: '브랜드 팔레트 외 강한 적색', severity: 'warn' },
  { code: 'logo-margin-insufficient', label: '로고 여백 12px 미만', severity: 'warn' },
  { code: 'forbidden-competitor', label: '경쟁 브랜드 요소', severity: 'block' },
  { code: 'font-non-brand', label: '비표준 폰트', severity: 'warn' },
  { code: 'license-expired', label: '라이선스 만료', severity: 'block' },
];
```

신규 파일: `src/data/copilotIntentMock.ts` — `parseCopilotIntent(text, session): CopilotIntent` 를 export. 기존 `parseChatToIntent` 를 호출해 `search` 슬롯을 1차 채우고, 추가 동사/명사 규칙으로 다른 의도로 승격한다.

---

## 8. 거버넌스 가드레일 통합

Copilot 은 모든 **입력·출력** 단계에서 거버넌스를 자동 동반한다. 명세는 F-0.3 설정 허브의 "브랜드 거버넌스 가이드" 와 F-2.1 자동 검사 규칙을 재사용한다.

### 8.1 검사 지점

| 단계 | 검사 함수 (목업) | 소스 |
|------|-------------------|------|
| 사용자 프롬프트 입력 | `mockGovernanceForTextPrompt` | `src/pages/AssetUpload.tsx` L52~L77 |
| 파일 첨부 | `mockIngestGovernance` | `src/pages/AssetUpload.tsx` L24~L49 |
| 생성 결과물 | `evaluateBrandGuardrail` | `src/pages/AICreativeStudio.tsx` L143~L149 |
| 수정 결과물 | `evaluateBrandGuardrail` + 스코어 재계산 | 동일 |

### 8.2 위반 응답 포맷

`governance_report` 카드는 `COPILOT_VIOLATION_CATALOG` 의 `code` 로 위반 항목을 참조하고, 각 위반 옆에 가이드 섹션 링크를 단다. 링크 클릭 시 `/settings?section=governance&rule={code}` 로 이동(설정 허브 내 해당 규칙으로 스크롤, 후속 구현 영역).

### 8.3 severity 별 UX

| severity | 메시지 톤 | CTA |
|----------|-----------|-----|
| `pass` | `InlineAlert variant="positive"` | "계속", "DAM 경로 선택" |
| `warn` | `InlineAlert variant="notice"` | "그래도 진행", "자동 수정" |
| `block` | `InlineAlert variant="negative"` | "다시 시도", "자동 수정 시도" (업로드/확정 불가) |

---

## 9. UI 컴포넌트 매핑

기존 Spectrum 2 + 프로젝트 커스텀 컴포넌트를 최대한 재사용한다. 신규 구현은 "채팅 스레드 + 메시지 버블" 만 한정한다.

| Copilot UI | 재사용 컴포넌트 | 경로 |
|------------|-----------------|------|
| 사이드바 진입 항목 | `SidebarNavItem` | `src/components/AppLayout.tsx` |
| 대화 스트림 컨테이너 | 싱글 컬럼, 세로 스크롤, 콘텐츠 폭 `maxWidth: 880` 중앙 정렬 | 신규 유틸 |
| 유저 말풍선 (우측 정렬) | 옅은 accent 배경(`#EFF6FF` 또는 `informative-200`), `borderRadius: 16`, `padding: 12/16`, `maxWidth: 70%`, `margin-left: auto` | 신규 |
| 유저 첨부 메시지 | 말풍선 내부에 80×80 썸네일 + 파일명 + 사이즈 (우측 정렬 유지) | 신규 |
| 어시스턴트 행 (풀 폭) | 배경 없음, 좌측 32×32 아바타 고정, 아바타 우측은 콘텐츠 폭 전체 사용 | 신규 |
| 어시스턴트 아바타 | 신규 `Avatar` (원형 `<img src="/sample/copilot_hero_avatar.png" />`, 32×32) | — |
| 어시스턴트 본문 텍스트 | 페이지 배경에 바로 텍스트 (말풍선 없음), 자연 단락 흐름 | `@react-spectrum/s2` `Text` |
| 입력창 (sticky 하단) | `TextArea` auto-height (`AssetUpload.tsx` L158~L163), 스트림 폭과 동일하게 중앙 고정 | `@react-spectrum/s2` |
| 파일 첨부 | `<input type="file">` + 드래그 드롭 영역 | `AssetUpload.tsx` L170~L173 |
| 전송 버튼 | `AccentButton` + `Send` 아이콘 | `src/components/AccentButton.tsx` |
| 제안 칩 | `MutedBadge` 변형 (clickable), 빈 상태에서 스트림 중앙 세로 배치 | `src/components/MutedBadge.tsx` |
| asset_grid 카드 (인라인) | `CardView` 2~3열 그리드, 카드 폭에 맞춰 자동 조정 | `@react-spectrum/s2` |
| asset_detail 카드 (인라인) | `Meter` + `TagGroup` + 기존 AssetDetail 뷰 축약 | `@react-spectrum/s2` |
| governance_report (인라인) | `InlineAlert` + `<ul>` | `@react-spectrum/s2` |
| generation_preview (인라인) | 2×2 그리드 + 필터 효과, 카드 내부에 고정 | `src/components/GenerativeFillPanel.tsx` L21~L26 패턴 |
| before_after (인라인) | 2열 Flex + `Meter` 비교 (카드 폭 내 가로 분할) | `src/pages/AIFixApproval.tsx` 패턴 |
| 로딩 스켈레톤 | `ProgressBar` + 회색 박스 (카드 자리 유지) | `@react-spectrum/s2` |
| 스트리밍 애니메이션 | CSS `@keyframes fade-in`, 새 카드 삽입 시 자동 스크롤 바텀 스냅 | 신규 유틸 |

> **레이아웃 원칙**: 모든 도구 카드는 어시스턴트 메시지 내부의 인라인 블록으로만 렌더. 분할 뷰·우측 패널·팝오버 모달은 사용하지 않는다. 큰 미디어는 카드 내부에서 `object-fit: contain` + "전체 화면으로 보기" 버튼으로 해결.

### 9.1 사이드바 진입점 추가 위치

`src/components/AppLayout.tsx` L133~138 의 `NAV_MAIN` 배열에 다음을 추가(실제 코드 변경은 후속 작업):

```tsx
{ to: '/ai/copilot', Icon: ChatBubble /* 또는 MagicWand */, label: 'Assets Copilot' }
```

`NAV_MAIN` 순서 권장: `Dashboard → Assets Copilot ✦ → AI Creative → Search & Discovery → Brand Governance`. Copilot 에 "NEW" 또는 "✦" 배지를 붙여 눈에 띄게 한다.

### 9.2 라우트 추가 위치

`src/App.tsx` L24~L47 의 `<Routes>` 에 다음을 추가:

```tsx
<Route path="/ai/copilot" element={<AssetsCopilot />} />
```

신규 페이지: `src/pages/AssetsCopilot.tsx` — 본 문서 §4~§6 의 UX 를 구현.

---

## 10. 시연용 자산 요구사항

본 섹션은 [sample-images.md](./sample-images.md) 의 표 서식을 따른다. 모든 파일은 `public/sample/` 에 배치하고 URL 은 `/sample/...` 로 참조한다.

### 10.1 신규 파일 목록

| 파일명 | 해상도 | 용도 |
|--------|--------|------|
| `copilot_hero_avatar.png` | 128×128 | Copilot 어시스턴트 아바타 (메시지 옆 원형) |
| `winter_promo_generated_01.png` | 2560×1440 | 생성 candidate 1 — 쿨 톤, 설경 |
| `winter_promo_generated_02.png` | 2560×1440 | 생성 candidate 2 — 웜 액센트 |
| `winter_promo_generated_03.png` | 2560×1440 | 생성 candidate 3 — 미니멀 |
| `winter_promo_generated_04.png` | 2560×1440 | 생성 candidate 4 — 여백 확보형 |
| `violation_sample_red_tone.png` | 1080×1080 | 위반 예시 (적색 과포화, 로고 여백 부족) |
| `violation_fixed_cool_tone.png` | 1080×1080 | 자동 수정 after (쿨 톤, 여백 확보) |
| `agency_submit_warn.jpg` | 1920×1080 | 파일명에 `warn` 포함 → 경고 데모용 |
| `agency_submit_block.jpg` | 1920×1080 | 파일명에 `block` 포함 → 차단 데모용 |
| `copilot_starter_thumb.png` | 640×360 | 빈 상태 배너 (제안 칩 상단 일러스트, 선택) |

**공통 Negative prompt** (AI 생성 시): `text, watermark, logo, trademark, distorted hands, low resolution, oversaturated`

### 10.2 자산별 상세

#### `copilot_hero_avatar.png` (128×128)

- **용도**: 어시스턴트 메시지 버블 좌측 아바타.
- **구도·무드**: 원형 크롭 가능한 중앙 정렬, Adobe 브랜드 블루(`#1D4ED8`) 계열 + 살짝의 마젠타 액센트, 추상적 "반짝임/AI" 형태.
- **스톡 키워드**: `abstract AI spark emblem`, `minimal gradient orb`, `soft brand mark`
- **AI 생성**:
  `Minimal abstract AI assistant avatar, soft gradient blue to teal with subtle magenta highlight, centered radial composition, circular crop ready, flat modern style, clean background, premium enterprise look, no face no eyes no letters`
- **주의**: 얼굴·사람 형상 금지(서비스 톤). 텍스트·로고 금지.

#### `winter_promo_generated_01~04.png` (2560×1440)

- **용도**: "겨울 프로모션 히어로 배너" 생성 데모의 4 candidates.
- **구도·무드**: 16:9, 겨울 톤, 좌측 또는 하단 1/3 카피 공간. 4장 서로 다른 분위기 (쿨/웜/미니멀/여백).
- **스톡 키워드**: `winter campaign hero wide`, `snow landscape ad banner`, `minimal cold commercial`
- **AI 생성 (대표 프롬프트, candidate 1)**:
  `Cinematic winter campaign hero 2560x1440, cool blue palette, soft snowfall, ample negative space on the left for headline, premium advertising photography, no text, no logo`
- **candidate 2~4 프롬프트 변형**: `warm amber accent lighting`, `ultra minimalist with single silhouette`, `wide horizon with copy area bottom third`
- **주의**: 4장 모두 동일 씬이 아니라 서로 다른 무드여야 "변형 의도"가 설득적이다.

#### `violation_sample_red_tone.png` (1080×1080)

- **용도**: 브랜드 위반 수정(F-3.1) 데모의 before.
- **구도·무드**: 1:1, 의도적으로 **과포화 적색**, 로고 자리를 가장자리 0~4px 에 꽉 붙게 배치한 것처럼 보이는 mock.
- **스톡 키워드**: `oversaturated red product flat lay`, `bold red ad square`
- **AI 생성**:
  `Square 1:1 ad layout, intentionally oversaturated red tones dominating the composition, commercial product on a red surface, minimal margin at all edges, advertising photography, no text, no logo`
- **주의**: 실제 브랜드 로고 삽입 금지 — "로고 여백 부족" 시나리오는 UI 오버레이로 시각화.

#### `violation_fixed_cool_tone.png` (1080×1080)

- **용도**: 동일 자산의 after — 쿨 톤 재조정 + 여백 확보.
- **구도·무드**: 1:1, 틸/시안 베이스, 가장자리 12~16px 여백, 브랜드 팔레트 근접.
- **AI 생성**:
  `Square 1:1 ad layout, cool teal-cyan balanced palette, product centered with generous safe margin, brand-friendly mood, clean studio photography, no text, no logo`
- **주의**: before 와 동일 피사체·구도 유지가 이상적 (동일 씬 재촬영 느낌).

#### `agency_submit_warn.jpg` (1920×1080)

- **용도**: 파일명 힌트 `warn` 으로 거버넌스 경고 데모.
- **구도·무드**: 일반 에이전시 제출본 같은 와이드 배너, 미미한 색 편차.
- **스톡 키워드**: `agency campaign banner draft`, `brand refresh wide`
- **AI 생성**: `Full HD 1920x1080 marketing banner, subtle off-brand tonal drift, modern minimalist, space for text on left, corporate aesthetic, no text no logo`
- **주의**: 시나리오상 파일명이 중요하므로 **반드시 `agency_submit_warn.jpg` 로 저장**.

#### `agency_submit_block.jpg` (1920×1080)

- **용도**: 파일명 힌트 `block` 으로 차단 데모.
- **구도·무드**: 경쟁 브랜드 컬러 암시(보라·네온 그린 등), 혹은 강한 비표준 요소.
- **AI 생성**: `Full HD banner with non-brand vivid neon green and purple accents, aggressive composition, clearly off-brand for a conservative enterprise palette, no text no logo`
- **주의**: 파일명 `agency_submit_block.jpg` 엄수. 실제 경쟁사 요소는 넣지 말 것.

#### `copilot_starter_thumb.png` (640×360, 선택)

- **용도**: 스레드가 비었을 때 Copilot 소개 배너. 제안 칩 상단에 배치.
- **구도·무드**: 16:9, 추상 그라데이션 + 대화 말풍선 실루엣.
- **AI 생성**: `Abstract empty state banner, gradient blue to teal, subtle chat bubble silhouettes, minimal corporate illustration, no text`

### 10.3 기존 자산 재활용

| 기존 파일 | Copilot 에서의 역할 |
|-----------|---------------------|
| `campaign_summer_hero.jpg` | 검색 시나리오 결과 그리드 썸네일 |
| `social_post_03.png` | 위반 자산 후보, `fix` 의도 진입점 |
| `product_lifestyle_01.jpg` | `inspect` 의도 데모 (라이선스·메타) |
| `hero_banner_winter.jpg` | 생성 candidate 중 1장으로 재활용 가능 |
| `summer_banner_v3.png` | 복합 체인 시나리오 (검색→수정→업로드) 중간 자산 |

### 10.4 체크리스트

- [ ] 10.1 의 9개 파일(필수 8 + 선택 1)을 `public/sample/` 에 배치.
- [ ] 파일명 규칙 엄수 (`warn`, `block` 키워드 포함).
- [ ] 브랜드 로고·경쟁사 상표 비포함 확인.
- [ ] 각 candidate 간 서로 다른 무드 식별 가능.

---

## 11. 구현 로드맵

| 단계 | 범위 | 의존 | 산출물 |
|------|------|------|--------|
| **M1 — 목업 UI** | 사이드바 항목·`/ai/copilot` 라우트·채팅 UI·제안 칩·대본 재생 모드(`COPILOT_DEMO_TRANSCRIPTS`) | 10.1 이미지 배치, `src/data/mock.ts` 확장 | 데모 가능한 정적 시연 |
| **M2 — 반실연동** | `parseCopilotIntent` 규칙 기반 파서, `ASSETS` 실시간 필터링, `mockIngestGovernance`/`evaluateBrandGuardrail` 호출, `AI_FIX_INBOX` 상태 머신 연동 | M1 | 실시간 탐색 가능한 목업 |
| **M3 — LLM 연동** | Claude API structured output (tool_use 또는 JSON schema), 스트리밍, 권한·ACL 필터 | BFF 엔드포인트 `/api/copilot/{intent,chat}` | 자연어 이해 수준 향상 |
| **M4 — 백엔드 실연동** | AEM Assets HTTP API, Firefly API (Image5 / Fill / Expand / Generate), 실제 거버넌스 엔진, Inbox 영속화 | [06-todo-integration.md](./06-todo-integration.md) §2, §3 | 프로덕션 Copilot |

각 단계는 독립 배포 가능하며, 기존 화면은 영향받지 않는다 (독립 메뉴 원칙).

---

## 12. 관련 파일·다음 액션

### 12.1 신규 또는 수정 예정 파일

| 경로 | 변경 유형 | 목적 |
|------|-----------|------|
| `src/pages/AssetsCopilot.tsx` | 신규 | Copilot 페이지 본체 |
| `src/components/AppLayout.tsx` | 수정 (L133~L138) | NAV_MAIN 에 Copilot 항목 추가 |
| `src/App.tsx` | 수정 (L24~L47) | `/ai/copilot` 라우트 추가 |
| `src/data/copilotIntentMock.ts` | 신규 | `parseCopilotIntent(text, session)` |
| `src/data/mock.ts` | 수정 | `COPILOT_STARTER_PROMPTS`, `COPILOT_DEMO_TRANSCRIPTS`, `COPILOT_VIOLATION_CATALOG` 추가 |
| `public/sample/copilot_hero_avatar.png` 외 8개 | 신규 | [§10](#10-시연용-자산-요구사항) 참조 |
| `docs/99-demo-scenario.md` | 신규 | 시연 대본 (본 문서와 짝) |

### 12.2 재사용 모듈 (건드리지 않음)

| 경로 | 역할 |
|------|------|
| `src/data/searchIntentMock.ts` | `parseChatToIntent`, `SearchIntent` — Copilot 의 `search` 슬롯 파싱 기반 |
| `src/lib/assetSearch.ts` | 자산 필터링·시맨틱 스코어 |
| `src/pages/AssetUpload.tsx` (참조만) | `mockIngestGovernance`, `mockGovernanceForTextPrompt`, 파일 드롭 패턴, 채팅 상태 기계 |
| `src/pages/AICreativeStudio.tsx` (참조만) | `evaluateBrandGuardrail`, `MOCK_AI_MS`, 2.8초 진행 패턴 |
| `src/pages/AIFixApproval.tsx` (참조만) | before/after·승인 CTA 패턴 |
| `src/components/GenerativeFillPanel.tsx` (참조만) | 4 candidates 2×2 그리드 |
| `src/components/MutedBadge.tsx`, `AccentButton.tsx` | 토큰·버튼 재사용 |

### 12.3 다음 액션

1. 시연 대본 [99-demo-scenario.md](./99-demo-scenario.md) 검토 및 녹화 세션 준비.
2. 샘플 이미지 9종 제작/소싱 후 `public/sample/` 업로드.
3. M1 스프린트 착수: 사이드바·라우트·채팅 UI·대본 재생 모드.
4. 리허설 → M2 실시간 파싱 도입 → 데모 행사 확정.

---

## 13. 변경 이력

| 일자 | 버전 | 내용 |
|------|------|------|
| 2026-04-21 | 0.1 | 초안 작성 (의도 분류 6종, 4 핵심 플로우 + 복합, 이미지 요구사항 9종) |
