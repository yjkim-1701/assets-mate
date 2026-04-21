# Assets Mate - UI 디자인 가이드

> 작성일: 2026-04-16  
> 상태: 확정  
> 문서 인덱스: [README.md](./README.md)  
> 선행 문서: [03-information-architecture.md](./03-information-architecture.md)

---

## 1. 디자인 시스템 기반

### Adobe Spectrum 2 (React Spectrum S2)

Assets Mate는 Adobe의 공식 디자인 시스템 [Spectrum 2](https://react-spectrum.adobe.com/)를 기반으로 한다. AEM UI와의 시각적 일관성을 확보하고, 접근성/다국어/반응형 등 기본 품질을 보장한다.

**핵심 원칙**
- Spectrum 2 토큰과 컴포넌트를 최대한 활용한다
- 커스텀 스타일은 Style Macros를 통해 Spectrum 토큰 기반으로 작성한다
- 불필요한 커스텀 컴포넌트 생성을 지양한다

---

## 2. 색상 시스템

### Spectrum 토큰 기반 색상

| 용도 | Spectrum 토큰 | 사용처 |
|------|--------------|--------|
| 배경 (기본) | `background: 'base'` | Provider, 메인 배경 |
| 배경 (레이어) | `backgroundColor: 'layer-1'` | 카드, 패널 |
| 배경 (강조) | `backgroundColor: 'layer-2'` | 사이드바, 선택된 항목 |
| 액센트 | `backgroundColor: 'accent-900'` | 주요 CTA 버튼 |
| 성공 (긍정) | `backgroundColor: 'positive-900'` | 승인됨, 통과, 완료 |
| 경고 | `backgroundColor: 'notice-900'` | 만료 임박, 주의 |
| 위험 (부정) | `backgroundColor: 'negative-900'` | 거절, 실패, 금지 |
| 정보 | `backgroundColor: 'informative-900'` | 정보성 배지, 안내 |

### 상태별 색상 매핑

| 상태 | 색상 | StatusLight variant | 사용처 |
|------|------|-------------------|--------|
| 승인됨 (Approved) | 초록 | `positive` | 에셋 승인 상태 |
| 검토 중 (In Review) | 파랑 | `informative` | 리뷰 진행 중 |
| 수정 요청 (Revision) | 노랑 | `notice` | 피드백 있음 |
| 거절됨 (Rejected) | 빨강 | `negative` | 승인 거절 |
| 미제출 (Draft) | 회색 | `neutral` | 초안 상태 |

### 브랜드 스코어 색상

| 점수 범위 | 색상 | Meter variant |
|-----------|------|--------------|
| 90-100 | 초록 | `positive` |
| 70-89 | 노랑 | `notice` |
| 0-69 | 빨강 | `negative` |

---

## 3. 타이포그래피

### Spectrum 타입 스케일

| 용도 | Style Macro | 사용처 |
|------|------------|--------|
| 페이지 타이틀 | `font: 'title-xl'` | 대시보드 제목, 페이지 헤딩 |
| 섹션 타이틀 | `font: 'title-lg'` | 카드 섹션 제목 |
| 카드 타이틀 | `font: 'title-sm'` | 에셋 카드명, 서브 헤딩 |
| 본문 | `font: 'body'` | 일반 텍스트, 설명 |
| 디테일 | `font: 'detail-sm'` | 메타데이터, 타임스탬프, 부가 정보 |
| 코드/수치 | `font: 'code'` | 해상도, 파일 크기, HEX 코드 |

---

## 4. 컴포넌트 매핑

각 기능에서 사용할 React Spectrum S2 컴포넌트를 매핑한다.

### 레이아웃

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 사이드바 네비게이션 | `NavGroup`, `NavItem` | 글로벌 네비게이션 |
| 상단 헤더 | `ActionBar` | 글로벌 검색, 알림, 프로필 |
| 탭 네비게이션 | `Tabs`, `TabPanel` | 검색 모드 전환, 에셋 상세 탭 |
| 브레드크럼 | `Breadcrumbs` | 현재 위치 표시, 텍소노미 경로 |
| 페이지 레이아웃 | `Flex`, `Grid` (Style Macros) | 반응형 레이아웃 구성 |

### 데이터 표시

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 에셋 그리드 | `CardView` | 에셋 갤러리/검색 결과 |
| 에셋 카드 | `Card` | 개별 에셋 카드 |
| 데이터 테이블 | `TableView` | 배포 이력, 라이선스 목록 |
| 상태 표시 | `StatusLight` | 승인 상태 표시 |
| 배지 | `Badge` | 에셋 유형, 채널, 경고 |
| 프로그레스 바 | `ProgressBar` | 캠페인 진행률, 다운로드 |
| 미터 | `Meter` | 브랜드 스코어, 저장 용량 |
| 아바타 | `Avatar` | 사용자 프로필, 담당자 |
| 태그 그룹 | `TagGroup`, `Tag` | 필터 태그, 메타데이터 태그 |

### 입력

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 검색 | `SearchField` | 글로벌 검색, 에셋 검색 |
| 선택 | `Picker`, `ComboBox` | 채널 선택, 캠페인 선택 |
| 체크박스 | `CheckboxGroup`, `Checkbox` | 채널 멀티 선택, 필터 |
| 날짜 선택 | `DatePicker`, `DateRangePicker` | 날짜 필터, 스케줄링 |
| 슬라이더 | `Slider` | 유사도 임계값, 품질 조절 |
| 컬러 피커 | `ColorField`, `ColorSwatch` | 색상 검색, 브랜드 컬러 |
| 텍스트 입력 | `TextField`, `TextArea` | 코멘트, 캡션 |
| 파일 드롭 | `DropZone` | 이미지 업로드, 비주얼 검색 |

### 액션

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 주요 버튼 | `Button` (variant="accent") | CTA: 생성, 승인, 배포 |
| 보조 버튼 | `Button` (variant="secondary") | 취소, 뒤로 |
| 아이콘 버튼 | `ActionButton` | 도구 아이콘, 빠른 액션 |
| 메뉴 | `ActionMenu`, `MenuTrigger` | 더보기 옵션, 컨텍스트 메뉴 |
| 링크 | `Link` | 인라인 이동 |
| 토글 | `Switch` | 설정 on/off, 필터 토글 |

### AI Creative (Firefly) 전용

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 프롬프트 입력 | `TextArea` | 자연어 편집 명령 입력 |
| 프롬프트 템플릿 | `TagGroup` | 자주 쓰는 프롬프트 원클릭 적용 |
| 후보 선택 | `CardView` + `Card` | AI 생성 후보 비교/선택 |
| 전/후 비교 | `Flex` (2열) + `Card` × 2 | 원본과 AI 결과 나란히 비교 |
| 모델 선택 | `Picker` | Custom Model 선택 |
| 편집 이력 | `Breadcrumbs` | 연속 편집 단계 표시/이동 |
| 브랜드 가드레일 | `InlineAlert` | 편집 결과 브랜드 위반 경고 |
| 위반 목록 | `CheckboxGroup` + `Badge` | 브랜드 위반 항목 선택 |
| 후보 네비게이션 | `Button` + `Text` | 수정 후보 간 이동 |
| 스코어 비교 | `Meter` × 2 | 전/후 브랜드 스코어 비교 |
| 생성 진행률 | `ProgressBar` | AI 처리 진행 상태 |

### 피드백

| 기능 | Spectrum 컴포넌트 | 용도 |
|------|------------------|------|
| 다이얼로그 | `Dialog`, `DialogTrigger` | 확인/경고 모달, 상세 입력 |
| 알림 토스트 | `Toast` | 성공/실패/정보 알림 |
| 툴팁 | `Tooltip`, `TooltipTrigger` | 버튼/아이콘 설명, 매칭 이유 |
| 컨텍스트 도움 | `ContextualHelp` | 기능 설명, 도움말 |
| 인라인 알림 | `InlineAlert` | 경고 메시지, 필드 에러, 브랜드 가드레일 |

---

## 5. 아이콘

React Spectrum S2의 Spectrum Workflow Icons를 활용한다.

### 주요 아이콘 매핑

| 기능 | 아이콘 | 사용처 |
|------|--------|--------|
| 검색 | `Search` | 검색바, 검색 메뉴 |
| 필터 | `Filter` | 필터 패널 토글 |
| 다운로드 | `Download` | 에셋 다운로드 |
| 업로드 | `Upload` | 에셋 업로드 |
| 공유 | `Share` | 에셋 공유 |
| 리사이즈 | `Resize` | 소셜 리사이즈 |
| 승인 | `CheckmarkCircle` | 승인 액션 |
| 거절 | `CloseCircle` | 거절 액션 |
| 리뷰 | `Comment` | 코멘트/리뷰 |
| 브랜드 | `Shield` | 브랜드 거버넌스 |
| 캘린더 | `Calendar` | 소셜 캘린더 |
| 설정 | `Settings` | 설정 메뉴 |
| 알림 | `Bell` | 알림 아이콘 |
| 대시보드 | `Dashboard` | 대시보드 메뉴 |
| 이미지 | `Image` | 에셋 유형 |
| 비디오 | `VideoFilled` | 비디오 에셋 |
| 잠금 | `LockClosed` | 잠금 영역, 권한 |
| 경고 | `Alert` | 만료 경고, 금지 |
| 그리드 뷰 | `ViewGrid` | 그리드 레이아웃 |
| 리스트 뷰 | `ViewList` | 리스트 레이아웃 |
| AI/마법 | `MagicWand` | AI 편집, Firefly 기능 |
| 생성 | `Generate` | AI 변형 생성, Generative Fill |
| 이미지 편집 | `ImageEdit` | 자연어 편집, AI Studio |
| 확장 | `Expand` | Generative Expand |
| 되돌리기 | `Undo` | 편집 이력 되돌리기 |
| 비교 | `Compare` | 전/후 비교 |

---

## 6. 간격 & 레이아웃 토큰

### 간격 스케일

| 토큰 | 사이즈 | 사용처 |
|------|--------|--------|
| `gap: 4` | 4px | 인라인 요소 간격 |
| `gap: 8` | 8px | 아이콘-텍스트 간격, 태그 간격 |
| `gap: 16` | 16px | 카드 내부 패딩, 섹션 간 기본 |
| `gap: 24` | 24px | 섹션 간 간격, 폼 필드 간격 |
| `gap: 32` | 32px | 주요 섹션 구분 |
| `gap: 48` | 48px | 페이지 최상위 여백 |

### 에셋 카드 사이즈

| 뷰 | 카드 너비 | 썸네일 높이 | 사용처 |
|----|-----------|------------|--------|
| 컴팩트 | 160px | 120px | 검색 결과 좁은 뷰 |
| 기본 | 240px | 180px | 기본 그리드 뷰 |
| 확장 | 320px | 240px | 갤러리 뷰 |

### 사이드바

| 상태 | 너비 |
|------|------|
| 확장 | 256px |
| 축소 (아이콘만) | 64px |
| 숨김 (모바일) | 0px (오버레이) |

---

## 7. 테마 & 모드

### Light / Dark 모드

React Spectrum S2의 자동 테마 전환을 활용한다. `Provider`의 `colorScheme` 속성으로 제어.

```tsx
<Provider colorScheme="light">  // 또는 "dark", 시스템 설정 따름
```

모든 색상은 Spectrum 토큰을 사용하므로 별도의 다크 모드 스타일 작업이 불필요하다.

### 배경 레벨

```tsx
<Provider background="base">     // 최하위 배경 (페이지)
<Provider background="layer-1">   // 카드, 패널 (한 단계 위)
<Provider background="layer-2">   // 중첩 패널 (두 단계 위)
```

---

## 8. 화면별 컴포넌트 구성 상세

### 8.1 메인 대시보드

```
Provider (background="base")
├── Flex (사이드바 + 메인)
│   ├── NavGroup (사이드바)
│   │   └── NavItem × 7 (메뉴 항목)
│   └── Flex (메인 콘텐츠, direction="column")
│       ├── ActionBar (헤더: SearchField + 알림 + Avatar)
│       ├── Grid (현황 카드 4열)
│       │   ├── Card (전체 에셋 수) → Badge + 숫자
│       │   ├── Card (승인 대기) → StatusLight + 숫자
│       │   ├── Card (만료 임박) → StatusLight(notice) + 숫자
│       │   └── Card (예정 배포) → StatusLight(informative) + 숫자
│       ├── Grid (2열: 캠페인 진행 + 브랜드 건강도)
│       │   ├── Card → ProgressBar × N (캠페인별)
│       │   └── Card → Meter (종합 스코어)
│       ├── Card (최근 활동)
│       │   └── ListView (타임라인 항목들)
│       └── Flex (빠른 액션)
│           └── Button × 3 (검색, 리사이즈, 리뷰)
```

### 8.2 필터 검색

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Tabs (검색 모드: 필터/비주얼/색상/시맨틱)
│       ├── SearchField (대형 검색바)
│       ├── TagGroup (적용된 필터 태그)
│       └── Flex (필터 패널 + 결과)
│           ├── Flex (왼쪽 필터 패널, width=256px)
│           │   ├── CheckboxGroup (채널)
│           │   ├── ComboBox (캠페인)
│           │   ├── CheckboxGroup (시즌)
│           │   ├── CheckboxGroup (포맷)
│           │   └── Picker (언어)
│           └── CardView (에셋 그리드)
│               └── Card × N (에셋 카드)
```

### 8.2.1 AI 검색 (대화형, 명세 F-1.8)

```
Provider
├── Flex (메인)
│   ├── Tabs (… AI 검색 탭 선택 시)
│   └── Grid (2열: 채팅 열 | 결과 열)
│       ├── Flex (채팅 열, direction="column")
│       │   ├── ScrollView (대화 스레드: 사용자/어시스턴트 말풍선)
│       │   ├── ButtonGroup (참조 에셋 빠른 선택, 목업)
│       │   └── Flex (TextField 메시지 + Button 보내기)
│       └── Flex (결과 열, direction="column")
│           ├── Flex (도구: 조건·대화 초기화, 그리드/리스트)
│           ├── TagGroup (파싱된 SearchIntent 칩, 개별 제거)
│           ├── Text (건수 안내)
│           └── CardView (에셋 그리드, 유사도·매칭 이유 배지)
```

### 8.3 AI Creative Studio

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Tabs (모드: 자연어 편집 / Generative Fill / Expand)
│       ├── Card (프롬프트 입력)
│       │   ├── TextArea (자연어 편집 명령 입력)
│       │   ├── TagGroup (프롬프트 템플릿: 톤변경, 배경교체, 오브젝트 등)
│       │   └── Button ("AI 편집 실행", variant="accent")
│       ├── Flex (원본/결과 비교 2열)
│       │   ├── Card (원본 이미지)
│       │   │   └── 이미지 + "원본" 라벨
│       │   └── Card (AI 편집 결과)
│       │       └── 이미지 + "수정본" 라벨 + Badge("AI Generated")
│       ├── Flex (편집 이력)
│       │   └── Breadcrumbs ([원본] → [톤변경] → [배경수정])
│       ├── InlineAlert (브랜드 가드레일: 위반 시 경고)
│       └── Flex (하단 액션)
│           ├── Button ("되돌리기", variant="secondary")
│           ├── Button ("다른 후보 보기", variant="secondary")
│           └── Button ("적용 & 저장", variant="accent")
```

### 8.4 AI Creative Inbox

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   │   └── NavItem ("AI Creative") + Badge (미처리 건수)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Flex (필터 + 액션)
│       │   ├── TabList (전체 / 대기 / 승인 / 거절 / 수정요청)
│       │   ├── Picker (정렬: 최신순, 위반유형, 요청자)
│       │   └── Flex (일괄 액션)
│       │       ├── Checkbox ("전체 선택")
│       │       ├── Button ("일괄 승인", variant="accent")
│       │       └── Button ("일괄 거절", variant="negative")
│       └── ListView (AI 수정 결과 리스트)
│           └── Row × N
│               ├── Checkbox (다건 선택)
│               ├── Image (에셋 썸네일)
│               ├── Flex (정보, direction="column")
│               │   ├── Text (에셋명)
│               │   ├── TagGroup (위반 유형 태그)
│               │   └── Text (요청자 + 시간)
│               ├── Flex (스코어 변화)
│               │   └── Text ("52→91") + Meter
│               └── Badge (상태: Pending / Approved / Rejected)
```

### 8.5 AI 수정 승인 상세

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더 + ← Inbox로 돌아가기)
│       ├── Card (요청 정보)
│       │   ├── Badge (상태: Pending)
│       │   ├── Text (에셋명 + 위반 항목)
│       │   └── Text (요청자 + 요청 일시)
│       ├── Flex (전/후 비교 2열)
│       │   ├── Card (수정 전)
│       │   │   └── 이미지 + Meter (브랜드 스코어: 52/100)
│       │   └── Card (수정 후 - 후보)
│       │       └── 이미지 + Meter (브랜드 스코어: 91/100) + Badge("후보 1/3")
│       ├── Flex (후보 네비게이션)
│       │   └── Button("◀") + Text("후보 1/3") + Button("▶")
│       ├── TextArea (사유/코멘트 입력)
│       └── Flex (하단 액션)
│           ├── Button ("Reject", variant="negative")
│           ├── Button ("Request Changes", variant="secondary")
│           └── Button ("Approve", variant="accent")
```

### 8.6 브랜드 위반 AI 수정 (요청)

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더 + ← 브랜드 검사 상세에서 진입)
│       ├── Card (위반 항목 목록)
│       │   └── CheckboxGroup
│       │       ├── Checkbox ("색상 톤") + Badge("위반") + Button("AI 수정")
│       │       ├── Checkbox ("로고 여백") + Badge("위반") + Button("AI 수정")
│       │       └── Checkbox ("배경 톤") + Badge("위반") + Button("AI 수정")
│       ├── Button ("선택 항목 일괄 AI 수정", variant="accent")
│       ├── Flex (전/후 비교 2열)
│       │   ├── Card (수정 전)
│       │   │   └── 이미지 + Meter (브랜드 스코어: 52/100)
│       │   └── Card (AI 수정 프리뷰)
│       │       └── 이미지 + Meter (예상 스코어: 91/100) + Badge("후보 1/3")
│       ├── Flex (후보 네비게이션)
│       │   └── Button("◀") + Text("1/3") + Button("▶")
│       └── Flex (하단 액션)
│           ├── Button ("취소", variant="secondary")
│           └── Button ("Inbox로 보내기 (승인 요청)", variant="accent")
```

### 8.7 AI 변형 생성

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Card (원본 에셋 정보)
│       │   └── Flex (썸네일 + 파일명 + 메타데이터)
│       ├── Card (변형 설정)
│       │   ├── TextArea (변형 프롬프트: "겨울 시즌 눈 오는 배경으로")
│       │   ├── TagGroup (변형 유형: 시즌변경, 무드변경, 배경변경)
│       │   ├── Picker (Custom Model 선택)
│       │   └── Button ("변형 생성", variant="accent")
│       ├── Grid (변형 후보 4열)
│       │   └── Card × 4 (변형 후보)
│       │       ├── 변형 이미지
│       │       ├── Meter (브랜드 스코어)
│       │       └── Button ("선택", variant="secondary")
│       └── Flex (하단 액션)
│           ├── Button ("다시 생성", variant="secondary")
│           └── Button ("선택 항목 저장", variant="accent")
```

### 8.8 소셜 리사이즈

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Card (원본 에셋 정보)
│       │   └── Flex (썸네일 + 파일 정보)
│       ├── Card (채널 선택)
│       │   ├── CheckboxGroup (채널별 사이즈 선택)
│       │   └── Button ("전체 선택")
│       ├── Grid (프리뷰 그리드)
│       │   └── Card × N (채널별 리사이즈 프리뷰)
│       │       ├── 채널 아이콘 + 사이즈 레이블
│       │       └── 리사이즈 미리보기 이미지
│       └── Flex (하단 액션)
│           ├── Button ("프리뷰 확인", variant="secondary")
│           └── Button ("일괄 생성 & 저장", variant="accent")
```

### 8.9 리뷰 & 승인

```
Provider
├── Flex
│   ├── NavGroup (사이드바)
│   └── Flex (메인, direction="column")
│       ├── ActionBar (헤더)
│       ├── Flex (워크플로 상태 바)
│       │   └── ProgressBar (제출→검토→승인)
│       ├── Flex (에셋 + 코멘트 2열)
│       │   ├── Card (에셋 미리보기, 마크업 오버레이)
│       │   └── Flex (코멘트 패널, direction="column")
│       │       ├── ListView (코멘트 스레드)
│       │       │   └── 각 코멘트: Avatar + 텍스트 + 타임스탬프
│       │       └── TextArea + Button ("코멘트 추가")
│       └── Flex (하단 액션)
│           ├── Button ("수정 요청", variant="secondary")
│           ├── Button ("승인", variant="accent")
│           └── Button ("거절", variant="negative")
```

---

## 9. 목업 프로젝트 설정 (저장소 루트)

아래 스니펫은 **참고용 예시**이다. 실제 버전·의존성은 저장소 루트의 `package.json`, `vite.config.ts`, `src/App.tsx`를 따른다.

### package.json 주요 의존성

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@react-spectrum/s2": "latest",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "unplugin-parcel-macros": "latest"
  }
}
```

### vite.config.ts 핵심 설정

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macros from 'unplugin-parcel-macros';

export default defineConfig({
  plugins: [
    macros.vite(),
    react()
  ],
  build: {
    target: ['es2022'],
    cssMinify: 'lightningcss'
  }
});
```

### App.tsx 루트 구조

```tsx
import { Provider } from '@react-spectrum/s2';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Provider background="base" locale="ko-KR">
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/brand" element={<BrandDashboard />} />
            <Route path="/ai/inbox" element={<AIFixInbox />} />
            <Route path="/ai/inbox/:fixId" element={<AIFixApproval />} />
            <Route path="/ai/studio/:assetId" element={<AICreativeStudio />} />
            <Route path="/ai/brand-fix/:assetId" element={<AIBrandFix />} />
            <Route path="/ai/variations/:assetId" element={<AIVariations />} />
            <Route path="/ai/models" element={<CustomModelManagement />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/social/resize" element={<SocialResize />} />
            <Route path="/optimize" element={<Optimization />} />
            {/* ... */}
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </Provider>
  );
}
```
