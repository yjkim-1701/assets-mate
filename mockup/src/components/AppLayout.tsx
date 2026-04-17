import type { ComponentType } from 'react';
import { Text, Badge, ActionButton } from '@react-spectrum/s2';
import Search from '@react-spectrum/s2/icons/Search';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Bell from '@react-spectrum/s2/icons/Bell';
import User from '@react-spectrum/s2/icons/User';
import Home from '@react-spectrum/s2/icons/Home';
import Brand from '@react-spectrum/s2/icons/Brand';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import Export from '@react-spectrum/s2/icons/Export';
import Settings from '@react-spectrum/s2/icons/Settings';
import { NavLink, useLocation } from 'react-router-dom';
import { AdobeMark } from './AdobeMark';
import { AI_FIX_INBOX } from '../data/mock';

/** 배경·보더는 유지하고, 붉·녹·주황·파랑 등은 파스텔·무디 톤(스크린샷 CI 대시보드 느낌) */
const CM = {
  chromeBg: '#ffffff',
  chromeBorder: '#E5E7EB',
  breadcrumbBg: '#F9FAFB',
  mainBg: '#F9FAFB',
  sidebarBg: '#ffffff',
  sidebarBorder: '#E5E7EB',
  /** 활성 네비: 어두운 칩 대신 연한 회색 배경 + 진한 글자 */
  activeNav: '#F3F4F6',
  activeNavText: '#111827',
  sectionLabel: '#6B7280',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  /** 무디 블루 (배지·링크) */
  primaryBlue: '#5B7DB8',
  /** 틸/에메랄드 계열 성공색 (채도 낮춤) */
  success: '#4A9288',
  successBg: '#ECF5F3',
  /** 더스트 로즈/코랄 계열 경고·에러 */
  danger: '#C97B74',
  /** 뮤티드 앰버 */
  warning: '#C49B6A',
  dangerBg: '#FDF1F0',
  warningBg: '#FFF6ED',
  /** 주황 배너용 짙은 글자 (파스텔 배경 위) */
  warningText: '#A67C52',
  cardBorder: '#E5E7EB',
  cardBorderHover: '#D1D5DB',
  cardShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
  panelBg: '#ffffff',
  accentIndigo: '#7B82B8',
  accentViolet: '#9B8EBF',
  /** 썸네일·플레이스홀더 배경 */
  surfacePlaceholder: '#E8EAEF',
} as const;

function pathToPageLabel(pathname: string): string {
  if (pathname === '/') return '대시보드';
  if (pathname === '/settings') return '설정';
  if (pathname.startsWith('/search')) return '검색 & 탐색';
  if (pathname.startsWith('/brand')) return '브랜드 거버넌스';
  if (pathname.startsWith('/ai')) return 'AI Creative';
  if (pathname.startsWith('/collaboration')) return '협업 & 승인';
  if (pathname.startsWith('/social')) return '소셜 리사이즈';
  if (pathname.startsWith('/optimize')) return '에셋 최적화';
  if (pathname.startsWith('/assets/')) return '에셋 상세';
  return '페이지';
}

interface NavItemProps {
  to: string;
  Icon: ComponentType;
  label: string;
  badge?: number;
}

function SidebarNavItem({ to, Icon, label, badge }: NavItemProps) {
  const location = useLocation();
  const isActive =
    to === '/'
      ? location.pathname === '/'
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <NavLink
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        marginBottom: 4,
        borderRadius: 8,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? CM.activeNavText : CM.text,
        backgroundColor: isActive ? CM.activeNav : 'transparent',
        transition: 'background-color 0.15s ease, color 0.15s ease',
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
          color: 'inherit',
          opacity: isActive ? 1 : 0.88,
        }}
      >
        <Icon />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <Badge size="S" variant={isActive ? 'positive' : 'accent'}>
          {badge}
        </Badge>
      )}
    </NavLink>
  );
}

const pendingCount = AI_FIX_INBOX.filter(f => f.status === 'pending').length;

const NAV_MAIN: NavItemProps[] = [
  { to: '/', Icon: Home, label: '대시보드' },
  { to: '/search', Icon: Search, label: '검색 & 탐색' },
  { to: '/brand', Icon: Brand, label: '브랜드 거버넌스' },
];

const NAV_WORKSPACE: NavItemProps[] = [
  { to: '/ai', Icon: MagicWand, label: 'AI Creative', badge: pendingCount },
  { to: '/collaboration', Icon: UserGroup, label: '캠페인 워크스페이스' },
  { to: '/social', Icon: SocialNetwork, label: '소셜 미디어' },
  { to: '/optimize', Icon: Export, label: '에셋 최적화' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: CM.sectionLabel,
        padding: '16px 12px 8px',
        textTransform: 'uppercase' as const,
      }}
    >
      {children}
    </div>
  );
}

function BreadcrumbBar() {
  const { pathname } = useLocation();
  const page = pathToPageLabel(pathname);

  return (
    <div
      style={{
        backgroundColor: CM.breadcrumbBg,
        borderBottom: `1px solid ${CM.chromeBorder}`,
        padding: '10px 24px',
        fontSize: 13,
        color: CM.textSecondary,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ color: CM.textMuted }}>Home</span>
      <span style={{ color: CM.textMuted }}>/</span>
      <span style={{ color: CM.text, fontWeight: 500 }}>{page}</span>
    </div>
  );
}

function TopChrome() {
  return (
    <header
      style={{
        height: 52,
        flexShrink: 0,
        backgroundColor: CM.chromeBg,
        borderBottom: `1px solid ${CM.chromeBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 20px 0 16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flex: '0 0 auto',
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        <AdobeMark size={32} />
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: CM.text,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          Asset Mate
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 'auto' }}>
        <ActionButton isQuiet aria-label="검색">
          <Search />
        </ActionButton>
        <ActionButton isQuiet aria-label="도움말">
          <HelpCircle />
        </ActionButton>
        <ActionButton isQuiet aria-label="알림">
          <Bell />
        </ActionButton>
        <div style={{ width: 1, height: 24, background: CM.chromeBorder, margin: '0 4px' }} />
        <ActionButton isQuiet size="S">
          Feedback
        </ActionButton>
        <ActionButton isQuiet aria-label="프로필">
          <User />
        </ActionButton>
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: CM.mainBg }}>
      <TopChrome />
      <BreadcrumbBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <nav
          style={{
            width: 260,
            flexShrink: 0,
            backgroundColor: CM.sidebarBg,
            borderRight: `1px solid ${CM.sidebarBorder}`,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px 10px 16px',
            overflowY: 'auto',
          }}
        >
          <SectionLabel>메인</SectionLabel>
          {NAV_MAIN.map(item => (
            <SidebarNavItem key={item.to} {...item} />
          ))}
          <SectionLabel>워크스페이스</SectionLabel>
          {NAV_WORKSPACE.map(item => (
            <SidebarNavItem key={item.to} {...item} />
          ))}
          <div style={{ flex: 1 }} />
          <SidebarNavItem to="/settings" Icon={Settings} label="설정" />
        </nav>
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            backgroundColor: CM.mainBg,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div
      style={{
        padding: '20px 28px 18px',
        borderBottom: `1px solid ${CM.chromeBorder}`,
        backgroundColor: CM.panelBg,
      }}
    >
      <Text UNSAFE_style={{ fontSize: 22, fontWeight: 700, color: CM.text, display: 'block', letterSpacing: '-0.02em' }}>
        {title}
      </Text>
      {description && (
        <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, marginTop: 6, display: 'block', lineHeight: 1.45 }}>
          {description}
        </Text>
      )}
    </div>
  );
}

export { CM };
