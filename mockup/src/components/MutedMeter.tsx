import { Text } from '@react-spectrum/s2';
import { METER_TOKENS } from '../theme/tokens';

type BarTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type Props = {
  value: number;
  label?: string;
  size?: 'S' | 'M' | 'L';
  /** Spectrum Meter variant 와 동일 의미 */
  variant?: 'positive' | 'negative' | 'notice' | 'informative';
  /** 직접 바 색 톤 */
  tone?: BarTone;
};

function variantToBarTone(v: Props['variant']): BarTone {
  if (!v) return 'info';
  if (v === 'positive') return 'success';
  if (v === 'negative') return 'danger';
  if (v === 'notice') return 'warning';
  return 'info';
}

export function MutedMeter({ value, label, size = 'M', variant = 'informative', tone }: Props) {
  const barTone = tone ?? variantToBarTone(variant);
  const h = size === 'S' ? 6 : size === 'L' ? 10 : 8;
  const fill = METER_TOKENS.fill[barTone];

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <div
        style={{
          height: h,
          backgroundColor: METER_TOKENS.track,
          borderRadius: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            height: '100%',
            backgroundColor: fill,
            borderRadius: 9999,
            transition: 'width 0.2s ease',
          }}
        />
      </div>
      {label ? (
        <Text UNSAFE_style={{ fontSize: size === 'S' ? 11 : 12, color: '#6B7280', marginTop: 4, display: 'block' }}>
          {label}
        </Text>
      ) : null}
    </div>
  );
}
