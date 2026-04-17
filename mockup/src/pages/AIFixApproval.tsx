import { Text, Button, Badge, Meter, TextArea } from '@react-spectrum/s2';
import Image from '@react-spectrum/s2/icons/Image';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import Star from '@react-spectrum/s2/icons/Star';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
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

  const statusVariant = {
    pending: 'notice' as const, approved: 'positive' as const,
    rejected: 'negative' as const, changes_requested: 'informative' as const,
  };

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
              <Badge variant={statusVariant[fix.status]} size="L">
                {STATUS_LABELS[fix.status]}
              </Badge>
              <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold' }}>{fix.assetName}</Text>
            </div>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
              요청자: {fix.requester} · {fix.requestedAt}
            </Text>
          </div>
          <div style={f({ gap: 8, marginBottom: 16 })}>
            {fix.violations.map(v => (
              <Badge key={v} variant="negative" size="S">{v} 위반</Badge>
            ))}
          </div>
        </div>

        <div style={f({ gap: 24 })}>
          <div style={f({ flexDirection: 'column', gap: 12, flex: 1 })}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>수정 전</Text>
            <div style={{ ...imageBox, color: CM.textMuted }}>
              <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 8 })}>
                <span style={{ display: 'flex', width: 48, height: 48, opacity: 0.35 }}>
                  <Image />
                </span>
                <Text UNSAFE_style={{ color: CM.textSecondary }}>원본 이미지</Text>
                {fix.violations.map(v => (
                  <Badge key={v} variant="negative" size="S">● {v} 위반</Badge>
                ))}
              </div>
            </div>
            <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>브랜드 스코어</Text>
              <Meter value={fix.scoreBefore} variant="negative" label={`${fix.scoreBefore}/100`} size="L" />
            </div>
          </div>

          <div style={f({ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' })}>
            <Text UNSAFE_style={{ fontSize: 24 }}>→</Text>
          </div>

          <div style={f({ flexDirection: 'column', gap: 12, flex: 1 })}>
            <div style={f({ justifyContent: 'center', gap: 8, alignItems: 'center' })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>수정 후</Text>
              <Badge variant="informative" size="S">후보 1/3</Badge>
            </div>
            <div style={{ ...imageBox, border: `2px solid ${CM.success}`, color: CM.textSecondary }}>
              <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 8 })}>
                <span style={{ display: 'flex', width: 40, height: 40, opacity: 0.6 }}>
                  <Star />
                </span>
                <Text UNSAFE_style={{ color: CM.textSecondary }}>AI 수정 결과</Text>
                <Badge variant="accent" size="S">
                  <MagicWand />
                  <Text>AI Generated</Text>
                </Badge>
              </div>
            </div>
            <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>예상 브랜드 스코어</Text>
              <Meter value={fix.scoreAfter} variant="positive" label={`${fix.scoreAfter}/100`} size="L" />
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
          <Button variant="negative" onPress={() => navigate('/ai/inbox')}>Reject</Button>
          <Button variant="secondary" onPress={() => navigate('/ai/inbox')}>Request Changes</Button>
          <AccentButton onPress={() => navigate('/ai/inbox')}>✓ Approve</AccentButton>
        </div>
      </div>
    </>
  );
}
