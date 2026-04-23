# Assets Copilot 데모용 샘플 이미지 — 시나리오 세트 정의

> 작성일: 2026-04-22
> 상태: 초안 (개정 3)
> 문서 인덱스: [README.md](./README.md)
> 선행 문서: [99-demo-scenario.md](./99-demo-scenario.md), [07-integrated-AI.md](./07-integrated-AI.md)
> **제품 전제**: 전자 기기 — **무선 헤드셋** (모든 시나리오 공통)

---

## 설계 원칙

- **시나리오 간 이미지 미공유**: 어떤 이미지 파일도 두 개 이상의 시나리오에서 사용되지 않는다.
- **세트 내 일관성**: 같은 시나리오의 이미지들은 동일한 포맷·색조·스타일을 공유한다.
- **source = before**: Scenario D·E의 수정 전(before) 이미지는 검색 결과 카드에 나타나는 source asset 파일 자체와 동일하다.
- **`_fixed` 네이밍 규칙**: 수정 후(after) 이미지는 `<원본명>_fixed.<ext>` 로 명명한다. `mockBeforeAfter` 가 자동으로 참조한다.

---

## 시나리오별 이미지 세트

---

### SET A — 시나리오 A: 2026 Summer 소셜 이미지 검색

**트리거 발화**: `"2026 여름 캠페인 중에 승인된 1:1 소셜 이미지 보여줘"`
**표시 카드**: `asset_grid` → `asset_detail`
**필터**: campaign: `2026 Summer` · status: `approved` · assetKind: `photo`

| 파일명 | mock ID | 해상도 | 역할 | 상태 |
|--------|---------|--------|------|------|
| `summer_social_headset_01.png` | a11 | 1080×1080 | 검색 결과 카드 1 | 🆕 신규 생성 필요 |
| `summer_social_headset_02.png` | a12 | 1080×1080 | 검색 결과 카드 2 | 🆕 신규 생성 필요 |
| `summer_social_headset_03.png` | a13 | 1080×1080 | 검색 결과 카드 3 | 🆕 신규 생성 필요 |

> **격리 보장**: a4(product_lifestyle_01.png)의 캠페인을 `Brand Refresh`로 변경해 A 검색 결과에서 제외함 (코드 반영 완료).

#### A-1. `summer_social_headset_01.png` — 헤드셋 플랫레이, 여름 미니멀

```
Premium wireless over-ear headphones flatlay on a clean sand-white surface,
bright natural summer daylight, cool white and brand blue accent tones,
square format with generous top negative space for text overlay,
commercial product photography, Instagram post 1:1
```
- Style: `Product photography` · Lighting: 자연광, 쿨화이트

#### A-2. `summer_social_headset_02.png` — 헤드셋 착용 라이프스타일, 여름 야외

```
Young person wearing premium wireless headphones in a bright summer outdoor setting,
casual lifestyle mood, brand blue clothing accent, soft bokeh background,
square 1:1 crop, editorial lifestyle photography, Instagram social feed
```
- Style: `Lifestyle photography` · Lighting: 골든아워 전 자연광

#### A-3. `summer_social_headset_03.png` — 헤드셋 + 여름 오브제 스타일링

```
Premium wireless headphones styled with summer accessories — sunglasses and light fabric —
clean flatlay, airy blue-white palette, brand-compliant color scheme,
square composition, high-end product styling, Instagram 1:1 format
```
- Style: `Product photography / Flat lay` · Lighting: 소프트박스 확산광

---

### SET B — 시나리오 B: 거버넌스 체크 업로드

**트리거 동작**: 채팅창에 이미지 드래그 드롭
**표시 카드**: `governance_report` (warn 또는 block)
**mock 판정 기준**: 파일명에 `warn` / `block` 포함 여부

| 파일명 | 해상도 | 역할 | 상태 |
|--------|--------|------|------|
| `agency_submit_warn.png` | 1920×1080 | 첨부 썸네일 + 경고 판정 트리거 | ⚠️ 내용 교체 필요 (헤드셋 테마) |
| `agency_submit_block.png` | 1920×1080 | 첨부 썸네일 + 차단 판정 트리거 | ⚠️ 내용 교체 필요 (헤드셋 테마) |

> **격리 보장**: 파일명에 `warn`/`block` 포함이 필수이므로 파일명은 유지, 이미지 내용만 교체.

#### B-1. `agency_submit_warn.png` — 헤드셋 배너, 경미한 색상 이탈

```
Wide marketing banner for premium wireless headphones, 16:9 format,
warm sunset orange-yellow color grading, slightly oversaturated warm tones —
intentionally off the brand's cool blue palette but not severe,
product centered, clean layout with text placeholder area,
commercial photography, agency submission style
```
- Lighting & color: 색온도 따뜻하게 (+30), 채도 +20
- 의도: **경고(warn)** — 색상 톤 경미한 이탈

#### B-2. `agency_submit_block.png` — 헤드셋 배너, 브랜드 컬러 완전 이탈

```
Wide promotional banner with wireless headphones as hero product,
vivid red dominant background, aggressive warm accent neon colors,
oversaturated color scheme completely different from cool blue brand identity,
commercial photography style, agency submission format, 16:9
```
- Lighting & color: 채도 최대, 색온도 매우 따뜻하게
- 의도: **차단(block)** — 브랜드 컬러 완전 이탈

---

### SET C — 시나리오 C: 겨울 프로모션 배너 AI 생성

**트리거 발화**: `"겨울 프로모션 히어로 배너 만들어줘, 2560×1440, 블루 톤"`
**표시 카드**: `generation_preview` — 2×2 후보 그리드
**코드 참조**: `copilotIntentMock.ts GEN_IMAGES` 배열

| 파일명 | 해상도 | promptAdj 태그 | 상태 |
|--------|--------|----------------|------|
| `winter_promo_generated_01.png` | 2560×1440 | `—자연광, 미니멀 배경` | ⚠️ 내용 교체 필요 (헤드셋 테마) |
| `winter_promo_generated_02.png` | 2560×1440 | `—블루 그라디언트 톤` | ⚠️ 내용 교체 필요 (헤드셋 테마) |
| `winter_promo_generated_03.png` | 2560×1440 | `—다크 배경, 하이라이트 강조` | ⚠️ 내용 교체 필요 (헤드셋 테마) |
| `winter_promo_generated_04.png` | 2560×1440 | `—소프트 파스텔, 아웃도어` | ⚠️ 내용 교체 필요 (헤드셋 테마) |

> **격리 보장**: 파일명 유지, 이미지 내용만 헤드셋 겨울 배너로 교체.

#### C-1. `winter_promo_generated_01.png` — 자연광·미니멀

```
Premium wireless over-ear headphones on a minimal snowy white surface,
cinematic winter hero banner, cold natural window light,
blue-grey cool palette, clean negative space for text overlay,
ultra-wide landscape 16:9, commercial product photography, 8K quality
```

#### C-2. `winter_promo_generated_02.png` — 블루 그라디언트

```
Premium wireless headphones floating on deep blue gradient background,
winter promotion hero banner, cool blue tone color grading,
frost crystal texture overlay, premium brand aesthetic,
wide-format 16:9 with negative space for headline, commercial photography
```

#### C-3. `winter_promo_generated_03.png` — 다크·하이라이트

```
Premium wireless headphones on dark velvet surface,
dramatic winter night mood, string lights bokeh background,
rim highlight accentuating headphone curves, luxury product photography,
cinematic wide format 16:9
```

#### C-4. `winter_promo_generated_04.png` — 소프트 파스텔

```
Wireless headphones with cozy winter accessories — knit scarf and warm mug —
soft pastel arrangement, Scandinavian aesthetic, airy wide layout,
negative space for text overlay, editorial lifestyle photography, 16:9
```

---

### SET D — 시나리오 D: 브랜드 위반 소셜 포스트 수정

**트리거 발화**: `"social_post_03 스코어 너무 낮네, 자동으로 고쳐줘"`
**표시 카드**: `before_after` — 좌(before) · 우(after) · 스코어 45→88
**source = before 원칙**: mockBeforeAfter가 `social_post_03.png` 자체를 before 이미지로 사용.

| 파일명 | mock ID | 해상도 | 역할 | brandScore | 상태 |
|--------|---------|--------|------|------------|------|
| `social_post_03.png` | a3 | 1080×1080 | source asset 썸네일 = before | 45 | ⚠️ 내용 교체 필요 (헤드셋 위반 이미지) |
| `social_post_03_fixed.png` | — | 1080×1080 | after (수정 후) | 88 | 🆕 신규 생성 필요 |

> **격리 보장**: a3 (Brand Refresh campaign, violation)은 Scenario A 검색 필터(2026 Summer + approved + photo)에 걸리지 않으므로 Set A와 완전히 분리된다.
>
> **`_fixed` 규칙**: `mockBeforeAfter`가 `social_post_03.png` → `social_post_03_fixed.png` 를 자동 파생하므로 코드 변경 불필요.

#### D-1. `social_post_03.png` — 헤드셋 소셜, 브랜드 위반 (before · source)

```
Wireless headphones product social media post, square 1:1 Instagram format,
flatlay on a warm terracotta-red surface, warm orange-red dominant tones,
oversaturated color grading far from brand's cool blue palette,
product clearly visible but surrounding colors are off-brand,
cramped composition with logo too close to edge
```
- Lighting & color: 색온도 매우 따뜻하게, 채도 높게
- 의도: 브랜드 스코어 45, 색상 위반 + 로고 여백 부족 — **수정 전(before)**

#### D-2. `social_post_03_fixed.png` — 헤드셋 소셜, 브랜드 준수 (after)

```
Same wireless headphones product in square 1:1 format,
corrected with cool neutral brand palette — white and brand blue (#1D4ED8) tones,
clean minimal composition, proper logo whitespace and margins,
professional brand-compliant product photography, Instagram feed format
```
- Lighting & color: 쿨 블루+화이트, 채도 표준
- 의도: 브랜드 스코어 88 — **수정 후(after)**

---

### SET E — 시나리오 E: 여름 배너 검색 → 수정 → DAM 저장 복합 체인

**트리거 발화**: `"여름 캠페인 배너 중에 스코어 60 미만인 거 보여줘"` → `"첫 번째 자동으로 고쳐줘"`
**표시 카드**: `asset_grid` → `before_after` → `governance_report` → `dam_path_suggest`
**필터**: campaign: `2026 Summer` · assetKind: `banner` · brandScore < 60
**`_fixed` 규칙**: `mockBeforeAfter`가 `summer_banner_violation.png` → `summer_banner_violation_fixed.png` 자동 파생.

| 파일명 | mock ID | 해상도 | 역할 | brandScore | 상태 |
|--------|---------|--------|------|------------|------|
| `summer_banner_violation.png` | a14 | 1920×1080 | source asset 썸네일 = before | 48 | 🆕 신규 생성 필요 |
| `summer_banner_violation_fixed.png` | — | 1920×1080 | after (수정 후) | 91 | 🆕 신규 생성 필요 |

> **격리 보장**: a14는 assetKind: `banner`, brandScore: 48, campaign: `2026 Summer`. Scenario A 검색(photo 필터)에는 나타나지 않고, Scenario D의 social post와는 format(1080→1920)·campaign(Brand Refresh→2026 Summer)이 완전히 다르다.

#### E-1. `summer_banner_violation.png` — 여름 헤드셋 배너, 브랜드 위반 (before · source)

```
Wide promotional banner for wireless headphones, landscape 16:9 format,
summer campaign aesthetic with warm orange-yellow dominant background,
oversaturated warm palette clearly off the brand's cool blue identity,
product centered, logo area with insufficient whitespace,
commercial photography, marketing banner layout
```
- Lighting & color: 색온도 매우 따뜻하게, 오렌지-옐로우 계열 지배, 채도 높게
- 의도: 브랜드 스코어 48 — **위반(violation)**, 수정 전(before)

#### E-2. `summer_banner_violation_fixed.png` — 여름 헤드셋 배너, 브랜드 준수 (after)

```
Wide promotional banner for wireless headphones, landscape 16:9 format,
corrected summer campaign design with brand-compliant cool blue palette (#1D4ED8),
clean minimal layout, proper logo whitespace and margins,
professional commercial photography, strong negative space for headline text,
premium brand-aligned marketing banner
```
- Lighting & color: 쿨 블루 지배, 화이트 여백 확보
- 의도: 브랜드 스코어 91 — **수정 후(after)**

---

## 생성 체크리스트

| 세트 | 파일명 | 해상도 | 작업 | Firefly 프롬프트 | 완료 |
|------|--------|--------|------|-----------------|------|
| **A** | `summer_social_headset_01.png` | 1080×1080 | 신규 생성 | `Premium wireless over-ear headphones flatlay on a clean sand-white surface, bright natural summer daylight, cool white and brand blue accent tones, square format with generous top negative space for text overlay, commercial product photography, Instagram post 1:1` | [x] |
| **A** | `summer_social_headset_02.png` | 1080×1080 | 신규 생성 | `Young person wearing premium wireless headphones in a bright summer outdoor setting, casual lifestyle mood, brand blue clothing accent, soft bokeh background, square 1:1 crop, editorial lifestyle photography, Instagram social feed` | [x] |
| **A** | `summer_social_headset_03.png` | 1080×1080 | 신규 생성 | `Premium wireless headphones styled with summer accessories — sunglasses and light fabric — clean flatlay, airy blue-white palette, brand-compliant color scheme, square composition, high-end product styling, Instagram 1:1 format` | [x] |
| **B** | `agency_submit_warn.png` | 1920×1080 | 내용 교체 | `Wide marketing banner for premium wireless headphones, 16:9 format, warm sunset orange-yellow color grading, slightly oversaturated warm tones intentionally off the brand's cool blue palette, product centered, clean layout with text placeholder, commercial photography` | [ ] |
| **B** | `agency_submit_block.png` | 1920×1080 | 내용 교체 | `Wide promotional banner with wireless headphones as hero product, vivid red dominant background, aggressive warm accent neon colors, oversaturated color scheme completely different from cool blue brand identity, commercial photography style, 16:9` | [ ] |
| **C** | `winter_promo_generated_01.png` | 2560×1440 | 내용 교체 | `Premium wireless over-ear headphones on a minimal snowy white surface, cinematic winter hero banner, cold natural window light, blue-grey cool palette, clean negative space for text overlay, ultra-wide landscape 16:9, commercial product photography, 8K quality` | [ ] |
| **C** | `winter_promo_generated_02.png` | 2560×1440 | 내용 교체 | `Premium wireless headphones floating on deep blue gradient background, winter promotion hero banner, cool blue tone color grading, frost crystal texture overlay, premium brand aesthetic, wide-format 16:9 with negative space for headline, commercial photography` | [ ] |
| **C** | `winter_promo_generated_03.png` | 2560×1440 | 내용 교체 | `Premium wireless headphones on dark velvet surface, dramatic winter night mood, string lights bokeh background, rim highlight accentuating headphone curves, luxury product photography, cinematic wide format 16:9` | [ ] |
| **C** | `winter_promo_generated_04.png` | 2560×1440 | 내용 교체 | `Wireless headphones with cozy winter accessories — knit scarf and warm mug — soft pastel arrangement, Scandinavian aesthetic, airy wide layout, negative space for text overlay, editorial lifestyle photography, 16:9` | [ ] |
| **D** | `social_post_03.png` | 1080×1080 | 내용 교체 (위반) | `Wireless headphones product social media post, square 1:1 Instagram format, flatlay on a warm terracotta-red surface, warm orange-red dominant tones, oversaturated color grading far from brand's cool blue palette, product visible but surrounding colors are off-brand, cramped logo placement` | [ ] |
| **D** | `social_post_03_fixed.png` | 1080×1080 | 신규 생성 | `Same wireless headphones product in square 1:1 format, corrected with cool neutral brand palette — white and brand blue (#1D4ED8) tones, clean minimal composition, proper logo whitespace and margins, professional brand-compliant product photography, Instagram feed format` | [x] |
| **E** | `summer_banner_violation.png` | 1920×1080 | 신규 생성 | `Wide promotional banner for wireless headphones, landscape 16:9 format, summer campaign aesthetic with warm orange-yellow dominant background, oversaturated warm palette clearly off the brand's cool blue identity, product centered, logo area with insufficient whitespace, commercial photography` | [x] |
| **E** | `summer_banner_violation_fixed.png` | 1920×1080 | 신규 생성 | `Wide promotional banner for wireless headphones, landscape 16:9 format, corrected summer campaign design with brand-compliant cool blue palette (#1D4ED8), clean minimal layout, proper logo whitespace and margins, professional commercial photography, strong negative space for headline text` | [x] |

---

## 코드 반영 현황

| 항목 | 변경 내용 | 완료 |
|------|-----------|------|
| `mock.ts` a4 campaign | `2026 Summer` → `Brand Refresh` (Set A 격리) | ✅ |
| `mock.ts` a11~a13 추가 | Set A 전용 소셜 에셋 | ✅ |
| `mock.ts` a14 추가 | Set E 전용 배너 에셋, brandScore 48 | ✅ |
| `mock.ts` BRAND_VIOLATIONS | a14 위반 항목 v6, v7 추가 | ✅ |
| `mock.ts` AI_FIX_INBOX | a14 수정 요청 f5 추가 | ✅ |
| `searchIntentMock.ts` | `승인된` → status:approved 파싱 수정 | ✅ |
| `searchIntentMock.ts` | `소셜` → kinds:photo 파싱 추가 | ✅ |
| `copilotIntentMock.ts` | `mockBeforeAfter` source=before 원칙 적용 (`assetName` → `assetName_fixed`) | ✅ |

---

## Firefly 생성 팁

- **Content type**: `Photo`
- **Style**: `Product photography` (A·D·E) / `Commercial photography` (B·C)
- **해상도별 Aspect ratio**: 1:1 (A·D), 16:9 (B·C·E)
- 위반 이미지(D before, E before, B-block): `Lighting & color` 패널에서 색온도 최대 따뜻하게 + 채도 높게
- 수정 이미지(D after, E after): 색온도 중간~차갑게, 채도 표준
- 저장: `PNG`, `JPG 품질 90+` / 저장 위치: `asset-mate/public/sample/`
- **주의**: `warn`/`block` 파일명 유지 필수 (mock 거버넌스 판정 기준)
