# Assets Copilot 데모용 샘플 이미지 생성 가이드

> 작성일: 2026-04-22
> 상태: 초안
> 문서 인덱스: [README.md](./README.md)
> 선행 문서: [99-demo-scenario.md](./99-demo-scenario.md), [sample-images.md](./sample-images.md)

---

## 1. 개요

Assets Copilot 데모 시나리오(A–E)에서 실제로 화면에 노출되는 이미지 목록과 Adobe Firefly 생성 프롬프트를 정리한다.  
생성된 파일은 `public/sample/` 폴더에 저장하면 즉시 반영된다.

**현재 `public/sample/`에 이미 있는 파일**

| 파일명 | 비고 |
|--------|------|
| `product_shot_01.png` | 에셋 검색 결과 카드용 |
| `product_lifestyle_01.png` | 에셋 검색 결과 카드용 |
| `social_post_03.png` | 위반 수정 after 이미지 |
| `social_post_03_before.png` | 위반 수정 before 이미지 |
| `hero_banner_winter.png` | 이미지 생성 후보 base (CSS filter로 4종 변형) |
| `promo_banner_v2.png` | 브랜드 대시보드용 |

---

## 2. 신규 생성 필요 파일

### 2.1 Scenario B — 거버넌스 체크 (외부 에이전시 제출 이미지)

> `/ai/copilot` 채팅창에 이미지 첨부 시 거버넌스 자동 검사 데모용.  
> 파일명에 `warn` / `block` 키워드가 포함되면 mock이 자동으로 해당 결과를 반환한다.

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `agency_submit_warn.png` | `public/sample/` | 1920×1080 |

**Firefly 프롬프트**
```
Professional marketing banner for outdoor lifestyle brand, product photography
with warm sunset tones, slightly oversaturated orange-yellow color grading,
clean layout with text placeholder area, high quality commercial photography
```
- Content type: `Photo`
- Style: `Commercial photography`
- 의도: 색상 톤이 약간 어긋난 수준 → **경고(warn)** 케이스

---

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `agency_submit_block.png` | `public/sample/` | 1920×1080 |

**Firefly 프롬프트**
```
Bold promotional banner with bright vivid red dominant background,
aggressive warm color scheme, neon accent colors, product advertisement layout,
commercial photography style — overly saturated, clearly off-brand palette
```
- Content type: `Photo`
- Style: `Commercial photography`
- Lighting & color: 채도 최대, 색온도 가장 따뜻하게
- 의도: 브랜드 컬러 완전 이탈 → **차단(block)** 케이스

---

### 2.2 Scenario C — 이미지 생성 후보 4종

> `hero_banner_winter.png`가 이미 있어 코드에서 CSS filter로 4종 변형해 표시한다.  
> 더 실감나는 데모를 원하면 아래 4개 파일을 별도 생성해 저장한다.

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `winter_promo_generated_01.png` | `public/sample/` | 2560×1440 |

**Firefly 프롬프트**
```
Cinematic winter hero banner, snow-covered mountain cabin at dusk,
warm glowing windows, natural light, blue-grey color palette,
minimalist background, ultra wide landscape, commercial photography, 8K quality
```

---

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `winter_promo_generated_02.png` | `public/sample/` | 2560×1440 |

**Firefly 프롬프트**
```
Winter promotion hero banner, deep blue gradient sky, frozen lake reflection,
pine forest silhouette, professional wide-format layout, cool blue tone color grading,
premium brand aesthetic, negative space for text overlay
```

---

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `winter_promo_generated_03.png` | `public/sample/` | 2560×1440 |

**Firefly 프롬프트**
```
Dark moody winter banner, dramatic night sky with stars,
cozy alpine chalet with warm christmas lights, dark background with highlight contrast,
luxury brand style, cinematic lighting, wide cinematic aspect ratio
```

---

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `winter_promo_generated_04.png` | `public/sample/` | 2560×1440 |

**Firefly 프롬프트**
```
Soft pastel winter outdoor scene, fresh snow on trees, golden hour light,
airy and clean Scandinavian minimalist aesthetic,
wide negative space for text overlay, lifestyle brand editorial photography
```

---

### 2.3 Scenario D / E — 브랜드 위반 수정 전·후

> `before_after` 카드에서 수정 전/후 이미지로 사용된다.  
> `social_post_03_before.png` / `social_post_03.png` 가 이미 있지만,  
> 위반이 더 명확히 보이는 버전이 필요하면 아래 파일로 교체한다.

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `violation_sample_red_tone.png` | `public/sample/` | 1080×1080 |

**Firefly 프롬프트**
```
Social media square post for lifestyle brand, product flatlay composition,
vivid red-orange dominant color tone, oversaturated warm palette,
cramped logo area, off-brand color grading — brand guideline violation aesthetic,
Instagram post format
```
- Lighting & color: 색온도 매우 따뜻하게, 채도 높게
- 의도: **수정 전(before)** — 색상 톤 위반

---

| 파일명 | 저장 경로 | 캔버스 |
|--------|-----------|--------|
| `violation_fixed_cool_tone.png` | `public/sample/` | 1080×1080 |

**Firefly 프롬프트**
```
Same social media square post layout, product flatlay composition,
corrected with cool neutral blue-white brand palette,
clean typography, proper logo whitespace and margins,
professional brand-compliant layout, Instagram post format
```
- Lighting & color: 색온도 차갑게, 채도 중간
- 의도: **수정 후(after)** — 브랜드 컬러 준수

---

### 2.4 기존 파일 품질 개선 (선택)

현재 파일로도 데모는 동작하지만, 더 실감나는 사진으로 교체하고 싶을 경우 아래 프롬프트를 사용한다.

| 파일명 | 캔버스 | Firefly 프롬프트 |
|--------|--------|----------------|
| `product_shot_01.png` | 1200×900 | `Professional product photography, wireless headphones on minimal white surface, soft shadow, clean studio lighting, commercial quality, lifestyle brand` |
| `product_lifestyle_01.png` | 1200×900 | `Lifestyle product photography, laptop and headphones on wooden desk, natural window light, home office aesthetic, warm neutral tones, editorial style` |
| `hero_banner_winter.png` | 2560×1440 | `Cinematic winter hero banner, snow-covered mountain cabin at dusk, warm glowing windows, natural light, blue-grey color palette, ultra wide landscape, 8K` |

---

## 3. 생성 체크리스트

| 파일명 | 시나리오 | 필수 여부 | 완료 |
|--------|----------|-----------|------|
| `agency_submit_warn.png` | B | 필수 | [ ] |
| `agency_submit_block.png` | B | 필수 | [ ] |
| `violation_sample_red_tone.png` | D, E | 필수 | [ ] |
| `violation_fixed_cool_tone.png` | D, E | 필수 | [ ] |
| `winter_promo_generated_01.png` | C | 선택 | [ ] |
| `winter_promo_generated_02.png` | C | 선택 | [ ] |
| `winter_promo_generated_03.png` | C | 선택 | [ ] |
| `winter_promo_generated_04.png` | C | 선택 | [ ] |
| `product_shot_01.png` (교체) | A | 선택 | [ ] |
| `product_lifestyle_01.png` (교체) | A | 선택 | [ ] |
| `hero_banner_winter.png` (교체) | C | 선택 | [ ] |

---

## 4. Firefly 생성 팁

- **Content type**: `Photo` 선택 (Art 아님)
- **Style**: `Commercial photography` 또는 `Product photography`
- **Aspect ratio**: 생성 후 캔버스 크기에 맞게 크롭/내보내기
- 위반 이미지는 `Lighting & color` 패널에서 색온도·채도를 수동 조정하면 더 명확한 위반 효과를 낼 수 있다
- 생성 후 `PNG` 또는 `JPG (품질 90+)` 로 내보내기
- 저장 위치: `asset-mate/public/sample/`
