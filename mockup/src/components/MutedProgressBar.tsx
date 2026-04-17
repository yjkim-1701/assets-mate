import { Text } from '@react-spectrum/s2';
import { METER_TOKENS } from '../theme/tokens';

type Props = {
  value: number;
  label?: string;
};

/** 캠페인 등 가로 진행 — 파스텔 그린 계열 채움 */
export function MutedProgressBar({ value, label }: Props) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          height: 8,
          backgroundColor: METER_TOKENS.track,
          borderRadius: 9999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${v}%`,
            height: '100%',
            backgroundColor: METER_TOKENS.fill.success,
            borderRadius: 9999,
          }}
        />
      </div>
      {label ? (
        <Text UNSAFE_style={{ fontSize: 12, color: '#6B7280', marginTop: 4, display: 'block' }}>
          {label}
        </Text>
      ) : null}
    </div>
  );
}
