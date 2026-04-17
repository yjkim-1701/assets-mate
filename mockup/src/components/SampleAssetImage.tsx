import type { CSSProperties } from 'react';
import { sampleImageUrl } from '../lib/sampleMedia';

type Props = {
  filename: string;
  alt?: string;
  style?: CSSProperties;
};

/** 샘플 에셋 이미지(또는 비디오 포스터). cover로 영역을 채웁니다. */
export function SampleAssetImage({ filename, alt = '', style }: Props) {
  return (
    <img
      src={sampleImageUrl(filename)}
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
