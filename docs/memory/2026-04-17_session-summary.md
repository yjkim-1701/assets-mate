# Assets Mate — 작업 요약 (세션 기록)

> 일자: 2026-04-17  
> 범위: 본 저장소 `asset-mate`에서 이번에 완료한 문서 작업

---

## 완료한 작업

### `docs/06-todo-integration.md` 신규 작성

- **목적:** 실서비스 연동 단계에서 **이미 제공되는 Adobe API·MCP를 우선 사용할 영역**과 **애플리케이션에서 직접 구현해야 할 영역**을 한 문서로 구분한다.
- **참고로 삼은 문서**
  - [`02-feature-specification.md`](../02-feature-specification.md) — 기능 ID, 인수 조건, Firefly API 명칭
  - [`05-implement-status.md`](../05-implement-status.md) — 목업 완료 범위 vs 추후 연동
  - [`integration-reference.md`](../integration-reference.md) — Experience League·developer.adobe.com 링크, AEM MCP 엔드포인트, Firefly API vs Firefly MCP(미확인) 정리
- **문서 구성 요약**
  - §1 목적  
  - §2 활용할 기구현: AEM Assets HTTP/OpenAPI/Dynamic Media, Remote MCP (`discovery`, `content`, `content-readonly`), Firefly REST  
  - §3 직접 구현: 검색·임베딩, 거버넌스, Inbox·워크플로, 협업, 소셜 배포, 최적화·ZIP 등 (기능 ID별 표)  
  - §4 한 페이지 요약 표  
  - §5 관련 문서 링크

---

## 맥락 (프로젝트 상태)

- UI 목업은 [`05-implement-status.md`](../05-implement-status.md) 기준으로 저장소 루트 `src/`에서 기능 단위 **완료**로 정리되어 있음.  
- 백엔드·Firefly·실검색·실배포 연동은 **미착수**이며, `06-todo-integration.md`는 그 백로그를 **연동 레이어 관점**에서 정리한 산출물임.

---

## 산출물 경로

| 항목 | 경로 |
|------|------|
| 통합 연동 TODO | [`06-todo-integration.md`](../06-todo-integration.md) |
| 문서 인덱스·폴더 구성 | [`README.md`](../README.md) |
| 본 요약 | `docs/memory/2026-04-17_session-summary.md` |

---

## 후속으로 열 수 있는 작업 (참고만)

- `06-todo-integration.md`의 §3 항목을 에픽/이슈로 쪼개 마일스톤 배치  
- BFF 설계 시 §2의 API·MCP를 호출 계약으로 고정  
- Firefly·AEM 권한·IMS 연동은 별도 보안·인증 설계 문서로 분리
