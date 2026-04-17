import { Text, Button, Checkbox } from '@react-spectrum/s2';
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
  cursor: 'pointer',
  boxShadow: CM.cardShadow,
};

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

/** 기본 뱃지형 탭 대비 ~1.3배 (패딩·글자·모서리) */
const filterTabBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  padding: '4px 11px',
  fontSize: 16,
  fontWeight: 600,
  lineHeight: 1.25,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxSizing: 'border-box' as const,
};

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
      <PageHeader title="AI Creative Inbox" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 10, alignItems: 'center' })}>
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'all' ? AI_FIX_INBOX.length : AI_FIX_INBOX.filter(f => f.status === tab.key).length;
            const isActive = activeFilter === tab.key;
            const tone = filterTabTone(tab.key);
            const t = BADGE_TOKENS[tone];
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                style={{
                  ...filterTabBase,
                  border: `1px solid ${t.border}`,
                  backgroundColor: t.bg,
                  color: t.text,
                  fontWeight: isActive ? 700 : 600,
                  boxShadow: isActive ? `0 0 0 2px ${t.text}` : 'none',
                }}
              >
                {tab.label} ({count})
              </button>
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
            <div key={fix.id} style={row} onClick={() => navigate(`/ai/inbox/${fix.id}`)}>
              <div style={f({ gap: 16, alignItems: 'center' })}>
                <div onClick={e => e.stopPropagation()}>
                  <Checkbox isSelected={selected.has(fix.id)} onChange={() => toggleSelect(fix.id)} />
                </div>
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
                <div style={f({ flexDirection: 'column', gap: 4, flex: 1 })}>
                  <div style={f({ gap: 8, alignItems: 'center' })}>
                    <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold' }}>{fix.assetName}</Text>
                    <StatusBadge status={fix.status} />
                  </div>
                  <div style={f({ gap: 6 })}>
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
                <div style={f({ flexDirection: 'column', alignItems: 'flex-end', gap: 4 })}>
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
