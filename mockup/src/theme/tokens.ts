/**
 * 두 번째 레퍼런스 스크린샷 수준: 매우 연한 배경 + 같은 계열 진한 글자 + 얇은 보더
 */
export const BADGE_TOKENS = {
  neutral: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },
  success: { bg: '#ECFDF5', text: '#047857', border: '#D1FAE5' },
  warning: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  danger: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  info: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  accent: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
} as const;

export type MutedTone = keyof typeof BADGE_TOKENS;

export function spectrumVariantToTone(
  variant: 'positive' | 'negative' | 'notice' | 'informative' | 'accent' | 'neutral' | 'gray'
): MutedTone {
  const m: Record<string, MutedTone> = {
    positive: 'success',
    negative: 'danger',
    notice: 'warning',
    informative: 'info',
    accent: 'accent',
    neutral: 'neutral',
    gray: 'neutral',
  };
  return m[variant] ?? 'neutral';
}

/** 미터·프로그레스 바 (채도 낮은 채움색) */
export const METER_TOKENS = {
  track: '#E5E7EB',
  fill: {
    success: '#6EE7B7',
    warning: '#FBBF24',
    danger: '#FCA5A5',
    info: '#93C5FD',
    neutral: '#9CA3AF',
  },
} as const;
