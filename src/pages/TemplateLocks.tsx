import { useState, useMemo } from 'react';
import { Text, Button, InlineAlert, Switch } from '@react-spectrum/s2';
import Lock from '@react-spectrum/s2/icons/Lock';
import { PageHeader, CM } from '../components/AppLayout';
import { MutedBadge } from '../components/MutedBadge';
import type { TemplateLockRegion } from '../data/mock';
import { TEMPLATE_LOCK_DEMO } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const KIND_LABEL: Record<TemplateLockRegion['kind'], string> = {
  logo: '로고',
  font: '폰트/카피',
  color: '색상',
  editable: '편집 영역',
};

function cloneRegions(): TemplateLockRegion[] {
  return TEMPLATE_LOCK_DEMO.regions.map(r => ({ ...r }));
}

export default function TemplateLocks() {
  const [role, setRole] = useState<'agency' | 'admin'>('agency');
  const [regions, setRegions] = useState<TemplateLockRegion[]>(cloneRegions);
  const [warn, setWarn] = useState<string | null>(null);

  const lockedCount = useMemo(() => regions.filter(r => r.locked).length, [regions]);

  const onCanvasClick = (r: TemplateLockRegion) => {
    setWarn(null);
    if (role === 'agency' && r.locked) {
      setWarn('이 영역은 브랜드 잠금이 적용되어 있습니다. 수정하려면 내부 관리자에게 잠금 해제를 요청하세요.');
      return;
    }
    if (role === 'agency' && !r.locked) {
      setWarn(null);
      setWarn(`「${r.label}」영역 편집 모드로 전환됩니다.`);
    }
  };

  const setLock = (id: string, locked: boolean) => {
    setRegions(prev => prev.map(r => (r.id === id ? { ...r, locked } : r)));
  };

  return (
    <>
      <PageHeader
        title="템플릿 잠금 영역"
        description="에이전시 배포용 템플릿에서 로고·브랜드 컬러 등을 잠그고, 편집 가능 영역만 노출합니다"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 16, alignItems: 'center', flexWrap: 'wrap' })}>
          <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>보기 역할</Text>
          <div style={f({ gap: 8 })}>
            <Button variant={role === 'agency' ? 'accent' : 'secondary'} size="S" onPress={() => setRole('agency')}>
              에이전시
            </Button>
            <Button variant={role === 'admin' ? 'accent' : 'secondary'} size="S" onPress={() => setRole('admin')}>
              내부 관리자
            </Button>
          </div>
          <MutedBadge tone={role === 'admin' ? 'success' : 'accent'} size="S">
            {role === 'admin' ? '잠금 설정/해제 가능' : '잠금 영역 수정 시 경고'}
          </MutedBadge>
        </div>

        {warn && (
          <InlineAlert variant="notice">
            <Text>{warn}</Text>
          </InlineAlert>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
          <div style={card}>
            <div style={f({ justifyContent: 'space-between', marginBottom: 12 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>{TEMPLATE_LOCK_DEMO.templateName}</Text>
              <MutedBadge tone="neutral" size="S">
                잠금 {lockedCount}개
              </MutedBadge>
            </div>
            <div
              role="presentation"
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                background: 'linear-gradient(145deg, #EEF2FF 0%, #F8FAFC 45%, #DBEAFE 100%)',
                borderRadius: 12,
                border: `1px solid ${CM.cardBorder}`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '8%',
                  top: '12%',
                  fontSize: 'clamp(11px, 1.8vw, 14px)',
                  fontWeight: 700,
                  color: CM.text,
                  opacity: 0.35,
                }}
              >
                배너 미리보기
              </div>
              {regions.map(r => {
                const isLocked = r.locked;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onCanvasClick(r)}
                    style={{
                      position: 'absolute',
                      left: `${r.rect.x}%`,
                      top: `${r.rect.y}%`,
                      width: `${r.rect.w}%`,
                      height: `${r.rect.h}%`,
                      margin: 0,
                      padding: 8,
                      boxSizing: 'border-box',
                      border: `2px dashed ${isLocked ? '#7C3AED' : '#059669'}`,
                      borderRadius: 8,
                      backgroundColor: isLocked ? 'rgba(124, 58, 237, 0.12)' : 'rgba(5, 150, 105, 0.08)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start',
                      gap: 4,
                    }}
                  >
                    {isLocked && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#5B21B6',
                          backgroundColor: 'rgba(255,255,255,0.85)',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        <Lock />
                        잠금
                      </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 600, color: CM.text, lineHeight: 1.3 }}>{r.label}</span>
                    <span style={{ fontSize: 10, color: CM.textSecondary }}>{KIND_LABEL[r.kind]}</span>
                  </button>
                );
              })}
            </div>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, marginTop: 12, display: 'block' }}>
              잠금 영역은 보라색 점선·자물쇈 오버레이로 표시됩니다. 에이전시 역할에서는 잠금 영역 클릭 시 경고가 뜹니다.
            </Text>
          </div>

          <div style={{ ...card, padding: 20 }}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
              영역별 잠금 {role === 'admin' ? '(관리자)' : '(읽기 전용)'}
            </Text>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              {regions.map(r => (
                <div
                  key={r.id}
                  style={f({
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: `1px solid ${CM.cardBorder}`,
                  })}
                >
                  <div style={f({ flexDirection: 'column', gap: 2, minWidth: 0 })}>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</Text>
                    <Text UNSAFE_style={{ fontSize: 11, color: CM.textSecondary }}>{KIND_LABEL[r.kind]}</Text>
                  </div>
                  {role === 'admin' ? (
                    <Switch isSelected={r.locked} onChange={v => setLock(r.id, v)}>
                      잠금
                    </Switch>
                  ) : (
                    <MutedBadge tone={r.locked ? 'accent' : 'success'} size="S">
                      {r.locked ? '잠금' : '편집 가능'}
                    </MutedBadge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
