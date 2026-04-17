/** mockup/public/sample 에 생성된 샘플 미디어 경로 */

const SAMPLE = '/sample';

/**
 * 에셋 파일명 → 정적 URL. 비디오(.mp4)는 스크립트가 만든 포스터 JPG를 가리킵니다.
 * `before`: 위반 연출용 `_before` 에셋이 있으면 그 경로 (예: social_post_03).
 * `cacheBust`: 동일 파일명으로 교체 후 브라우저 캐시를 뚫을 때 증가시키는 정수.
 */
export function sampleImageUrl(
  assetFileName: string,
  phase: 'before' | 'after' = 'after',
  cacheBust?: number
): string {
  let url: string;
  if (/\.mp4$/i.test(assetFileName)) {
    url = `${SAMPLE}/video_teaser_15s_poster.jpg`;
  } else if (phase === 'before' && assetFileName === 'social_post_03.png') {
    url = `${SAMPLE}/social_post_03_before.png`;
  } else {
    url = `${SAMPLE}/${assetFileName}`;
  }
  if (cacheBust != null && cacheBust > 0) {
    url += url.includes('?') ? `&v=${cacheBust}` : `?v=${cacheBust}`;
  }
  return url;
}
