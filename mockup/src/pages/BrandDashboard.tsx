import type { ComponentType } from 'react';
import { Text, Badge, Meter } from '@react-spectrum/s2';
import Color from '@react-spectrum/s2/icons/Color';
import Logo from '@react-spectrum/s2/icons/Logo';
import TextIcon from '@react-spectrum/s2/icons/Text';
import Layout from '@react-spectrum/s2/icons/Layout';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { BRAND_VIOLATIONS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const CATEGORY_SCORES: { name: string; score: number; Icon: ComponentType }[] = [
  { name: '색상', score: 92, Icon: Color },
  { name: '로고', score: 88, Icon: Logo },
  { name: '폰트', score: 85, Icon: TextIcon },
  { name: '레이아웃', score: 81, Icon: Layout },
];

const LICENSES_EXPIRING = [
  { name: 'stock_lifestyle_01.jpg', daysLeft: 7, type: '스톡 이미지' },
  { name: 'model_portrait_02.jpg', daysLeft: 14, type: '모델 초상권' },
  { name: 'bg_texture_03.png', daysLeft: 30, type: '스톡 이미지' },
];

function SeverityBadge({ severity }: { severity: string }) {
  const variant = severity === 'high' ? 'negative' : severity === 'medium' ? 'notice' : 'informative';
  const label = severity === 'high' ? '높음' : severity === 'medium' ? '보통' : '낮음';
  return <Badge variant={variant} size="S">{label}</Badge>;
}

export default function BrandDashboard() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="브랜드 거버넌스" description="브랜드 일관성과 컴플라이언스 현황을 확인합니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={card}>
          <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 })}>
            <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold' }}>브랜드 건강도 종합 스코어</Text>
            <Text UNSAFE_style={{ fontSize: 36, fontWeight: 'bold', color: CM.success }}>87 / 100</Text>
          </div>
          <div style={f({ gap: 24, flexWrap: 'wrap' })}>
            {CATEGORY_SCORES.map(cat => {
              const CatIcon = cat.Icon;
              return (
              <div key={cat.name} style={{ flex: 1, minWidth: 140 }}>
                <div style={f({ gap: 8, alignItems: 'center', marginBottom: 8 })}>
                  <span style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CM.text }}>
                    <CatIcon />
                  </span>
                  <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</Text>
                </div>
                <Meter value={cat.score} label={`${cat.score}/100`}
                  variant={cat.score >= 90 ? 'positive' : cat.score >= 80 ? 'informative' : 'notice'} />
              </div>
            );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>위반 에셋 목록</Text>
              <Badge variant="negative" size="S">{BRAND_VIOLATIONS.length}건</Badge>
            </div>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              {BRAND_VIOLATIONS.map(v => (
                <div key={v.id} style={f({ justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: CM.dangerBg, borderRadius: 8 })}>
                  <div style={f({ flexDirection: 'column', gap: 4 })}>
                    <div style={f({ gap: 8, alignItems: 'center' })}>
                      <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{v.assetName}</Text>
                      <SeverityBadge severity={v.severity} />
                    </div>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{v.description}</Text>
                  </div>
                  <AccentButton size="S" onPress={() => navigate(`/ai/brand-fix/${v.assetId}`)}>
                    <MagicWand />
                    <Text>AI 수정</Text>
                  </AccentButton>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>만료 임박 라이선스</Text>
              <Badge variant="notice" size="S">{LICENSES_EXPIRING.length}건</Badge>
            </div>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              {LICENSES_EXPIRING.map((lic, i) => (
                <div key={i} style={f({ justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: CM.warningBg, borderRadius: 8 })}>
                  <div style={f({ flexDirection: 'column', gap: 2 })}>
                    <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{lic.name}</Text>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{lic.type}</Text>
                  </div>
                  <Badge variant={lic.daysLeft <= 7 ? 'negative' : 'notice'} size="S">
                    D-{lic.daysLeft}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>6개월 브랜드 스코어 추이</Text>
          <div style={f({ gap: 32, justifyContent: 'center', alignItems: 'flex-end', height: 120 })}>
            {[78, 82, 85, 83, 86, 87].map((val, i) => (
              <div key={i} style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
                <div style={{ width: 40, height: val, backgroundColor: val >= 85 ? CM.success : CM.warning, borderRadius: 4 }} />
                <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{['11월', '12월', '1월', '2월', '3월', '4월'][i]}</Text>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 'bold' }}>{val}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
