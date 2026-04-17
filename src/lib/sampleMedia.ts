/** mockup/public/sample 에 생성된 샘플 미디어 경로 */

const SAMPLE = '/sample';

/**
 * 에셋 파일명 → 정적 URL. 비디오(.mp4)는 스크립트가 만든 포스터 JPG를 가리킵니다.
 * `before`: 위반 연출용 `_before` 에셋이 있으면 그 경로 (예: social_post_03).
 */
export function sampleImageUrl(assetFileName: string, phase: 'before' | 'after' = 'after'): string {
  if (/\.mp4$/i.test(assetFileName)) {
    return `${SAMPLE}/video_teaser_15s_poster.jpg`;
  }
  if (phase === 'before' && assetFileName === 'social_post_03.png') {
    return `${SAMPLE}/social_post_03_before.png`;
  }
  return `${SAMPLE}/${assetFileName}`;
}
