import { Text, Button, Checkbox } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { useState } from 'react';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { ASSETS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS = ['에셋 최적화', '배치 다운로드'];
const FORMAT_OPTIONS = ['WebP', 'AVIF', 'JPEG (최적화)', 'PNG (최적화)'];

export default function Optimization() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set(['a1', 'a4']));
  const [targetFormat, setTargetFormat] = useState('WebP');

  const toggle = (id: string) => {
    const next = new Set(selectedAssets);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedAssets(next);
  };

  return (
    <>
      <PageHeader title="에셋 최적화" description="에셋 포맷 변환, 품질 최적화, 배치 다운로드를 수행합니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8 })}>
          {TABS.map((tab, i) =>
            activeTab === i ? (
              <AccentButton key={tab} size="S" onPress={() => setActiveTab(i)}>
                {tab}
              </AccentButton>
            ) : (
              <Button key={tab} variant="secondary" size="S" onPress={() => setActiveTab(i)}>
                {tab}
              </Button>
            )
          )}
        </div>

        {activeTab === 0 && (
          <>
            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>대상 포맷 선택</Text>
              <div style={f({ gap: 8 })}>
                {FORMAT_OPTIONS.map(fmt =>
                  targetFormat === fmt ? (
                    <AccentButton key={fmt} size="S" onPress={() => setTargetFormat(fmt)}>
                      {fmt}
                    </AccentButton>
                  ) : (
                    <Button key={fmt} variant="secondary" size="S" onPress={() => setTargetFormat(fmt)}>
                      {fmt}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>에셋 선택</Text>
              <div style={f({ flexDirection: 'column' })}>
                {ASSETS.filter(a => a.type === 'image').map(asset => (
                  <div key={asset.id} style={{ padding: 12, borderBottom: `1px solid ${CM.cardBorder}` }}>
                    <div style={f({ gap: 12, alignItems: 'center' })}>
                      <Checkbox isSelected={selectedAssets.has(asset.id)} onChange={() => toggle(asset.id)} />
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: CM.surfacePlaceholder,
                        }}
                      >
                        <SampleAssetImage filename={asset.name} />
                      </div>
                      <Text UNSAFE_style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{asset.name}</Text>
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{asset.dim}</Text>
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{asset.size}</Text>
                      <MutedBadge variant="informative" size="S">{asset.type.toUpperCase()}</MutedBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAssets.size > 0 && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
                  최적화 예상 결과 ({selectedAssets.size}개 에셋 → {targetFormat})
                </Text>
                <div style={f({ flexDirection: 'column', gap: 8 })}>
                  <div style={f({ justifyContent: 'space-between' })}>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>원본 총 용량</Text>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>9.3 MB</Text>
                  </div>
                  <div style={f({ justifyContent: 'space-between' })}>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>최적화 후 예상</Text>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, color: CM.success }}>3.1 MB (-67%)</Text>
                  </div>
                </div>
                <div style={f({ justifyContent: 'flex-end', marginTop: 16 })}>
                  <AccentButton>⚡ 최적화 실행 ({selectedAssets.size}개)</AccentButton>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 1 && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>배치 다운로드</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, display: 'block', marginBottom: 16 }}>
              다수 에셋을 채널별 사양에 맞춰 일괄 다운로드합니다
            </Text>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              {['Instagram 피드 (1080×1080)', 'Facebook 피드 (1200×630)', 'YouTube 썸네일 (1280×720)', '원본 사이즈'].map(ch => (
                <Checkbox key={ch}>{ch}</Checkbox>
              ))}
            </div>
            <div style={f({ justifyContent: 'flex-end', marginTop: 16 })}>
              <AccentButton>📦 배치 다운로드</AccentButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
