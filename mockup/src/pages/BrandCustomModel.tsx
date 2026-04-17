import { useState } from 'react';
import { Text, Button, ProgressBar, InlineAlert } from '@react-spectrum/s2';
import { PageHeader, CM } from '../components/AppLayout';
import { MutedBadge } from '../components/MutedBadge';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { BRAND_CUSTOM_MODELS, ASSETS, type BrandCustomModel } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const MODEL_TYPE_LABEL = { photography: 'Photography Style', illustration: 'Illustration Style' } as const;

function statusBadge(m: BrandCustomModel) {
  if (m.status === 'ready') return <MutedBadge tone="success" size="S">학습 완료</MutedBadge>;
  if (m.status === 'training') return <MutedBadge tone="accent" size="S">학습 중</MutedBadge>;
  return <MutedBadge tone="neutral" size="S">비활성</MutedBadge>;
}

export default function BrandCustomModel() {
  const [models, setModels] = useState<BrandCustomModel[]>(() => [...BRAND_CUSTOM_MODELS]);
  const [defaultId, setDefaultId] = useState(() => BRAND_CUSTOM_MODELS.find(m => m.isDefault)?.id ?? 'cm-1');
  const [trainType, setTrainType] = useState<'photography' | 'illustration'>('photography');
  const [assetCount, setAssetCount] = useState(18);
  const [trainingJob, setTrainingJob] = useState<{ progress: number; eta: number } | null>(null);
  const [compareLeft, setCompareLeft] = useState<'base' | 'custom'>('base');
  const [compareRight, setCompareRight] = useState<'base' | 'custom'>('custom');

  const defaultModel = models.find(m => m.id === defaultId);

  const startTraining = () => {
    setTrainingJob({ progress: 0, eta: 55 });
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Date.now() - t0;
      const progress = Math.min(100, Math.round((elapsed / 8000) * 100));
      const eta = Math.max(0, Math.round((1 - progress / 100) * 55));
      setTrainingJob({ progress, eta });
      if (progress >= 100) {
        window.clearInterval(id);
        const newId = `cm-${Date.now()}`;
        setModels(prev => [
          ...prev,
          {
            id: newId,
            name: `Custom ${trainType === 'photography' ? 'Photo' : 'Illust'} · 새 모델`,
            modelType: trainType,
            status: 'ready',
            assetCount,
            trainedAt: new Date().toISOString().slice(0, 10),
            isDefault: false,
          },
        ]);
        setTrainingJob(null);
      }
    }, 200);
  };

  const toggleActive = (id: string) => {
    setModels(prev =>
      prev.map(m => (m.id === id ? { ...m, status: m.status === 'disabled' ? 'ready' : 'disabled' } : m))
    );
  };

  const setAsDefault = (id: string) => {
    setDefaultId(id);
    setModels(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  return (
    <>
      <PageHeader
        title="브랜드 Custom Model"
        description="브랜드 대표 에셋으로 Firefly 커스텀 모델을 학습·관리하고, AI 편집/생성 시 기본 스타일로 적용합니다"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <InlineAlert variant="informative">
          <Text>
            AEM Assets에서 10–30개 에셋을 선택한 뒤 학습을 실행합니다. 아래는 목업 진행률·예상 시간입니다.
          </Text>
        </InlineAlert>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
              새 모델 학습
            </Text>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              <div>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>모델 유형</Text>
                <div style={f({ gap: 8 })}>
                  <Button
                    variant={trainType === 'photography' ? 'accent' : 'secondary'}
                    size="S"
                    onPress={() => setTrainType('photography')}
                  >
                    {MODEL_TYPE_LABEL.photography}
                  </Button>
                  <Button
                    variant={trainType === 'illustration' ? 'accent' : 'secondary'}
                    size="S"
                    onPress={() => setTrainType('illustration')}
                  >
                    {MODEL_TYPE_LABEL.illustration}
                  </Button>
                </div>
              </div>
              <div>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  학습 데이터 (에셋 개수 {assetCount}개)
                </Text>
                <input
                  type="range"
                  min={10}
                  max={30}
                  value={assetCount}
                  onChange={e => setAssetCount(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, marginTop: 4, display: 'block' }}>
                  미리보기: 선택된 대표 에셋 썸네일 (목업)
                </Text>
                <div style={f({ gap: 8, marginTop: 8, flexWrap: 'wrap' })}>
                  {ASSETS.slice(0, 5).map(a => (
                    <div
                      key={a.id}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: `2px solid ${CM.cardBorder}`,
                      }}
                    >
                      <SampleAssetImage filename={a.name} />
                    </div>
                  ))}
                </div>
              </div>
              {trainingJob ? (
                <div>
                  <Text UNSAFE_style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                    학습 진행 중… 예상 약 {trainingJob.eta}분 남음
                  </Text>
                  <ProgressBar label="학습 진행률" value={trainingJob.progress} />
                </div>
              ) : (
                <AccentButton onPress={startTraining}>Firefly Custom Models로 학습 시작</AccentButton>
              )}
            </div>
          </div>

          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
              기본 모델 (AI 편집/생성 시)
            </Text>
            {defaultModel ? (
              <div style={f({ flexDirection: 'column', gap: 8 })}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 600 }}>{defaultModel.name}</Text>
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
                  {MODEL_TYPE_LABEL[defaultModel.modelType]} · 에셋 {defaultModel.assetCount}개 학습
                </Text>
                {defaultModel.trainedAt && (
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>학습 완료: {defaultModel.trainedAt}</Text>
                )}
              </div>
            ) : (
              <Text UNSAFE_style={{ color: CM.textSecondary }}>기본 모델이 없습니다.</Text>
            )}
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
            학습된 모델 목록
          </Text>
          <div style={f({ flexDirection: 'column', gap: 12 })}>
            {models.map(m => (
              <div
                key={m.id}
                style={f({
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  backgroundColor: CM.mainBg,
                  borderRadius: 10,
                  border: `1px solid ${CM.cardBorder}`,
                  flexWrap: 'wrap',
                  gap: 12,
                })}
              >
                <div style={f({ flexDirection: 'column', gap: 4 })}>
                  <div style={f({ gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                    <Text UNSAFE_style={{ fontWeight: 700 }}>{m.name}</Text>
                    {statusBadge(m)}
                    {m.isDefault && (
                      <MutedBadge tone="success" size="S">기본</MutedBadge>
                    )}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                    {MODEL_TYPE_LABEL[m.modelType]} · 샘플 {m.assetCount}개
                    {m.trainedAt ? ` · 완료 ${m.trainedAt}` : ''}
                  </Text>
                  {m.status === 'training' && m.progress != null && (
                    <div style={{ maxWidth: 320, marginTop: 8 }}>
                      <ProgressBar label="진행률" value={m.progress} />
                      <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 4 }}>
                        예상 {m.etaMinutes}분 남음 (목업)
                      </Text>
                    </div>
                  )}
                </div>
                <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                  {m.status === 'ready' && (
                    <>
                      <Button variant="secondary" size="S" onPress={() => setAsDefault(m.id)} isDisabled={m.isDefault}>
                        기본으로 설정
                      </Button>
                      <Button variant="secondary" size="S" onPress={() => toggleActive(m.id)}>
                        비활성화
                      </Button>
                    </>
                  )}
                  {m.status === 'disabled' && (
                    <Button variant="secondary" size="S" onPress={() => toggleActive(m.id)}>
                      활성화
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
            결과 비교 (기본 Firefly vs Custom Model)
          </Text>
          <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, marginBottom: 16, display: 'block' }}>
            동일 프롬프트로 생성 시 브랜드 톤 유지 정도를 비교합니다 (목업 시각).
          </Text>
          <div style={f({ gap: 16, alignItems: 'stretch', flexWrap: 'wrap' })}>
            <div style={f({ flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 })}>
              <div style={f({ gap: 8 })}>
                <Button size="S" variant={compareLeft === 'base' ? 'accent' : 'secondary'} onPress={() => setCompareLeft('base')}>
                  기본
                </Button>
                <Button size="S" variant={compareLeft === 'custom' ? 'accent' : 'secondary'} onPress={() => setCompareLeft('custom')}>
                  Custom
                </Button>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 160,
                  borderRadius: 12,
                  backgroundColor: compareLeft === 'custom' ? '#EEF2FF' : '#F1F5F9',
                  border: `1px solid ${CM.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}
              >
                <SampleAssetImage filename={ASSETS[0].name} />
              </div>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, textAlign: 'center' }}>
                {compareLeft === 'custom' ? '브랜드 톤에 더 근접 (목업)' : '일반 Firefly 스타일'}
              </Text>
            </div>
            <div style={f({ flexDirection: 'column', gap: 8, flex: 1, minWidth: 200 })}>
              <div style={f({ gap: 8 })}>
                <Button size="S" variant={compareRight === 'base' ? 'accent' : 'secondary'} onPress={() => setCompareRight('base')}>
                  기본
                </Button>
                <Button size="S" variant={compareRight === 'custom' ? 'accent' : 'secondary'} onPress={() => setCompareRight('custom')}>
                  Custom
                </Button>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 160,
                  borderRadius: 12,
                  backgroundColor: compareRight === 'custom' ? '#EEF2FF' : '#F1F5F9',
                  border: `1px solid ${CM.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}
              >
                <SampleAssetImage filename={ASSETS[0].name} />
              </div>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, textAlign: 'center' }}>
                {compareRight === 'custom' ? '브랜드 톤에 더 근접 (목업)' : '일반 Firefly 스타일'}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
