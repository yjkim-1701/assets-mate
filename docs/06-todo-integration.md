# Asset Mate — 통합 구현 TODO (API / MCP)

> 작성일: 2026-04-17  
> 기준 문서: [02-feature-specification.md](./02-feature-specification.md), [05-implement-status.md](./05-implement-status.md)  
> 참조: [integration-reference.md](./integration-reference.md)

---

## 1. 목적

- 목업(`mockup/`)은 완료되었으나 **실데이터·백엔드·외부 연동**은 미구현이다. ([05-implement-status.md](./05-implement-status.md))
- 본 문서는 **이미 제공되는 Adobe AEM Assets API / MCP, Firefly API**를 우선 소비해야 하는 항목과, **명세상 제공되지 않아 애플리케이션에서 직접 구현**해야 하는 항목을 구분한다.
- 공식 링크·엔드포인트는 [integration-reference.md](./integration-reference.md)를 따른다.

---

## 2. 활용해야 하는 기구현 API·MCP (우선 소비)

아래는 공개·내부 문서 기준으로 **이미 존재하는** 연동면이다. 새로 “동일 기능”을 재발명하지 말고, **BFF/프론트는 이 계약을 호출**하도록 설계한다.

### 2.1 AEM Assets — REST / OpenAPI 계열

| 용도 | 설명 | 공식 문서 (요약) |
|------|------|------------------|
| API 허브·개발자 레퍼런스 | 어떤 API를 어디에 쓰는지 출발점 | [Developer references for Assets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/developer-reference-material-apis) |
| 자산 CRUD, 메타데이터, rendition, comments 등 | 핵심 REST | [Assets HTTP API](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/admin/mac-api-assets) |
| OpenAPI 접근·인증 상위 개요 | 최신 API 패턴 | [OpenAPI-Based APIs](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/developing/open-api-based-apis) |
| AEM API 전체 지형도 | Assets / GraphQL 등 빠른 맵 | [AEM APIs overview](https://experienceleague.adobe.com/en/docs/experience-manager-learn/cloud-service/aem-apis/overview) |
| 검색·전달 (Dynamic Media OpenAPI) | 자산 검색·전달 시나리오 | [Dynamic Media with OpenAPI capabilities](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/assets/dynamicmedia/dynamic-media-open-apis/dynamic-media-open-apis-overview) |

**기능 매핑 (소비 후보)**

- **F-0.2** 에셋 상세: 메타데이터, 미리보기·rendition, 버전·라이선스 필드 → Assets HTTP API + (필요 시) Dynamic Media.
- **F-1.4** 복합 필터: 서버 영속·ACL 반영 검색 → Assets HTTP API / OpenAPI 검색 패턴 + 메타 모델.
- **F-1.7** 텍소노미: DAM 분류 동기화 → AEM 분류·메타 연동 (동일 API 층).
- **F-3.5** Custom Model 학습 데이터 선택: “AEM에서 10–30개 에셋 선택” → Assets API로 나열·선택 후 Firefly Custom Models로 전달 ([02-feature-specification.md](./02-feature-specification.md) F-3.5).
- **F-4.1** 공유 패키지·에셋 구성: 원천 자산·메타는 AEM; 링크/만료/한도는 **앱 레이어**(§4 참고).
- **F-6.1 ~ F-6.4** 포맷·렌디션·배치 다운로드: 변환·파생본은 AEM/Dynamic Media 파이프라인과 정합.

### 2.2 AEM — Remote MCP

| 엔드포인트 | 역할 (내부 문서 요약) |
|------------|------------------------|
| `https://mcp.adobeaemcloud.com/adobe/mcp/discovery` | Assets / CF / Forms / Pages **검색·디스커버리** |
| `https://mcp.adobeaemcloud.com/adobe/mcp/content` | 콘텐츠 **읽기·쓰기** (자산 포함 범주) |
| `https://mcp.adobeaemcloud.com/adobe/mcp/content-readonly` | **읽기 전용** 콘텐츠·자산 작업 |

출처: [integration-reference.md §3](./integration-reference.md).

**기능 매핑 (에이전트·자동화·검색 보조)**

- 자연어/에이전트 기반 “에셋 찾기·나열·메타 확인”은 **MCP discovery + content(-readonly)** 조합을 우선 검토.
- 운영 UI의 단일 진실은 여전히 **REST/OpenAPI**; MCP는 **Copilot/에이전트 경로**에 적합.

### 2.3 Firefly Services — HTTP API (MCP 아님)

| 용도 | 링크 |
|------|------|
| 문서 루트 | [Firefly API](https://developer.adobe.com/firefly-services/docs/firefly-api/) |
| 통합 API 레퍼런스 (이미지 엔드포인트 통합 안내) | [Firefly API Reference](https://developer.adobe.com/firefly-services/docs/firefly-api/api/) |
| 가이드·사전 요건 | [Firefly API Guides](https://developer.adobe.com/firefly-services/docs/firefly-api/guides/) |
| 서비스군 허브 | [Firefly Services docs](https://developer.adobe.com/firefly-services/docs/guides/) |

**기능 매핑 ([02-feature-specification.md](./02-feature-specification.md) 명시)**

| 기능 ID | Firefly API (명세상) |
|---------|----------------------|
| F-3.1 | Image-to-Image **Instruct Edit** (Image5), **Fill Image API** |
| F-3.2 | Instruct Edit (Image5) |
| F-3.3 | **Fill Image API** |
| F-3.4 | **Expand Image API** |
| F-3.5 | **Custom Models API** (예: `/v3/images/generate-async` 등, 최신 레퍼런스 따름) |
| F-3.6 | **Generate Image API** + Custom Models API |

> **참고:** [integration-reference.md](./integration-reference.md)에 따르면 **Firefly 전용 공개 MCP는 미확인**이며, 생성·편집은 **API 중심**으로 구현하는 것이 맞다.

---

## 3. 직접 구현해야 하는 기능 (제공 API/MCP만으로 부족한 부분)

아래는 **명세·구현현황상** Adobe 공개 API/MCP만으로 끝나지 않거나, **도메인 정책·멀티테넌트·채널 연동**이 필요한 영역이다. 백엔드 서비스·작업 큐·DB·알림·외부 OAuth 등을 계획에 넣어야 한다.

### 3.1 검색·AI 인프라 (AEM/Firefly 외 레이어)

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-1.1 | 비주얼 유사도 (임베딩·벡터 인덱스) | AEM 기본 검색만으로는 부족할 수 있음 → 임베딩 파이프라인·벡터 DB 또는 Adobe Sensei/유사 상품 검색 아키텍처 검토 후 **별도 마이크로서비스**. |
| F-1.2 | 색상 기반 정밀 매칭·에셋 팔레트 자동 추출 | 팔레트 추출·색 공간 매칭은 **앱 또는 ML 서비스**. |
| F-1.3 | 자연어 시맨틱 검색·300ms 자동완성 | NLU + 임베딩 검색·동의어 사전·권한 필터 → **검색 BFF**. |
| F-1.5 | 다국어 그룹·번역·크로스링구얼 유사도 | 워크플로·메타 규칙 **자체 DB**. |
| F-1.6 | 중복/유사 클러스터·해시 스캔 | 대용량 배치·지문 → **비동기 잡** + 스토리지 해시. |

### 3.2 브랜드 거버넌스·정책 엔진

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-2.1 | 업로드 시 자동 검사·인페인트 하이라이트·재검사 | 브랜드 룰은 조직별 → **정책 엔진** + (필요 시) 비전 API/자체 스코어링. |
| F-2.2 ~ F-2.3 | 라이선스 만료·알림·자동 잠금·승인 게이트 | 계약·SLA → **DB + 알림 + AEM 권한/에셋 상태 동기화**. |
| F-2.4 | 템플릿 잠금 영역 (편집기 실연동) | Creative Cloud / 템플릿 포맷별 **플러그인 또는 API 래핑**. |
| F-2.5 | 스코어카드 트렌드·PDF·팀 비교 | 집계·리포트 **앱 서비스**. |
| F-2.6 | 금지 에셋·배포 차단·감사 | 금지 목록·참조 추적 → **거버넌스 DB** + 다운로드/배포 게이트. |

### 3.3 Firefly 워크플로·자산 라이프사이클

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-3.1 | AI Creative Inbox·승인 후 원본 대체·감사·일괄 진행률 | Firefly는 이미지 생성만 담당; **Inbox·상태머신·버전 갱신**은 자체 구현. |
| F-3.2 ~ F-3.4 | 프로젝트 저장·세션 이력·정밀 마스크 | UI 상태·저장소는 **앱**; Firefly는 호출만. |
| F-3.5 ~ F-3.6 | AEM 에셋 → 학습 파이프라인·변형-원본 관계·재검사 | **오케스트레이션** (AEM API + Firefly API + 메타 갱신). |

### 3.4 협업·승인·캠페인

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-4.1 | 서명 링크·ZIP·비밀번호·외부 사용자 다운로드 | AEM 링크 공유와 병행하거나 **전용 토큰 서비스**. |
| F-4.2 | 캔버스 마크업·@멘션·이메일 | Comments API 일부 활용 가능하나 UX 요구는 **협업 서비스** 가능성 큼. |
| F-4.3 | 픽셀 디프·변경 영역 자동 감지 | **이미지 디프 라이브러리** 또는 전용 서비스. |
| F-4.4 | 간트 DnD·실시간 동기화 | **캠페인/태스크 DB** + WebSocket 등. |
| F-4.5 | SLA·칸반 영속·배치 승인 | **워크플로 엔진** + 알림. |

### 3.5 소셜·배포·캘린더

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-5.1 ~ F-5.3 | 실제 리사이즈·크롭·디바이스 프레임·안전영역 | 이미지 처리 **워커**; Firefly Expand는 부분 연계 가능 ([02](./02-feature-specification.md) F-3.4, F-5.1). |
| F-5.4 ~ F-5.6 | 예약 배포·채널 API·이력·롤백 | Meta/X/LinkedIn 등 **각 플랫폼 API** + 배포 큐 + 이력 DB. |

### 3.6 최적화·납품

| 기능 ID | 내용 | 이유 / 구현 방향 |
|---------|------|------------------|
| F-6.1 ~ F-6.3 | 트랜스코딩 큐·피사체 감지·AB 테스트 | AEM Dynamic Media와 중복 검토 후 부족 시 **미디어 워커**. |
| F-6.4 | ZIP 스트리밍·만료 링크·다운로드 이력 | **다운로드 서비스** + 감사 로그. |

### 3.7 공통·횡단 관심사

| 영역 | 직접 구현 |
|------|-----------|
| 인증·권한 | IMS / AEM 권한 모델과 앱 역할 매핑 |
| 실시간 지표·알림 | F-0.1 대시보드, F-2.2 알림, F-4.x 협업 알림 |
| 감사 로그 | 승인·AI 수정·배포·다운로드 |

---

## 4. 요약 표

| 구분 | 내용 |
|------|------|
| **반드시 먼저 연동할 공식면** | AEM Assets HTTP / OpenAPI / Dynamic Media OpenAPI; AEM MCP (`discovery`, `content`, `content-readonly`); Firefly REST (Instruct Edit, Fill, Expand, Generate, Custom Models) — 링크는 §2 및 [integration-reference.md §4](./integration-reference.md). |
| **MCP로 두면 안 되는 것** | Firefly 생성·편집의 단일 진실은 **HTTP API**; Firefly 전용 공개 MCP는 [미확인](https://developer.adobe.com/firefly-services/docs/firefly-api/) 참고. |
| **직접 구현 비중이 큰 테마** | 시맨틱·유사도·중복 검색, 브랜드 정책·승인·금지, Inbox·워크플로, 소셜 채널 배포, 대용량 미디어 작업 큐. |

---

## 5. 관련 문서

| 문서 | 역할 |
|------|------|
| [02-feature-specification.md](./02-feature-specification.md) | 기능·인수 조건·Firefly API 이름 |
| [05-implement-status.md](./05-implement-status.md) | 목업 대비 “추후 구현 예정” |
| [integration-reference.md](./integration-reference.md) | 공식 URL·MCP 엔드포인트·요약 표 |
