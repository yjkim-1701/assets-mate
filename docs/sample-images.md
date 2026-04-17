# Mockup 샘플 이미지·영상 가이드

> UI 목업용 샘플 미디어를 준비할 때 참고한다.  
> 문서 인덱스: [README.md](./README.md)  
> 시각·톤 가이드는 [04-ui-design-guide.md](./04-ui-design-guide.md)와 함께 보면 된다 (Spectrum 2 기반 레이아웃과 별개로, 여기서는 **콘텐츠 이미지**만 다룬다).

---

## 1. 소스 선택 원칙

| 우선순위 | 소스 | 비고 |
|----------|------|------|
| 1 | **Adobe Stock**, Getty, Shutterstock 등 유료 스톡 | 라이선스·용도가 명확. Adobe 톤 mockup과도 잘 맞음 |
| 2 | **Unsplash / Pexels** | 프로토타입에 빠름. 상표·초상·제품 실사는 약관 확인 |
| 3 | **자사 촬영·에이전시 원본** | 브랜드 설득력 최상 |
| 4 | **AI 이미지 생성** | 배경·무드·추상 컷에 적합. 로고·가독 텍스트·정확한 인포그래픽은 **디자인 툴 합성** 권장 |

**하이브리드 권장**: 히어로·라이프스타일은 스톡 또는 자사, 텍스트·차트가 많은 인포그래피·이메일 헤더는 **Figma 등에서 타이포+스톡 배경**으로 만드는 편이 안전하다.

---

## 2. 자산 목록 (목업 데이터 기준)

### 2.1 `src/data/mock.ts` — `ASSETS`

| 파일명 | 목표 해상도 | 용도 요약 |
|--------|-------------|-----------|
| `campaign_summer_hero.jpg` | 3840×2160 | 여름 캠페인 와이드 히어로 |
| `promo_banner_v2.png` | 1920×1080 | 프로모션 풀 HD 배너 |
| `social_post_03.png` | 1080×1080 | 소셜 정사각 (인스타 피드 등) |
| `product_lifestyle_01.jpg` | 4000×3000 | 제품 라이프스타일 (고해상도 마스터) |
| `email_header_q2.png` | 600×200 | 뉴스레터 이메일 헤더 (낮은 높이) |
| `infographic_stats.png` | 1200×2400 | 세로형 인포그래픽 |
| `video_teaser_15s.mp4` | 1920×1080 | 15초 티저 영상 |
| `hero_banner_winter.jpg` | 2560×1440 | 겨울 시즌 히어로 |

### 2.2 `BrandDashboard` — 라이선스 만료 예시

| 파일명 | 용도 요약 |
|--------|-----------|
| `stock_lifestyle_01.png` | 스톡 이미지 라이선스 UI |
| `social_post_03.png` | 모델 초상권 만료 예시 |
| `bg_texture_03.jpg` | 배경 텍스처 스톡 |

### 2.3 `Collaboration` — 리뷰 목록 예시

| 파일명 | 용도 요약 |
|--------|-----------|
| `summer_banner_v3.png` | 에이전시 제출 배너 리뷰 |
| `social_post_agency.jpg` | 소셜 에셋 리뷰 |
| `email_header_final.png` | 이메일 헤더 최종본 |
| `product_shot_01.jpg` | 제품 컷 리뷰 |

---

## 3. 자산별 상세 (스톡 키워드 + AI 프롬프트)

아래 **AI 프롬프트**는 도구 중립적으로 작성했다 (Imagen, Firefly, Midjourney, Flux 등).  
**Negative prompt (공통 권장)**: `text, watermark, logo, trademark, distorted hands, low resolution, oversaturated`

---

### `campaign_summer_hero.png` (3840×2160)

- **용도**: 대시보드·알림 등에 등장하는 여름 캠페인 메인 히어로.
- **구도·무드**: 16:9, 시원한 여름, 햇살, 넓은 여백(타이포 오버레이 가능), 브랜드 블루 톤과 어울리는 하늘·바다 또는 도시 야외.
- **스톡 검색 키워드 (영문)**: `summer campaign hero`, `outdoor lifestyle wide`, `golden hour beach`, `minimal summer skyline`
- **AI 생성 (메인 프롬프트)**:  
  `Ultra wide cinematic summer campaign hero, 16:9, bright natural light, clean composition with negative space for headline, subtle cool blue and warm accent tones, premium advertising photography, no people or anonymous silhouettes far in background, 8k`
- **주의**: 인물이 있으면 스톡의 모델 릴리스 확인. 로고·슬로건은 이미지에 넣지 말고 UI에서 합성.

---

### `promo_banner_v2.png` (1920×1080)

- **용도**: 프로모션 배너, 브랜드 위반 시나리오(배경 톤)와 연결 가능.
- **구도·무드**: 풀 HD, 카피 영역 확보(좌측 또는 하단 1/3 여백), 프로페셔널 B2C 광고 느낌.
- **스톡 검색 키워드**: `promo banner background`, `clean gradient tech`, `product showcase desk`, `modern office abstract`
- **AI 생성**:  
  `Full HD promotional banner background, 1920x1080, modern minimalist, soft gradient from deep blue to teal, subtle geometric shapes, empty area for text left third, studio lighting, corporate marketing aesthetic, no text`
- **주의**: mock 시나리오의 “차가운 톤”을 연출하려면 틸/시안 비중을 조금 올린 버전을 별도 컷으로 준비할 수 있다.

---

### `social_post_03.png` (1080×1080)

- **용도**: 소셜 정사각, 브랜드 위반(컬러·로고 여백) 데모.
- **구도·무드**: 1:1, 소셜 광고 느낌, 중앙 피사체 또는 대칭 구도, 로고 자리를 **의도적으로 비워** 두면 “여백 부족” 시나리오를 나중에 시각화하기 좋다.
- **스톡 검색 키워드**: `instagram square lifestyle`, `flat lay branding`, `summer product top view`
- **AI 생성**:  
  `Square 1:1 social media ad layout, clean studio tabletop, summer props, space reserved for logo top right corner margin, vibrant but not neon, soft shadow, shot from above, advertising photography, no text no logo`
- **주의**: 실제 브랜드 로고는 넣지 않는다. 위반 연출은 UI 오버레이로 처리.

---

### `product_lifestyle_01.png` (4000×3000)

- **용도**: 고해상도 제품 라이프스타일 마스터.
- **구도·무드**: 제품이 읽히는 거리, 자연광, 거실·데스크·카페 등 중립적 라이프스타일. 실제 SKU가 없으면 **중립적인 소품**(보틀, 노트북, 헤드폰 등)으로 대체.
- **스톡 검색 키워드**: `product lifestyle natural light`, `minimal home desk scene`, `premium consumer product`
- **AI 생성**:  
  `High resolution lifestyle product photography, neutral modern interior, soft daylight through window, shallow depth of field, elegant composition, generic premium object on wooden table, editorial commercial style, no readable labels, 4k`
- **주의**: 상표가 보이는 패키지는 피하거나 스톡에서 라이선스 확인.

---

### `email_header_q2.png` (600×200)

- **용도**: 이메일 헤더 — 극단적인 가로로 긴 비율.
- **구도·무드**: 좁은 높이이므로 **수평 패턴·그라데이션·얕은 풍경**이 적합. 텍스트는 HTML/디자인에서 올린다.
- **스톡 검색 키워드**: `email header banner wide`, `newsletter gradient strip`, `abstract horizontal pattern`
- **AI 생성**:  
  `Extremely wide thin banner crop, 3:1 aspect, soft blue to white horizontal gradient, subtle abstract wave texture, email newsletter header, plenty of calm negative space, no text`
- **주의**: AI는 작은 해상도에서 디테일이 붕괴될 수 있어, **큰 캔버스로 생성 후 600×200으로 리사이즈**하는 것을 권장.

---

### `infographic_stats.png` (1200×2400)

- **용도**: 세로 긴 통계 인포그래피. mock에서는 폰트 위반 시나리오와 연결.
- **구도·무드**: **실사 AI보다는 벡터/디자인 툴**이 적합. 배경만 AI/스톡으로 뽑고 숫자·차트는 Figma에서 만든다.
- **스톡 검색 키워드**: `infographic template vertical`, `annual report chart layout` (템플릿 구매 시)
- **AI 생성 (배경만)**:  
  `Tall vertical abstract infographic background, soft corporate blue palette, faint grid and chart placeholders as blurred shapes only, minimalist, no letters no numbers, clean vector-like illustration style`
- **주의**: `Arial` vs `Noto Sans` 같은 시나리오는 **실제 텍스트 레이어**로 재현해야 한다. AI가 생성한 글자는 깨지기 쉽다.

---

### `video_teaser_15s.mp4` (1920×1080)

- **용도**: 짧은 캠페인 티저. mock의 AI 수정 인박스 등과 연동 가능.
- **구도·무드**: 15초, 루프 가능한 B-roll, 제품/이벤트 톤.
- **소스**: Adobe Stock / Pexels Videos / Coverr 등 **클립 라이선스** 확인.
- **AI**: 영상 생성 툴은 시점·깜빡임 이슈가 있어, **스톡 15초 클립 트리밍**을 우선 권장.
- **주의**: 음원은 별도 라이선스(예: Adobe Stock audio).

---

### `hero_banner_winter.jpg` (2560×1440)

- **용도**: 겨울 시즌 히어로, 캠페인 `Winter 2025`.
- **구도·무드**: 16:9, 눈·조명·따뜻한 실내 대비 차가운 외부 등 겨울 무드. 카피 영역 확보.
- **스톡 검색 키워드**: `winter hero banner`, `snow city night`, `cozy window cold outside`
- **AI 생성**:  
  `Cinematic winter season hero image, 2560x1440, soft snowfall, cool color grade with warm accent lights, spacious composition for headline overlay, premium campaign photography, no text`
- **주의**: 휴일 상표(산타 등) 과다 노출은 피하면 범용 데모에 유리.

---

### `stock_lifestyle_01.png` · `bg_texture_03.jpg` (라이선스 UI용)

- **용도**: BrandDashboard “만료 임박” 목록 썸네일·대표 이미지.
- **구도·무드**: `stock_lifestyle` — 일반적인 라이프스타일 스톡. `bg_texture` — 은은한 종이·패브릭·노이즈 텍스처.
- **스톡 검색 키워드**: `neutral lifestyle stock`, `subtle paper texture seamless`, `light gray background grain`
- **AI 생성 (lifestyle)**:  
  `Generic stock lifestyle photo, bright airy room, blurred background, anonymous person optional out of focus, commercial stock aesthetic, no logos`
- **AI 생성 (texture)**:  
  `Seamless subtle texture, light cool gray, fine grain, paper-like, tileable, no text`
- **주의**: “스톡” 시나리오이므로 실제로는 스톡 한 장을 쓰는 것이 시연상 가장 자연스럽다.

---

### `social_post_03.png` (모델 초상권)

- **용도**: 초상권 만료 카운트다운 데모.
- **구도·무드**: 프로필·반신 등 **모델 릴리스가 명확한 스톡 초상**을 사용.
- **스톡 검색 키워드**: `model released portrait commercial`, `diverse professional headshot`
- **AI 생성**: 실제 “모델 계약” 시나리오와 맞지 않을 수 있어 **스톡 우선**. 꼭 AI면 합성 인물 정책·표기 요건을 준수한다.
- **주의**: AI 합성 얼굴은 지역·서비스 약관에 따라 사용 제한이 있다.

---

### `summer_banner_v3.png` · `social_post_agency.jpg` · `email_header_final.png` · `product_shot_01.jpg`

- **용도**: Collaboration 리뷰 큐 예시 파일명. 위의 동일 카테고리와 매칭하면 된다.  
  - `summer_banner_v3` → `campaign_summer_hero` / `promo_banner`와 유사 톤  
  - `social_post_agency` → `social_post_03`과 동일 1:1 가이드  
  - `email_header_final` → `email_header_q2` 비율  
  - `product_shot_01` → 제품 단독 컷, 배경 단순

---

## 4. 파일 보관 제안 (선택)

실제 미디어 파일은 저장소 루트 `public/sample/` 아래에 두고, 빌드·개발 서버에서는 URL 경로 `/sample/...`로 참조한다. 본 문서는 **소스·프롬프트 정리**만 담당하며, 코드 연동은 별도 작업이다.

---

## 5. 체크리스트 (데모 전)

- [ ] 각 파일 해상도가 목표에 근접하는가 (리사이즈 시 선명도 확인)
- [ ] 스톡/영상/음원 라이선스가 데모·녹화 용도로 허용되는가
- [ ] 브랜드 로고·가짜 텍스트가 이미지에 섞이지 않았는가 (시나리오상 필요할 때만 UI에서 추가)
- [ ] 인물 사진은 모델/합성 관련 규정을 충족하는가
