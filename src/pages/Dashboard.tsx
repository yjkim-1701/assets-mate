import type { ComponentType } from 'react';
import { Text, Button } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { MutedMeter } from '../components/MutedMeter';
import { MutedProgressBar } from '../components/MutedProgressBar';
import Search from '@react-spectrum/s2/icons/Search';
import Brand from '@react-spectrum/s2/icons/Brand';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import ImageBackgroundRemove from '@react-spectrum/s2/icons/ImageBackgroundRemove';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import DevicePhone from '@react-spectrum/s2/icons/DevicePhone';
import Send from '@react-spectrum/s2/icons/Send';
import Eyedropper from '@react-spectrum/s2/icons/Eyedropper';
import Logo from '@react-spectrum/s2/icons/Logo';
import FontPicker from '@react-spectrum/s2/icons/FontPicker';
import LayoutIcon from '@react-spectrum/s2/icons/Layout';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { CAMPAIGNS, AI_FIX_INBOX } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const panel: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 10,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const MODULES: {
  title: string;
  description: string;
  Icon: ComponentType;
  to: string;
  accent: string;
}[] = [
  {
    title: 'Advanced Search',
    description: '비주얼·시맨틱 검색으로 에셋을 빠르게 찾습니다.',
    Icon: Search,
    to: '/search',
    accent: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)',
  },
  {
    title: 'Brand Dashboard',
    description: '브랜드 일관성·라이선스·위반 현황을 한눈에 봅니다.',
    Icon: Brand,
    to: '/brand',
    accent: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
  },
  {
    title: 'AI Creative',
    description: 'Firefly 기반 편집, Inbox 승인, 브랜드 자동 보정.',
    Icon: MagicWand,
    to: '/ai/inbox',
    accent: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 100%)',
  },
  {
    title: 'Campaign Workspace',
    description: '캠페인별 에셋·리뷰·승인 워크플로를 관리합니다.',
    Icon: UserGroup,
    to: '/collaboration',
    accent: 'linear-gradient(135deg, #FFEDD5 0%, #FFF7ED 100%)',
  },
  {
    title: 'Social Media',
    description: '채널별 리사이즈·프리뷰·일괄 내보내기.',
    Icon: SocialNetwork,
    to: '/social/resize',
    accent: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
  },
  {
    title: 'Asset Optimization',
    description: '포맷 변환·용량 최적화·배치 다운로드.',
    Icon: ImageBackgroundRemove,
    to: '/optimize',
    accent: 'linear-gradient(135deg, #CFFAFE 0%, #ECFEFF 100%)',
  },
];

const BRAND_HEALTH_METRICS: { name: string; score: number; Icon: ComponentType }[] = [
  { name: '색상', score: 92, Icon: Eyedropper },
  { name: '로고', score: 88, Icon: Logo },
  { name: '폰트', score: 85, Icon: FontPicker },
  { name: '레이아웃', score: 81, Icon: LayoutIcon },
];

function StatCard({ label, value, accent, change }: { label: string; value: string | number; accent?: string; change?: string }) {
  return (
    <div style={{ ...panel, flex: 1, minWidth: 160, padding: 16 }}>
      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', fontWeight: 500 }}>{label}</Text>
      <Text UNSAFE_style={{ fontSize: 28, fontWeight: 700, color: accent || CM.text, display: 'block', marginTop: 4, letterSpacing: '-0.02em' }}>
        {value}
      </Text>
      {change && <Text UNSAFE_style={{ fontSize: 12, color: CM.success, display: 'block', marginTop: 4 }}>{change}</Text>}
    </div>
  );
}

const RECENT_ACTIVITIES: { Icon: ComponentType; text: string; time: string }[] = [
  { Icon: CheckmarkCircle, text: 'campaign_summer_hero.jpg 승인 완료', time: '10분 전' },
  { Icon: MagicWand, text: 'promo_banner_v2.png AI 수정 완료 → Inbox 대기', time: '30분 전' },
  { Icon: DevicePhone, text: '소셜 리사이즈 5개 채널 완료', time: '1시간 전' },
  { Icon: Brand, text: 'infographic_stats.png 브랜드 위반 감지', time: '2시간 전' },
  { Icon: Send, text: 'Instagram 피드 게시 예약됨 (04/20)', time: '3시간 전' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const pendingFixes = AI_FIX_INBOX.filter(f => f.status === 'pending').length;

  return (
    <>
      <PageHeader title="대시보드" description="Assets Mate에서 에셋 검색부터 배포까지 한 곳에서 관리합니다." />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: CM.textSecondary, display: 'block', marginBottom: 12 }}>
            빠른 시작
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {MODULES.map(m => {
              const ModuleIcon = m.Icon;
              return (
              <button
                key={m.to}
                type="button"
                onClick={() => navigate(m.to)}
                style={{
                  ...panel,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: 20,
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                  font: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = CM.cardBorderHover;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = CM.cardShadow;
                  e.currentTarget.style.borderColor = CM.cardBorder;
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: m.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1E3A8A',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                  }}
                >
                  <span style={{ display: 'flex', width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                    <ModuleIcon />
                  </span>
                </div>
                <Text UNSAFE_style={{ fontSize: 16, fontWeight: 700, color: CM.text, display: 'block' }}>{m.title}</Text>
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, lineHeight: 1.45, display: 'block' }}>{m.description}</Text>
              </button>
            );
            })}
          </div>
        </div>

        <div style={f({ gap: 16, flexWrap: 'wrap' })}>
          <StatCard label="전체 에셋" value="1,247" change="▲ 23 이번 주" />
          <StatCard label="승인 대기" value={12} accent={CM.warning} />
          <StatCard label="AI 수정 대기" value={pendingFixes} accent={CM.accentIndigo} />
          <StatCard label="만료 임박" value={3} accent={CM.danger} />
          <StatCard label="예정 배포" value={5} accent={CM.primaryBlue} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={panel}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, color: CM.text }}>캠페인 진행 현황</Text>
              <Button variant="secondary" size="S" onPress={() => navigate('/collaboration')}>
                전체 보기
              </Button>
            </div>
            <div style={f({ flexDirection: 'column', gap: 16 })}>
              {CAMPAIGNS.filter(c => c.status === 'active').map(c => (
                <div key={c.id}>
                  <div style={f({ justifyContent: 'space-between', marginBottom: 6 })}>
                    <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</Text>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                      {c.assets}개 에셋 · {c.pending}건 대기
                    </Text>
                  </div>
                  <MutedProgressBar value={c.progress} label={`${c.progress}%`} />
                </div>
              ))}
            </div>
          </div>

          <div style={panel}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, color: CM.text }}>브랜드 건강도</Text>
              <Button variant="secondary" size="S" onPress={() => navigate('/brand')}>
                상세 보기
              </Button>
            </div>
            <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 16 })}>
              <MutedMeter value={87} variant="positive" label="종합 스코어" size="L" />
              <div style={f({ gap: 24 })}>
                {BRAND_HEALTH_METRICS.map(({ name, score, Icon: MetricIcon }) => (
                  <div key={name} style={f({ flexDirection: 'column', alignItems: 'center', gap: 6 })}>
                    <span
                      aria-hidden
                      style={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: CM.textSecondary,
                      }}
                    >
                      <MetricIcon />
                    </span>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{name}</Text>
                    <Text UNSAFE_style={{ fontSize: 18, fontWeight: 700 }}>{score}</Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={panel}>
          <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, color: CM.text, display: 'block', marginBottom: 16 }}>최근 활동</Text>
          <div style={f({ flexDirection: 'column', gap: 12 })}>
            {RECENT_ACTIVITIES.map((a, i) => {
              const ActIcon = a.Icon;
              return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < RECENT_ACTIVITIES.length - 1 ? `1px solid ${CM.chromeBorder}` : undefined,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: CM.text,
                  }}
                >
                  <ActIcon />
                </span>
                <Text UNSAFE_style={{ fontSize: 14, flex: 1, color: CM.text }}>{a.text}</Text>
                <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>{a.time}</Text>
              </div>
            );
            })}
          </div>
        </div>

        <div style={f({ gap: 12, flexWrap: 'wrap', alignItems: 'center' })}>
          <AccentButton onPress={() => navigate('/search')}>
            에셋 검색
          </AccentButton>
          <Button variant="secondary" onPress={() => navigate('/social/resize')}>
            소셜 리사이즈
          </Button>
          <Button
            variant="secondary"
            onPress={() => navigate('/ai/inbox')}
            // S2 Button uses align-items: baseline when wrap+icon; custom label+badge reads top-heavy.
            UNSAFE_style={{ alignItems: 'center' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>AI Creative Inbox</span>
              {pendingFixes > 0 ? (
                <MutedBadge tone="accent" size="S">
                  {pendingFixes}
                </MutedBadge>
              ) : null}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
