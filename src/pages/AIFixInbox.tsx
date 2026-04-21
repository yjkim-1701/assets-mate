import { Text, Button, Checkbox } from '@react-spectrum/s2';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import { MutedBadge } from '../components/MutedBadge';
import { MutedMeter } from '../components/MutedMeter';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { AI_FIX_INBOX, STATUS_LABELS, type FixStatus } from '../data/mock';
import { BADGE_TOKENS, type MutedTone } from '../theme/tokens';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const row: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 16,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};
/** 브랜드 인박스 ViolationRows와 동일 — CTA 두 줄 가로 폭 맞춤 */
const governanceCtaFullWidth: React.CSSProperties = { width: '100%' };

const STATUS_TABS: { key: string; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '대기' },
  { key: 'approved', label: '승인' },
  { key: 'rejected', label: '거절' },
  { key: 'changes_requested', label: '수정요청' },
];

/** 필터 탭 선택 색 — `BADGE_TOKENS` (헤더 뱃지와 동일 계열) */
function filterTabTone(key: string): MutedTone {
  const m: Record<string, MutedTone> = {
    all: 'neutral',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    changes_requested: 'info',
  };
  return m[key] ?? 'neutral';
}

function StatusBadge({ status }: { status: FixStatus }) {
  const tone: Record<FixStatus, 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    changes_requested: 'info',
  };
  return (
    <MutedBadge tone={tone[status]} size="S">
      {STATUS_LABELS[status]}
    </MutedBadge>
  );
}

export default function AIFixInbox() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filtered = activeFilter === 'all' ? AI_FIX_INBOX : AI_FIX_INBOX.filter(f => f.status === activeFilter);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <PageHeader
        title="AI Creative Inbox"
        description="브랜드 가이드에 맞춰 자동 보정된 결과를 검토하고, 승인·반려·수정 요청을 처리합니다."
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'all' ? AI_FIX_INBOX.length : AI_FIX_INBOX.filter(f => f.status === tab.key).length;
            const isActive = activeFilter === tab.key;
            const tone = filterTabTone(tab.key);
            const t = BADGE_TOKENS[tone];
            return (
              <Button
                key={tab.key}
                size="S"
                variant="secondary"
                onPress={() => setActiveFilter(tab.key)}
                UNSAFE_style={{
                  backgroundColor: t.bg,
                  border: `1px solid ${t.border}`,
                  color: t.text,
                  fontWeight: isActive ? 700 : 600,
                  boxShadow: isActive ? `0 0 0 2px ${t.text}` : 'none',
                }}
              >
                {tab.label} ({count})
              </Button>
            );
          })}
          <div style={{ flex: 1 }} />
          {selected.size > 0 && (
            <div style={f({ gap: 8 })}>
              <AccentButton size="S">일괄 승인 ({selected.size})</AccentButton>
              <Button variant="secondary" size="S" UNSAFE_className="s2-soft-danger">
                일괄 거절 ({selected.size})
              </Button>
            </div>
          )}
        </div>

        <div style={f({ flexDirection: 'column', gap: 8 })}>
          {filtered.map(fix => (
            <div
              key={fix.id}
              style={f({
                ...row,
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              })}
            >
              <div style={f({ alignItems: 'center', flexShrink: 0 })}>
                <Checkbox isSelected={selected.has(fix.id)} onChange={() => toggleSelect(fix.id)} />
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/ai/inbox/${fix.id}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/ai/inbox/${fix.id}`);
                  }
                }}
                style={f({
                  gap: 16,
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 200,
                  cursor: 'pointer',
                })}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    flexShrink: 0,
                    overflow: 'hidden',
                    backgroundColor: CM.surfacePlaceholder,
                  }}
                >
                  <SampleAssetImage filename={fix.assetName} phase="before" />
                </div>
                <div style={f({ flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 })}>
                  <div style={f({ gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                    <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold' }}>{fix.assetName}</Text>
                    <StatusBadge status={fix.status} />
                  </div>
                  <div style={f({ gap: 6, flexWrap: 'wrap' })}>
                    {fix.violations.map(v => (
                      <MutedBadge key={v} tone="danger" size="S">
                        {v}
                      </MutedBadge>
                    ))}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                    요청자: {fix.requester} · {fix.requestedAt}
                  </Text>
                </div>
                <div style={f({ flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 })}>
                  <div style={f({ gap: 8, alignItems: 'center' })}>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.danger, fontWeight: 600 }}>{fix.scoreBefore}</Text>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.textMuted }}>→</Text>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.success, fontWeight: 600 }}>{fix.scoreAfter}</Text>
                  </div>
                  <MutedMeter
                    value={fix.scoreAfter}
                    size="S"
                    variant={fix.scoreAfter >= 85 ? 'positive' : 'notice'}
                    label=""
                  />
                </div>
              </div>
              <div
                style={f({ flexDirection: 'column', gap: 8, alignItems: 'stretch', flexShrink: 0, minWidth: 200 })}
              >
                <AccentButton
                  size="S"
                  UNSAFE_style={governanceCtaFullWidth}
                  onPress={() => navigate(`/ai/brand-fix/${fix.assetId}`)}
                >
                  <MagicWand />
                  <Text>AI 자연어 수정</Text>
                </AccentButton>
                <Button
                  variant="secondary"
                  size="S"
                  UNSAFE_style={governanceCtaFullWidth}
                  onPress={() => navigate(`/ai/inbox/${fix.id}`)}
                >
                  AI Curated 검토
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
