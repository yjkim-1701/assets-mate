import { useState } from 'react';
import { Text, Button, TextField, ProgressBar } from '@react-spectrum/s2';
import { MutedBadge } from './MutedBadge';
import { AccentButton } from './AccentButton';
import { CM } from './AppLayout';
import { SampleAssetImage } from './SampleAssetImage';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const PRESETS = [
  { label: 'Instagram 스토리 9:16', w: 1080, h: 1920 },
  { label: 'YouTube Shorts 9:16', w: 1080, h: 1920 },
  { label: 'LinkedIn 세로 카드', w: 1080, h: 1350 },
];

type Dir = 'top' | 'right' | 'bottom' | 'left';

export function GenerativeExpandPanel({ assetFilename }: { assetFilename: string }) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [dirs, setDirs] = useState<Set<Dir>>(new Set(['top', 'bottom']));
  const [expandPrompt, setExpandPrompt] = useState('같은 배경 톤과 질감으로 자연스럽게 확장해줘');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [applied, setApplied] = useState(false);

  const toggleDir = (d: Dir) => {
    setDirs(prev => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  const selectAllDirs = () => {
    setDirs(new Set(['top', 'right', 'bottom', 'left']));
  };

  const runExpand = () => {
    setLoading(true);
    setProgress(0);
    setApplied(false);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((Date.now() - t0) / 2000) * 100)));
    }, 80);
    window.setTimeout(() => {
      window.clearInterval(id);
      setProgress(100);
      setLoading(false);
      setApplied(true);
    }, 2000);
  };

  const p = PRESETS[presetIdx]!;

  return (
    <div style={f({ flexDirection: 'column', gap: 16 })}>
      <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, lineHeight: 1.5 }}>
        1:1 등 원본 비율에서 세로·가로 타깃으로 맞출 때 부족한 영역을 AI로 확장합니다. 원본 영역은 테두리로 구분합니다 (목업).
      </Text>

      <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>타깃 프리셋</Text>
        {PRESETS.map((pr, i) => (
          <Button key={pr.label} variant={presetIdx === i ? 'accent' : 'secondary'} size="S" onPress={() => setPresetIdx(i)}>
            {pr.label}
          </Button>
        ))}
      </div>

      <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>확장 방향</Text>
        {(['top', 'right', 'bottom', 'left'] as const).map(d => (
          <Button key={d} variant={dirs.has(d) ? 'accent' : 'secondary'} size="S" onPress={() => toggleDir(d)}>
            {d === 'top' ? '상' : d === 'bottom' ? '하' : d === 'left' ? '좌' : '우'}
          </Button>
        ))}
        <Button variant="secondary" size="S" onPress={selectAllDirs}>
          전체
        </Button>
        <MutedBadge tone="neutral" size="S">
          {p.w}×{p.h}
        </MutedBadge>
      </div>

      <TextField label="확장 영역 프롬프트" value={expandPrompt} onChange={setExpandPrompt} />

      <AccentButton isDisabled={loading || dirs.size === 0} onPress={runExpand}>
        Expand 생성 (프리뷰)
      </AccentButton>
      {loading && (
        <div>
          <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 8 }}>Expand Image API 처리 중… (목업)</Text>
          <ProgressBar value={progress} />
        </div>
      )}

      <div style={card}>
        <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>프리뷰</Text>
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 360,
            margin: '0 auto',
            aspectRatio: `${p.w} / ${p.h}`,
            borderRadius: 12,
            overflow: 'hidden',
            border: `1px solid ${CM.cardBorder}`,
            background: 'linear-gradient(180deg, #BFDBFE 0%, #E0E7FF 50%, #C7D2FE 100%)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '62%',
              height: '62%',
              border: `3px solid ${applied ? '#059669' : '#2563EB'}`,
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: applied ? '0 0 0 4px rgba(5,150,105,0.2)' : 'none',
              boxSizing: 'border-box',
            }}
          >
            <SampleAssetImage filename={assetFilename} />
          </div>
          {applied && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                right: 8,
                fontSize: 11,
                fontWeight: 600,
                color: '#0f172a',
                background: 'rgba(255,255,255,0.88)',
                padding: '6px 10px',
                borderRadius: 6,
                textAlign: 'center',
              }}
            >
              파란 영역 = AI 확장 · 안쪽 테두리 = 원본 비율 유지 구역
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
