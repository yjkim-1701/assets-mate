import { Text, Button, Badge, ProgressBar } from '@react-spectrum/s2';
import { useState } from 'react';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { CAMPAIGNS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  cursor: 'pointer',
  boxShadow: CM.cardShadow,
};

const TABS = ['캠페인 워크스페이스', '리뷰 & 승인', '승인 현황'];

const REVIEWS = [
  { id: 'r1', asset: 'summer_banner_v3.png', reviewer: 'Kim', status: 'pending', submitted: '2시간 전' },
  { id: 'r2', asset: 'social_post_agency.jpg', reviewer: 'Park (Agency)', status: 'changes', submitted: '5시간 전' },
  { id: 'r3', asset: 'email_header_final.png', reviewer: 'Lee', status: 'approved', submitted: '1일 전' },
  { id: 'r4', asset: 'product_shot_01.jpg', reviewer: 'Choi (Agency)', status: 'pending', submitted: '2일 전' },
];

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <PageHeader title="협업 & 승인" description="캠페인 워크스페이스와 에셋 리뷰/승인을 관리합니다" />
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
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            {CAMPAIGNS.map(c => (
              <div key={c.id} style={card}>
                <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
                  <div style={f({ gap: 12, alignItems: 'center' })}>
                    <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold' }}>{c.name}</Text>
                    <Badge variant={c.status === 'active' ? 'positive' : 'informative'} size="S">
                      {c.status === 'active' ? '진행 중' : '완료'}
                    </Badge>
                  </div>
                  <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>{c.assets}개 에셋 · {c.pending}건 대기</Text>
                </div>
                <ProgressBar value={c.progress} label={`진행률 ${c.progress}%`} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div style={f({ flexDirection: 'column', gap: 12 })}>
            <div style={f({ gap: 8 })}>
              <Button variant="secondary" size="S">전체</Button>
              <Button variant="secondary" size="S">대기 중 (2)</Button>
              <Button variant="secondary" size="S">수정요청 (1)</Button>
              <Button variant="secondary" size="S">승인 (1)</Button>
            </div>
            {REVIEWS.map(r => (
              <div key={r.id} style={{ ...card, cursor: 'default', padding: 16 }}>
                <div style={f({ gap: 16, alignItems: 'center' })}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: CM.surfacePlaceholder,
                    }}
                  >
                    <SampleAssetImage filename={r.asset} />
                  </div>
                  <div style={f({ flexDirection: 'column', gap: 4, flex: 1 })}>
                    <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>{r.asset}</Text>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>리뷰어: {r.reviewer} · {r.submitted}</Text>
                  </div>
                  <Badge variant={r.status === 'approved' ? 'positive' : r.status === 'changes' ? 'notice' : 'informative'} size="S">
                    {r.status === 'approved' ? '승인' : r.status === 'changes' ? '수정요청' : '대기'}
                  </Badge>
                  <div style={f({ gap: 8 })}>
                    <Button variant="secondary" size="S">리뷰</Button>
                    {r.status === 'pending' && <AccentButton size="S">승인</AccentButton>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { label: '전체 대기', count: 12, color: CM.accentIndigo },
              { label: '승인 완료', count: 45, color: CM.success },
              { label: '수정 요청', count: 5, color: CM.warning },
              { label: '거절', count: 2, color: CM.danger },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: CM.activeNav, borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <Text UNSAFE_style={{ fontSize: 32, fontWeight: 'bold', color: stat.color, display: 'block' }}>{stat.count}</Text>
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>{stat.label}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
