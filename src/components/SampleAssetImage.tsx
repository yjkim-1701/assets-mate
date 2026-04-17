import type { CSSProperties } from 'react';
import { sampleImageUrl } from '../lib/sampleMedia';

type Props = {
  filename: string;
  /** 수정 전(위반 연출) / 수정 후 — `_before` 매핑이 있을 때만 달라짐 */
  phase?: 'before' | 'after';
  alt?: string;
  style?: CSSProperties;
  /** 1 이상이면 URL에 `?v=` 쿼리를 붙여 캐시 무효화 (동일 파일 재교체 시) */
  cacheBust?: number;
};

/** 샘플 에셋 이미지(또는 비디오 포스터). cover로 영역을 채웁니다. */
export function SampleAssetImage({ filename, phase = 'after', alt = '', style, cacheBust }: Props) {
  return (
    <img
      src={sampleImageUrl(filename, phase, cacheBust)}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
    />
  );
}
