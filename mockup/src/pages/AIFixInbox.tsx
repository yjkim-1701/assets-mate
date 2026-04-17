import { Text, Button, Badge, Checkbox, Meter } from '@react-spectrum/s2';
import Image from '@react-spectrum/s2/icons/Image';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { AI_FIX_INBOX, STATUS_LABELS, type FixStatus } from '../data/mock';

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

function StatusBadge({ status }: { status: FixStatus }) {
  const variants: Record<FixStatus, 'notice' | 'positive' | 'negative' | 'informative'> = {
    pending: 'notice', approved: 'positive', rejected: 'negative', changes_requested: 'informative',
  };
  return <Badge variant={variants[status]} size="S">{STATUS_LABELS[status]}</Badge>;
}

export default function AIFixInbox() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const filtered = activeFilter === 'all' ? AI_FIX_INBOX : AI_FIX_INBOX.filter(f => f.status === activeFilter);
  const pendingCount = AI_FIX_INBOX.filter(f => f.status === 'pending').length;

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <>
      <PageHeader title="AI 수정 Inbox" description={`AI가 수정한 에셋의 승인 대기 현황 · ${pendingCount}건 대기 중`} />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8, alignItems: 'center' })}>
          {STATUS_TABS.map(tab => {
            const count = tab.key === 'all' ? AI_FIX_INBOX.length : AI_FIX_INBOX.filter(f => f.status === tab.key).length;
            return activeFilter === tab.key ? (
              <AccentButton key={tab.key} size="S" onPress={() => setActiveFilter(tab.key)}>
                {tab.label} ({count})
              </AccentButton>
            ) : (
              <Button key={tab.key} variant="secondary" size="S" onPress={() => setActiveFilter(tab.key)}>
                {tab.label} ({count})
              </Button>
            );
          })}
          <div style={{ flex: 1 }} />
          {selected.size > 0 && (
            <div style={f({ gap: 8 })}>
              <AccentButton size="S">일괄 승인 ({selected.size})</AccentButton>
              <Button variant="negative" size="S">일괄 거절 ({selected.size})</Button>
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
                <div style={{ width: 64, height: 64, backgroundColor: CM.surfacePlaceholder, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CM.textMuted }}>
                  <span style={{ display: 'flex', width: 32, height: 32, opacity: 0.4 }}>
                    <Image />
                  </span>
                </div>
                <div style={f({ flexDirection: 'column', gap: 4, flex: 1 })}>
                  <div style={f({ gap: 8, alignItems: 'center' })}>
                    <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold' }}>{fix.assetName}</Text>
                    <StatusBadge status={fix.status} />
                  </div>
                  <div style={f({ gap: 6 })}>
                    {fix.violations.map(v => (
                      <Badge key={v} variant="negative" size="S">{v}</Badge>
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
                  <Meter value={fix.scoreAfter} size="S"
                    variant={fix.scoreAfter >= 85 ? 'positive' : 'notice'} label="" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
