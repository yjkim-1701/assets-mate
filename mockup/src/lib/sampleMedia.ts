/** mockup/public/sample 에 생성된 샘플 미디어 경로 */

const SAMPLE = '/sample';

/**
 * 에셋 파일명 → 정적 URL. 비디오(.mp4)는 스크립트가 만든 포스터 JPG를 가리킵니다.
 */
export function sampleImageUrl(assetFileName: string): string {
  if (/\.mp4$/i.test(assetFileName)) {
    return `${SAMPLE}/video_teaser_15s_poster.jpg`;
  }
  return `${SAMPLE}/${assetFileName}`;
}
