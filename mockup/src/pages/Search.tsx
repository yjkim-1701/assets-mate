import { Text, SearchField, Button, Badge, Checkbox, TagGroup, Tag } from '@react-spectrum/s2';
import Image from '@react-spectrum/s2/icons/Image';
import Video from '@react-spectrum/s2/icons/Video';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { ASSETS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 16,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 80 ? 'positive' : score >= 60 ? 'notice' : 'negative';
  return <Badge variant={variant} size="S">{score}</Badge>;
}

const TABS = ['통합 검색', '비주얼 검색', '색상 검색', '시맨틱 검색'];

export default function Search() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const filtered = ASSETS.filter(a =>
    !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.campaign.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageHeader title="검색 & 탐색" description="AI 기반 비주얼 검색, 시맨틱 검색, 색상 검색으로 에셋을 빠르게 찾습니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8 })}>
          {TABS.map((tab, i) => (
            <Button key={tab} variant={activeTab === i ? 'accent' : 'secondary'} size="S" onPress={() => setActiveTab(i)}>
              {tab}
            </Button>
          ))}
        </div>

        <div style={{ width: '100%' }}>
          <SearchField label="에셋 검색" value={query} onChange={setQuery} />
        </div>

        {query && (
          <TagGroup label="적용된 필터">
            <Tag id="q">검색어: {query}</Tag>
          </TagGroup>
        )}

        <div style={f({ gap: 20 })}>
          <div style={{ ...card, width: 240, flexShrink: 0 }}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>필터</Text>
            <div style={f({ flexDirection: 'column', gap: 16 })}>
              <div>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>캠페인</Text>
                <div style={f({ flexDirection: 'column', gap: 4 })}>
                  <Checkbox>2026 Summer</Checkbox>
                  <Checkbox>Brand Refresh</Checkbox>
                  <Checkbox>Q2 Newsletter</Checkbox>
                </div>
              </div>
              <div>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>에셋 유형</Text>
                <div style={f({ flexDirection: 'column', gap: 4 })}>
                  <Checkbox defaultSelected>이미지</Checkbox>
                  <Checkbox>비디오</Checkbox>
                  <Checkbox>문서</Checkbox>
                </div>
              </div>
              <div>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>브랜드 상태</Text>
                <div style={f({ flexDirection: 'column', gap: 4 })}>
                  <Checkbox>승인됨</Checkbox>
                  <Checkbox>리뷰 중</Checkbox>
                  <Checkbox>위반</Checkbox>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
              <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary }}>{filtered.length}개 에셋</Text>
              <div style={f({ gap: 8 })}>
                <Button variant="secondary" size="S">그리드</Button>
                <Button variant="secondary" size="S">리스트</Button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {filtered.map(asset => (
                <div key={asset.id} style={{ ...card, padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/assets/${asset.id}`)}>
                  <div style={{ width: '100%', height: 160, backgroundColor: CM.surfacePlaceholder, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CM.textMuted }}>
                    <span style={{ display: 'flex', width: 44, height: 44, opacity: 0.4 }}>
                      {asset.type === 'video' ? <Video /> : <Image />}
                    </span>
                  </div>
                  <div style={{ padding: 12 }}>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{asset.name}</Text>
                    <div style={f({ justifyContent: 'space-between', alignItems: 'center' })}>
                      <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{asset.dim} · {asset.size}</Text>
                      <ScoreBadge score={asset.brandScore} />
                    </div>
                    <div style={f({ marginTop: 4, gap: 4 })}>
                      <Badge size="S" variant="informative">{asset.campaign}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
