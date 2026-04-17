import type { ComponentType, ReactNode } from 'react';
import { Text, ActionButton } from '@react-spectrum/s2';
import { MutedBadge } from './MutedBadge';
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

/**
 * 레이아웃·카드 + 인라인 강조색 — 뱃지 레퍼런스와 동일하게 연한 배경 톤에 맞춘 글자색
 * (BADGE_TOKENS / theme/tokens.ts 와 정합)
 */
const CM = {
  chromeBg: '#ffffff',
  chromeBorder: '#E5E7EB',
  breadcrumbBg: '#F9FAFB',
  mainBg: '#F9FAFB',
  sidebarBg: '#ffffff',
  sidebarBorder: '#E5E7EB',
  activeNav: '#F3F4F6',
  activeNavText: '#111827',
  sectionLabel: '#6B7280',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  primaryBlue: '#1D4ED8',
  success: '#047857',
  successBg: '#ECFDF5',
  danger: '#991B1B',
  warning: '#B45309',
  dangerBg: '#FEF2F2',
  warningBg: '#FFFBEB',
  warningText: '#92400E',
  info: '#1D4ED8',
  infoBg: '#EFF6FF',
  cardBorder: '#E5E7EB',
  cardBorderHover: '#D1D5DB',
  cardShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
  panelBg: '#ffffff',
  accentIndigo: '#4338CA',
  accentViolet: '#6D28D9',
  surfacePlaceholder: '#EEF2F6',
} as const;

function pathToPageLabel(pathname: string): string {
  if (pathname === '/') return '대시보드';
  if (pathname === '/settings') return '설정';
  if (pathname.startsWith('/search')) return '검색 & 탐색';
  if (pathname === '/brand/template-locks') return '템플릿 잠금 영역';
  if (pathname === '/brand/forbidden') return '금지 에셋 관리';
  if (pathname.startsWith('/brand')) return '브랜드 거버넌스';
  if (pathname.startsWith('/ai/custom-models')) return '브랜드 Custom Model';
  if (pathname.startsWith('/ai/variations')) return '브랜드 변형 생성';
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
      <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
      {badge != null && badge > 0 && (
        <MutedBadge size="S" tone={isActive ? 'success' : 'accent'}>
          {badge}
        </MutedBadge>
      )}
    </NavLink>
  );
}

const NAV_MAIN: NavItemProps[] = [
  { to: '/', Icon: Home, label: '대시보드' },
  { to: '/search', Icon: Search, label: '검색 & 탐색' },
  { to: '/brand', Icon: Brand, label: '브랜드 거버넌스' },
];

const NAV_WORKSPACE: NavItemProps[] = [
  { to: '/ai', Icon: MagicWand, label: 'AI Creative' },
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

const AI_INBOX_TOTAL_COUNT = AI_FIX_INBOX.length;

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
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActionButton
            isQuiet
            aria-label={AI_INBOX_TOTAL_COUNT > 0 ? `알림, AI Creative Inbox ${AI_INBOX_TOTAL_COUNT}건` : '알림'}
          >
            <Bell />
          </ActionButton>
          {AI_INBOX_TOTAL_COUNT > 0 && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 18,
                height: 18,
                padding: '0 5px',
                boxSizing: 'border-box',
                borderRadius: 999,
                backgroundColor: '#DC2626',
                color: '#ffffff',
                fontSize: 10,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                pointerEvents: 'none',
                border: `2px solid ${CM.chromeBg}`,
              }}
            >
              {AI_INBOX_TOTAL_COUNT > 99 ? '99+' : AI_INBOX_TOTAL_COUNT}
            </span>
          )}
        </div>
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

export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
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
      {description != null && description !== '' && (
        <div style={{ marginTop: 6 }}>
          {typeof description === 'string' ? (
            <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, display: 'block', lineHeight: 1.45 }}>
              {description}
            </Text>
          ) : (
            description
          )}
        </div>
      )}
    </div>
  );
}

export { CM };
