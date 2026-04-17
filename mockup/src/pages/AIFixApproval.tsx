import { Text, Button, TextArea } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { MutedMeter } from '../components/MutedMeter';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import Star from '@react-spectrum/s2/icons/Star';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { AI_FIX_INBOX, STATUS_LABELS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};
const imageBox: React.CSSProperties = {
  flex: 1,
  height: 320,
  backgroundColor: CM.surfacePlaceholder,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function AIFixApproval() {
  const { fixId } = useParams();
  const navigate = useNavigate();
  const fix = AI_FIX_INBOX.find(f => f.id === fixId) || AI_FIX_INBOX[0];

  const statusTone = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    changes_requested: 'info',
  } as const;

  return (
    <>
      <PageHeader title="AI 수정 승인 상세" description={fix.assetName} />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={f({ gap: 8 })}>
          <Button variant="secondary" size="S" onPress={() => navigate('/ai/inbox')}>← Inbox로 돌아가기</Button>
        </div>

        <div style={card}>
          <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
            <div style={f({ gap: 12, alignItems: 'center' })}>
              <MutedBadge tone={statusTone[fix.status]} size="L">
                {STATUS_LABELS[fix.status]}
              </MutedBadge>
              <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold' }}>{fix.assetName}</Text>
            </div>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
              요청자: {fix.requester} · {fix.requestedAt}
            </Text>
          </div>
          <div style={f({ gap: 8, marginBottom: 16 })}>
            {fix.violations.map(v => (
              <MutedBadge key={v} tone="danger" size="S">
                {v} 위반
              </MutedBadge>
            ))}
          </div>
        </div>

        <div style={f({ gap: 24 })}>
          <div style={f({ flexDirection: 'column', gap: 12, flex: 1 })}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>수정 전</Text>
            <div style={{ ...imageBox, color: CM.textMuted, padding: 0, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <SampleAssetImage filename={fix.assetName} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    pointerEvents: 'none',
                  }}
                >
                  <Text UNSAFE_style={{ color: CM.textSecondary, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>원본 이미지</Text>
                  {fix.violations.map(v => (
                    <MutedBadge key={v} tone="danger" size="S">
                      ● {v} 위반
                    </MutedBadge>
                  ))}
                </div>
              </div>
            </div>
            <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>브랜드 스코어</Text>
              <MutedMeter value={fix.scoreBefore} variant="negative" label={`${fix.scoreBefore}/100`} size="L" />
            </div>
          </div>

          <div style={f({ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
            <Text UNSAFE_style={{ fontSize: 24 }}>→</Text>
          </div>

          <div style={f({ flexDirection: 'column', gap: 12, flex: 1 })}>
            <div style={f({ justifyContent: 'center', gap: 8, alignItems: 'center' })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>수정 후</Text>
              <MutedBadge variant="informative" size="S">후보 1/3</MutedBadge>
            </div>
            <div style={{ ...imageBox, border: '2px solid #A7F3D0', color: CM.textSecondary, padding: 0, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <SampleAssetImage filename={fix.assetName} style={{ filter: 'saturate(1.08) contrast(1.02)' }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    pointerEvents: 'none',
                    background: 'linear-gradient(to top, rgba(15,23,42,0.45), transparent 55%)',
                  }}
                >
                  <span style={{ display: 'flex', width: 40, height: 40, color: 'rgba(255,255,255,0.9)' }}>
                    <Star />
                  </span>
                  <Text UNSAFE_style={{ color: '#fff', fontWeight: 600 }}>AI 수정 결과</Text>
                  <MutedBadge tone="accent" size="S">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MagicWand />
                      <Text>AI Generated</Text>
                    </span>
                  </MutedBadge>
                </div>
              </div>
            </div>
            <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>예상 브랜드 스코어</Text>
              <MutedMeter value={fix.scoreAfter} variant="positive" label={`${fix.scoreAfter}/100`} size="L" />
            </div>
          </div>
        </div>

        <div style={f({ justifyContent: 'center', gap: 8 })}>
          <Button variant="secondary" size="S">◀ 이전 후보</Button>
          <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600, padding: '6px 12px' }}>후보 1 / 3</Text>
          <Button variant="secondary" size="S">다음 후보 ▶</Button>
        </div>

        <div style={card}>
          <div style={{ width: '100%' }}>
            <TextArea label="사유 / 코멘트" description="Reject 또는 Request Changes 시 사유를 입력해주세요" />
          </div>
        </div>

        <div style={f({ gap: 12, justifyContent: 'flex-end' })}>
          <Button variant="secondary" UNSAFE_className="s2-soft-danger" onPress={() => navigate('/ai/inbox')}>
            Reject
          </Button>
          <Button variant="secondary" onPress={() => navigate('/ai/inbox')}>Request Changes</Button>
          <AccentButton onPress={() => navigate('/ai/inbox')}>✓ Approve</AccentButton>
        </div>
      </div>
    </>
  );
}
