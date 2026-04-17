import type { CSSProperties, ReactNode } from 'react';
import { BADGE_TOKENS, spectrumVariantToTone, type MutedTone } from '../theme/tokens';

type SpectrumLike = 'positive' | 'negative' | 'notice' | 'informative' | 'accent' | 'neutral' | 'gray';

type Props = {
  children: ReactNode;
  /** 직접 톤 지정 */
  tone?: MutedTone;
  /** 기존 Spectrum Badge variant 와 동일한 의미로 매핑 */
  variant?: SpectrumLike;
  size?: 'S' | 'M' | 'L';
  style?: CSSProperties;
};

export function MutedBadge({ children, tone, variant, size = 'S', style }: Props) {
  const t = tone ?? (variant ? spectrumVariantToTone(variant) : 'neutral');
  const b = BADGE_TOKENS[t];
  const pad: CSSProperties['padding'] =
    size === 'L' ? '6px 12px' : size === 'M' ? '4px 10px' : '2px 8px';
  const fontSize = size === 'L' ? 13 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        padding: pad,
        fontSize,
        fontWeight: 600,
        lineHeight: 1.25,
        backgroundColor: b.bg,
        color: b.text,
        border: `1px solid ${b.border}`,
        boxSizing: 'border-box',
        maxWidth: '100%',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
