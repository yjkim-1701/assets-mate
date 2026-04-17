# Assets Mate — Mockup

## 프로젝트 개요

**Assets Mate**는 Adobe AEM Assets를 보강하는 애드온 플랫폼을 목표로 한 제품입니다. AEM이 기본 제공하지 않거나 부족한 영역(고급 검색, 브랜드 거버넌스, Firefly 기반 AI 크리에이티브, 협업·승인, 소셜 리사이즈·배포, 최적화 등)을 메우고, 마케터와 외부 에이전시가 에셋을 검색·검증·협업·변환·배포하기 쉽게 만드는 것이 방향입니다.

배포 형태는 **하이브리드**(독립 웹앱 + AEM UI 내 임베디드 확장)로 설계되어 있습니다. 이 저장소의 **`mockup/`** 폴더는 그 비전을 **React 기반 정적 목업(UI 프로토타입)**으로 시각화한 것입니다. 백엔드, Firefly·AEM 실 API, 실제 검색·AI 연동은 포함하지 않으며, 화면·플로·UX 검증용입니다.

## 이 폴더에서 쓰는 기술

| 구분 | 내용 |
|------|------|
| 런타임 | React 19, TypeScript |
| 빌드 | Vite |
| UI | React Spectrum S2 (`@react-spectrum/s2`), Style Macros (`unplugin-parcel-macros`) |
| 라우팅 | React Router |

상세 의존성은 `package.json`을 참고하세요.

## 실행 방법

```bash
cd mockup
npm install
npm run dev
```

- **빌드:** `npm run build`
- **프리뷰:** `npm run preview`
- **린트:** `npm run lint`
- **샘플 이미지 생성(스크립트):** `npm run generate:sample-images`

구현 범위·기능 ID 대비 완료 여부는 저장소 루트의 [`docs/05-implement-status.md`](../docs/05-implement-status.md)를 기준으로 합니다.

---

## 문서 (`../docs/`) 요약

프로젝트 기획·설계·연동 참고는 모두 상위 **`docs/`** 디렉터리에 있습니다. 각 파일의 역할은 아래와 같습니다.

| 문서 | 요약 |
|------|------|
| [`01-brainstorming.md`](../docs/01-brainstorming.md) | 브레인스토밍 결과. 제품 정의, 타겟 사용자·니즈, **6개 테마**(고급 검색, 브랜드 거버넌스, AI/Firefly, 협업·승인, 소셜 리사이즈, 최적화)별 아이디어·차별점, 핵심 시나리오, 목업 화면 목록, AEM 대비 차별화·향후 확장 아이디어. |
| [`02-feature-specification.md`](../docs/02-feature-specification.md) | **상세 기능 정의서.** 공통(F-0.x)과 테마별 기능 ID(F-1.x ~ F-6.x)로 요구사항을 정리. 각 기능의 목적·입출력·UI·수용 기준 수준의 스펙. |
| [`03-information-architecture.md`](../docs/03-information-architecture.md) | **정보 구조·사이트맵.** 글로벌 내비(사이드바·헤더·서브), 화면별 레이아웃, 핵심 사용자 플로(캠페인 런칭·에이전시 협업·브랜드+AI·다채널·AI 변형 등), 역할별 접근, 반응형, 공통 UI 패턴(에셋 카드·필터·액션 바). |
| [`04-ui-design-guide.md`](../docs/04-ui-design-guide.md) | **UI 디자인 가이드.** Spectrum 2 기반 색·타이포·컴포넌트 매핑, 아이콘·간격·라이트/다크, 화면별 컴포넌트 구성, 목업용 `package.json`·Vite·루트 구조 참고. |
| [`05-implement-status.md`](../docs/05-implement-status.md) | **기능 구현 현황.** `02-feature-specification` 대비 `mockup/` 구현 상태(완료·부분·미구현), 테마별 표와 추후 백엔드·Adobe 연동 과제, 관련 소스 경로 정리. |
| [`integration-reference.md`](../docs/integration-reference.md) | **외부 연동 레퍼런스.** AEM Assets HTTP/OpenAPI·Dynamic Media, Firefly API 공식 문서 링크, AEM MCP 엔드포인트 요약, Firefly MCP 공개 문서 유무 등 **통합 조사 메모**. |
| [`sample-images.md`](../docs/sample-images.md) | **목업 샘플 이미지·영상 가이드.** 스톡/AI 자산 선택 원칙, `mock.ts` 등 데이터와 연결된 파일명·용도, 자산별 키워드·프롬프트, 보관·데모 전 체크리스트. |

더 깊은 맥락은 루트의 기획 메모(`memory/` 등)와 함께 위 문서를 순서대로 읽는 것을 권장합니다.

---

## Vite 템플릿 참고 (ESLint)

이 프로젝트는 Vite + React + TypeScript 템플릿으로 시작했습니다. 타입 인지 ESLint나 React Compiler 도입 등은 [Vite 플러그인 문서](https://github.com/vitejs/vite-plugin-react) 및 [React Compiler 설치 가이드](https://react.dev/learn/react-compiler/installation)를 참고해 확장할 수 있습니다.
