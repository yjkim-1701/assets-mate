# Assets Mate — 문서 인덱스

기획·설계·구현 현황·연동 참고 자료는 모두 이 `docs/` 디렉터리에 있습니다. 세션·플래닝 메모는 [`memory/`](./memory/)에 둡니다.

## 폴더 구성

| 경로 | 설명 |
|------|------|
| [`01-brainstorming.md`](./01-brainstorming.md) ~ [`04-ui-design-guide.md`](./04-ui-design-guide.md) | 제품 브레인스토밍, 기능 명세, 정보 구조, UI 가이드 (순서대로 읽기 권장) |
| [`05-implement-status.md`](./05-implement-status.md) | 기능 정의 대비 **목업(UI) 구현** 완료 여부 |
| [`06-todo-integration.md`](./06-todo-integration.md) | 실서비스 **API·MCP 연동** 백로그 (소비 vs 직접 구현 구분) |
| [`integration-reference.md`](./integration-reference.md) | AEM·Firefly·MCP **공식 문서·엔드포인트** 조사 메모 |
| [`sample-images.md`](./sample-images.md) | 목업용 샘플 미디어·`mock.ts` 연동 가이드 |
| [`presentaion/`](./presentaion/) | 소개용 HTML·캡처 에셋 (`introduce.html` 등) |
| [`memory/`](./memory/) | 세션 요약, 초기 플래닝 대화 로그 등 (참고용) |

## 문서 간 선행 관계

```text
01-brainstorming
       ↓
02-feature-specification ←── 05-implement-status
       ↓                              ↑
03-information-architecture          │
       ↓                              │
04-ui-design-guide                     │
       ↓                              │
sample-images ────────────────────────┘
       
integration-reference ←── 06-todo-integration ──→ 02, 05
```

- **05**는 **02**를 기준으로 목업 구현 상태를 적습니다.
- **06**는 **02**, **05**, **integration-reference**를 기준으로 연동 TODO를 적습니다.

## 소스 코드(목업 앱) 위치

UI 목업은 저장소 **루트**의 Vite 앱입니다 (`package.json`, `src/`, `public/`). 상세 경로는 [05-implement-status.md](./05-implement-status.md) 하단 「관련 파일」 표를 참고하세요.
