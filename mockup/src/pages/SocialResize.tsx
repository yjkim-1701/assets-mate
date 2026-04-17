import { Text, Button, Badge, Checkbox } from '@react-spectrum/s2';
import Image from '@react-spectrum/s2/icons/Image';
import Camera from '@react-spectrum/s2/icons/Camera';
import User from '@react-spectrum/s2/icons/User';
import Video from '@react-spectrum/s2/icons/Video';
import Briefcase from '@react-spectrum/s2/icons/Briefcase';
import Link from '@react-spectrum/s2/icons/Link';
import { useState } from 'react';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SOCIAL_CHANNELS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const glyphWrap: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  marginRight: 8,
  flexShrink: 0,
  color: CM.textSecondary,
};

function ChannelGlyph({ id }: { id: string }) {
  if (id.startsWith('ig-')) {
    return (
      <span style={glyphWrap}>
        <Camera />
      </span>
    );
  }
  if (id.startsWith('fb-')) {
    return (
      <span style={glyphWrap}>
        <User />
      </span>
    );
  }
  if (id.startsWith('yt-')) {
    return (
      <span style={glyphWrap}>
        <Video />
      </span>
    );
  }
  if (id.startsWith('li-')) {
    return (
      <span style={glyphWrap}>
        <Briefcase />
      </span>
    );
  }
  return (
    <span style={glyphWrap}>
      <Link />
    </span>
  );
}

export default function SocialResize() {
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['ig-feed', 'ig-story', 'fb-feed', 'yt-thumb']));

  const toggle = (id: string) => {
    const next = new Set(selectedChannels);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedChannels(next);
  };

  const selectAll = () => {
    if (selectedChannels.size === SOCIAL_CHANNELS.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(SOCIAL_CHANNELS.map(c => c.id)));
    }
  };

  const selected = SOCIAL_CHANNELS.filter(c => selectedChannels.has(c.id));

  return (
    <>
      <PageHeader title="소셜 리사이즈" description="원본 에셋을 소셜 채널별 사이즈로 원클릭 리사이즈합니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={card}>
          <div style={f({ gap: 16, alignItems: 'center' })}>
            <div style={{ width: 80, height: 80, backgroundColor: CM.surfacePlaceholder, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CM.textMuted }}>
              <span style={{ display: 'flex', width: 40, height: 40, opacity: 0.45 }}>
                <Image />
              </span>
            </div>
            <div style={f({ flexDirection: 'column', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>campaign_summer_hero.jpg</Text>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>3840×2160 · 4.2 MB · 2026 Summer Campaign</Text>
              <Badge variant="positive" size="S">브랜드 스코어: 92</Badge>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>채널 선택</Text>
            <Button variant="secondary" size="S" onPress={selectAll}>
              {selectedChannels.size === SOCIAL_CHANNELS.length ? '전체 해제' : '전체 선택'}
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {SOCIAL_CHANNELS.map(ch => (
              <Checkbox key={ch.id} isSelected={selectedChannels.has(ch.id)} onChange={() => toggle(ch.id)}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ChannelGlyph id={ch.id} />
                  {ch.name} ({ch.width}×{ch.height})
                </span>
              </Checkbox>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>프리뷰 ({selected.length}개 채널)</Text>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {selected.map(ch => {
                const ratio = ch.width / ch.height;
                const previewW = 200;
                const previewH = Math.min(previewW / ratio, 280);
                const needsExpand = ch.height / ch.width > 1.5;
                return (
                  <div key={ch.id} style={f({ flexDirection: 'column', gap: 8 })}>
                    <div style={{ width: previewW, height: previewH, backgroundColor: CM.surfacePlaceholder, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: CM.textMuted }}>
                      <span style={{ display: 'flex', width: 36, height: 36, opacity: 0.35 }}>
                        <Image />
                      </span>
                      {needsExpand && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                          <Badge variant="accent" size="S">AI Expand</Badge>
                        </div>
                      )}
                    </div>
                    <div style={f({ flexDirection: 'column', gap: 2, alignItems: 'center' })}>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <ChannelGlyph id={ch.id} />
                          {ch.name}
                        </span>
                      </Text>
                      <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{ch.width}×{ch.height}</Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={f({ gap: 12, justifyContent: 'flex-end' })}>
              <Button variant="secondary">프리뷰 확인</Button>
              <AccentButton>일괄 생성 & 저장 ({selected.length}개)</AccentButton>
            </div>
          </>
        )}
      </div>
    </>
  );
}
