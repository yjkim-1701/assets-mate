import { useMemo, useState } from 'react';
import { Text, Button, TextArea, ProgressBar } from '@react-spectrum/s2';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { MutedBadge } from '../components/MutedBadge';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { ASSETS, BRAND_CUSTOM_MODELS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const SEASONS = ['봄', '여름', '가을', '겨울'] as const;
const MOODS = ['밝은', '차분한', '역동적'] as const;

const VAR_FILTERS: React.CSSProperties[] = [
  { filter: 'saturate(1.2) hue-rotate(-15deg) brightness(1.06)' },
  { filter: 'saturate(1.15) sepia(0.12) contrast(1.05)' },
  { filter: 'saturate(1.08) hue-rotate(12deg) brightness(1.03)' },
  { filter: 'saturate(1.1) contrast(1.12) brightness(0.98)' },
];

export default function BrandVariations() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const asset = useMemo(() => ASSETS.find(a => a.id === assetId) ?? ASSETS[0], [assetId]);
  const readyModels = useMemo(() => BRAND_CUSTOM_MODELS.filter(m => m.status === 'ready'), []);

  const [season, setSeason] = useState<typeof SEASONS[number] | null>('여름');
  const [mood, setMood] = useState<typeof MOODS[number] | null>('밝은');
  const [bgChange, setBgChange] = useState(false);
  const [prompt, setPrompt] = useState('여름 시즌 해변 버전으로, 브랜드 블루는 유지해줘');
  const [modelId, setModelId] = useState(() => readyModels.find(m => m.isDefault)?.id ?? readyModels[0]?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<{ id: string; brandScore: number; pass: boolean }[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const runGenerate = () => {
    setLoading(true);
    setProgress(0);
    setCandidates(null);
    setPicked(null);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((Date.now() - t0) / 3200) * 100)));
    }, 100);
    window.setTimeout(() => {
      window.clearInterval(id);
      setProgress(100);
      setLoading(false);
      setCandidates([
        { id: 'v1', brandScore: 88, pass: true },
        { id: 'v2', brandScore: 91, pass: true },
        { id: 'v3', brandScore: 76, pass: false },
        { id: 'v4', brandScore: 86, pass: true },
      ]);
    }, 3200);
  };

  return (
    <>
      <PageHeader
        title="브랜드 변형 생성"
        description="원본 에셋을 기반으로 시즌·무드·배경 변형 후보를 생성하고, 브랜드 검사 후 저장합니다"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={card}>
          <div style={f({ gap: 16, alignItems: 'center', flexWrap: 'wrap' })}>
            <div style={{ width: 96, height: 96, borderRadius: 10, overflow: 'hidden', backgroundColor: CM.surfacePlaceholder }}>
              <SampleAssetImage filename={asset.name} />
            </div>
            <div style={f({ flexDirection: 'column', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>{asset.name}</Text>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
                {asset.dim} · {asset.campaign} · 원본 ID {asset.id}
              </Text>
              <Button variant="secondary" size="S" onPress={() => navigate('/search')}>
                다른 에셋으로
              </Button>
            </div>
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>변형 유형</Text>
          <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 12 })}>
            <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, color: CM.textSecondary }}>시즌</Text>
            {SEASONS.map(s => (
              <Button key={s} variant={season === s ? 'accent' : 'secondary'} size="S" onPress={() => setSeason(s)}>
                {s}
              </Button>
            ))}
          </div>
          <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 12 })}>
            <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, color: CM.textSecondary }}>무드</Text>
            {MOODS.map(m => (
              <Button key={m} variant={mood === m ? 'accent' : 'secondary'} size="S" onPress={() => setMood(m)}>
                {m}
              </Button>
            ))}
          </div>
          <div style={f({ gap: 8, alignItems: 'center' })}>
            <Button variant={bgChange ? 'accent' : 'secondary'} size="S" onPress={() => setBgChange(!bgChange)}>
              배경 변경 포함
            </Button>
          </div>
        </div>

        <div style={card}>
          <TextArea label="변형 방향 (자연어)" value={prompt} onChange={setPrompt} />
          <div style={f({ gap: 10, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' })}>
            <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>Custom Model</Text>
            <select
              value={modelId}
              onChange={e => setModelId(e.target.value)}
              style={{
                fontSize: 13,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${CM.cardBorder}`,
                minWidth: 220,
              }}
            >
              {readyModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <MutedBadge tone="neutral" size="S">브랜드 변형</MutedBadge>
          </div>
          <div style={{ marginTop: 16 }}>
            <AccentButton isDisabled={loading || !prompt.trim()} onPress={runGenerate}>
              변형 4종 생성
            </AccentButton>
          </div>
          {loading && (
            <div style={{ marginTop: 16 }}>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 8 }}>
                생성 요청 처리 중 — Custom Model 적용
              </Text>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>

        {candidates && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
              변형 후보 (자동 브랜드 검사)
            </Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
              {candidates.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPicked(c.id)}
                  style={{
                    margin: 0,
                    padding: 10,
                    borderRadius: 10,
                    border: picked === c.id ? `2px solid ${CM.primaryBlue}` : `1px solid ${CM.cardBorder}`,
                    background: CM.mainBg,
                    cursor: 'pointer',
                    textAlign: 'left' as const,
                  }}
                >
                  <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 8, aspectRatio: '4/3' }}>
                    <SampleAssetImage filename={asset.name} style={VAR_FILTERS[i % VAR_FILTERS.length]} />
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>후보 {i + 1}</Text>
                  <div style={f({ gap: 6, marginTop: 6, flexWrap: 'wrap' })}>
                    <MutedBadge tone={c.pass ? 'success' : 'warning'} size="S">
                      브랜드 {c.brandScore}점
                    </MutedBadge>
                    <MutedBadge tone={c.pass ? 'success' : 'danger'} size="S">
                      {c.pass ? '검사 통과' : '검사 주의'}
                    </MutedBadge>
                  </div>
                </button>
              ))}
            </div>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, marginTop: 12, display: 'block' }}>
              저장 시 원본 에셋과 변형 에셋의 관계가 자동으로 기록됩니다.
            </Text>
            <div style={f({ justifyContent: 'flex-end', gap: 8, marginTop: 16 })}>
              <Button variant="secondary" onPress={() => { setCandidates(null); setPicked(null); }}>
                다시 생성
              </Button>
              <AccentButton isDisabled={!picked}>선택 변형 저장</AccentButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
