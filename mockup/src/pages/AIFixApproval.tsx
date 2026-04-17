import { useState, useEffect } from 'react';
import { Text, Button, TextArea } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { MutedMeter } from '../components/MutedMeter';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
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
  height: 160,
  backgroundColor: CM.surfacePlaceholder,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const compareRowWrap: React.CSSProperties = {
  width: 'min(640px, 90vw)',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const afterImageStyle: React.CSSProperties = { filter: 'saturate(1.08) contrast(1.02)' };

export default function AIFixApproval() {
  const { fixId } = useParams();
  const navigate = useNavigate();
  const fix = AI_FIX_INBOX.find(f => f.id === fixId) || AI_FIX_INBOX[0];
  const [lightbox, setLightbox] = useState<'before' | 'after' | null>(null);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

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

        <div style={compareRowWrap}>
          <div style={f({ gap: 16 })}>
            <div style={f({ flexDirection: 'column', gap: 8, flex: 1 })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>수정 전</Text>
              <div style={{ ...imageBox, color: CM.textMuted, padding: 0, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <SampleAssetImage filename={fix.assetName} phase="before" />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      right: 6,
                      display: 'flex',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Text UNSAFE_style={{ fontSize: 11, color: CM.textSecondary, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>원본 이미지</Text>
                  </div>
                </div>
              </div>
              <div style={f({ justifyContent: 'center' })}>
                <Button variant="secondary" size="S" onPress={() => setLightbox('before')}>
                  이미지 크게 보기
                </Button>
              </div>
              <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' })}>
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>브랜드 스코어</Text>
                <MutedMeter value={fix.scoreBefore} variant="negative" label={`${fix.scoreBefore}/100`} size="L" />
              </div>
            </div>

            <div style={f({ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 28 })}>
              <Text UNSAFE_style={{ fontSize: 20 }}>→</Text>
            </div>

            <div style={f({ flexDirection: 'column', gap: 8, flex: 1 })}>
              <div
                style={f({
                  justifyContent: 'center',
                  gap: 8,
                  alignItems: 'stretch',
                  width: '100%',
                })}
              >
                <MutedBadge
                  tone="accent"
                  size="S"
                  style={{ flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MagicWand />
                    <Text>AI Curated</Text>
                  </span>
                </MutedBadge>
                <MutedBadge
                  variant="informative"
                  size="S"
                  style={{ flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}
                >
                  후보 1/3
                </MutedBadge>
              </div>
              <div style={{ ...imageBox, border: '2px solid #A7F3D0', color: CM.textSecondary, padding: 0, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%' }}>
                  <SampleAssetImage filename={fix.assetName} phase="after" style={afterImageStyle} />
                </div>
              </div>
              <div style={f({ justifyContent: 'center' })}>
                <Button variant="secondary" size="S" onPress={() => setLightbox('after')}>
                  이미지 크게 보기
                </Button>
              </div>
              <div style={f({ flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' })}>
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>예상 브랜드 스코어</Text>
                <MutedMeter value={fix.scoreAfter} variant="positive" label={`${fix.scoreAfter}/100`} size="L" />
              </div>
            </div>
          </div>
        </div>

        {lightbox && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightbox === 'before' ? '수정 전 이미지 확대' : '수정 후 이미지 확대'}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(15, 23, 42, 0.88)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setLightbox(null)}
          >
            <div
              style={{
                position: 'relative',
                width: 'min(92vw, 1100px)',
                maxHeight: 'min(88vh, 900px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'stretch',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={f({ justifyContent: 'space-between', alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                  {lightbox === 'before' ? '수정 전 원본' : '수정 후 후보'}
                </Text>
                <Button variant="secondary" size="M" onPress={() => setLightbox(null)}>
                  닫기
                </Button>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#0f172a',
                  border: lightbox === 'after' ? '2px solid #A7F3D0' : `1px solid ${CM.cardBorder}`,
                }}
              >
                <div style={{ width: '100%', height: 'min(75vh, 820px)', position: 'relative' }}>
                  <SampleAssetImage
                    filename={fix.assetName}
                    phase={lightbox}
                    style={lightbox === 'after' ? afterImageStyle : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
