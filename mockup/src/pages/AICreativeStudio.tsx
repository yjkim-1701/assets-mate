import { Text, Button, Badge, TextArea, InlineAlert } from '@react-spectrum/s2';
import { AccentButton } from '../components/AccentButton';
import Image from '@react-spectrum/s2/icons/Image';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import Star from '@react-spectrum/s2/icons/Star';
import { useState } from 'react';
import { PageHeader, CM } from '../components/AppLayout';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};
const imageBox: React.CSSProperties = {
  flex: 1,
  height: 300,
  backgroundColor: CM.surfacePlaceholder,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const TABS = ['자연어 편집', 'Generative Fill', 'Generative Expand'];
const PROMPT_TEMPLATES: Record<string, string> = {
  '톤 변경': '전체적으로 더 따뜻한 톤으로 변경해줘',
  '배경 교체': '배경을 깔끔한 사무실로 변경해줘',
  '오브젝트 제거': '왼쪽 나무를 제거해줘',
  '스타일 변경': '좀 더 프로페셔널한 느낌으로 변경해줘',
  '구도 조정': '피사체를 중앙으로 이동해줘',
};

export default function AICreativeStudio() {
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [hasResult, setHasResult] = useState(false);

  return (
    <>
      <PageHeader title="AI Creative Studio" description="Firefly AI로 에셋을 자연어 기반으로 편집합니다" />
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

        <div style={card}>
          <div style={{ width: '100%' }}>
            <TextArea label="편집 명령 (자연어)" value={prompt} onChange={setPrompt}
              description='예: "배경을 더 따뜻한 톤으로 변경해줘", "왼쪽 나무 제거", "전체적으로 미니멀하게"' />
          </div>
          <div style={f({ gap: 8, marginTop: 12, flexWrap: 'wrap' })}>
            {Object.entries(PROMPT_TEMPLATES).map(([label, text]) => (
              <Button key={label} variant="secondary" size="S" onPress={() => setPrompt(text)}>
                {label}
              </Button>
            ))}
          </div>
          <div style={f({ justifyContent: 'flex-end', marginTop: 12 })}>
            <AccentButton isDisabled={!prompt} onPress={() => setHasResult(true)}>
              <MagicWand />
              <Text>AI 편집 실행</Text>
            </AccentButton>
          </div>
        </div>

        <div style={f({ gap: 24 })}>
          <div style={f({ flexDirection: 'column', gap: 8, flex: 1 })}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>원본</Text>
            <div style={{ ...imageBox, color: CM.textMuted }}>
              <span style={{ display: 'flex', width: 56, height: 56, opacity: 0.35 }}>
                <Image />
              </span>
            </div>
          </div>
          <div style={f({ flexDirection: 'column', gap: 8, flex: 1 })}>
            <div style={f({ justifyContent: 'center', gap: 8, alignItems: 'center' })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>수정본</Text>
              {hasResult && (
                <Badge variant="accent" size="S">
                  <MagicWand />
                  <Text>AI Generated</Text>
                </Badge>
              )}
            </div>
            <div style={hasResult ? { ...imageBox, border: `2px solid ${CM.accentViolet}` } : imageBox}>
              {hasResult ? (
                <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 8, color: CM.accentViolet })}>
                  <span style={{ display: 'flex', width: 40, height: 40, opacity: 0.85 }}>
                    <Star />
                  </span>
                  <Text UNSAFE_style={{ color: CM.accentViolet, fontWeight: 600 }}>AI 편집 완료</Text>
                </div>
              ) : (
                <Text UNSAFE_style={{ color: CM.textSecondary }}>편집 명령을 실행하면 결과가 여기에 표시됩니다</Text>
              )}
            </div>
          </div>
        </div>

        {hasResult && (
          <>
            <div style={card}>
              <div style={f({ gap: 8, alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>편집 이력:</Text>
                <Button variant="secondary" size="S">원본</Button>
                <Text>→</Text>
                <AccentButton size="S">톤 변경</AccentButton>
              </div>
            </div>

            <InlineAlert variant="informative">
              브랜드 가드레일: 색상 가이드 ✓ OK · 로고 규정 ✓ OK
            </InlineAlert>

            <div style={f({ gap: 12, justifyContent: 'flex-end' })}>
              <Button variant="secondary">되돌리기</Button>
              <Button variant="secondary">다른 후보 보기</Button>
              <AccentButton>적용 & 저장</AccentButton>
            </div>
          </>
        )}
      </div>
    </>
  );
}
