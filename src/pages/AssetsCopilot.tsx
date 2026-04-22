import { useState, useRef, useEffect, useCallback } from 'react';
import { ProgressBar, Button } from '@react-spectrum/s2';
import { useNavigate } from 'react-router-dom';
import { ASSETS, COPILOT_STARTER_PROMPTS } from '../data/mock';
import {
  parseCopilotIntent,
  mockGovernanceReport,
  mockGenerationPreview,
  mockBeforeAfter,
  mockSearchCard,
  mockDamPathSuggest,
  emptyCopilotSession,
  type CopilotMessage,
  type CopilotSession,
  type ToolCard,
  type AssetLite,
} from '../data/copilotIntentMock';
import { MutedBadge } from '../components/MutedBadge';
import { sampleImageUrl } from '../lib/sampleMedia';

// ── Design tokens ─────────────────────────────────────────────────────────────
const CM = {
  mainBg: '#F9FAFB',
  activeNav: '#F3F4F6',
  panelBg: '#ffffff',
  cardBorder: '#E5E7EB',
  cardShadow: '0 1px 3px rgba(15,23,42,0.08)',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  primaryBlue: '#1D4ED8',
  infoBg: '#EFF6FF',
  success: '#047857',
  successBg: '#ECFDF5',
  danger: '#991B1B',
  dangerBg: '#FEF2F2',
  warningBg: '#FFFBEB',
  warningText: '#92400E',
  userBubbleBg: '#EFF6FF',
  userBubbleText: '#1E3A8A',
  assistantAvatar: '#1D4ED8',
  chipBg: '#F3F4F6',
  chipBorder: '#E5E7EB',
  chipHover: '#E5E7EB',
  inputBorder: '#D1D5DB',
  inputFocus: '#1D4ED8',
  accentViolet: '#6D28D9',
} as const;

const MOCK_AI_MS = 2200;
const MAX_CONTENT_WIDTH = 860;
const SESSIONS_KEY = 'assets-copilot-sessions';
const SESSION_SIDEBAR_W = 232;

type ChatSession = {
  id: string;
  title: string;
  messages: CopilotMessage[];
  copilotSession: CopilotSession;
  updatedAt: number;
};

function relativeTime(ts: number): string {
  const d = Date.now() - ts;
  if (d < 60_000) return '방금 전';
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}분 전`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}시간 전`;
  return `${Math.floor(d / 86_400_000)}일 전`;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2);
}

function assetThumb(name: string): string {
  return sampleImageUrl(name);
}

function statusLabel(s: string) {
  if (s === 'approved') return '승인됨';
  if (s === 'review') return '검토 중';
  if (s === 'violation') return '위반';
  return s;
}

function statusTone(s: string): 'success' | 'warning' | 'danger' {
  if (s === 'approved') return 'success';
  if (s === 'review') return 'warning';
  return 'danger';
}

// ── Tool Card Renderers ───────────────────────────────────────────────────────

type AssetCardActions = {
  onDetail: (id: string) => void;
  onSimilar: (id: string) => void;
  onDam: (id: string) => void;
  onFix?: (id: string) => void;
};

function CardActionBtn({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 9px', border: `1px solid ${CM.cardBorder}`,
        borderRadius: 6, background: CM.mainBg, cursor: 'pointer',
        fontSize: 11, color: CM.textSecondary, fontWeight: 500,
        transition: 'background 0.12s, color 0.12s, border-color 0.12s',
        whiteSpace: 'nowrap' as const,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = CM.infoBg;
        el.style.color = CM.primaryBlue;
        el.style.borderColor = '#BFDBFE';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = CM.mainBg;
        el.style.color = CM.textSecondary;
        el.style.borderColor = CM.cardBorder;
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function AssetCard({ asset, actions }: { asset: AssetLite; actions: AssetCardActions }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      style={{
        background: CM.panelBg,
        border: `1px solid ${CM.cardBorder}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: CM.cardShadow,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#F3F4F6', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
        {!imgErr ? (
          <img
            src={assetThumb(asset.name)}
            alt={asset.name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: CM.textMuted }}>
            🖼
          </div>
        )}
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <MutedBadge size="S" tone={statusTone(asset.status)}>{statusLabel(asset.status)}</MutedBadge>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 8px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: CM.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.name}</div>
        <div style={{ fontSize: 11, color: CM.textMuted, marginTop: 2 }}>{asset.campaign}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{ width: `${asset.brandScore}%`, height: '100%', background: asset.brandScore >= 80 ? CM.success : asset.brandScore >= 60 ? '#D97706' : '#DC2626', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 11, color: CM.textSecondary, flexShrink: 0 }}>{asset.brandScore}</span>
        </div>
      </div>

      {/* Action strip */}
      <div style={{ borderTop: `1px solid ${CM.cardBorder}`, padding: '8px 10px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        <CardActionBtn icon="📄" label="에셋 상세보기" onClick={() => actions.onDetail(asset.id)} />
        <CardActionBtn icon="🔍" label="유사 검색" onClick={() => actions.onSimilar(asset.id)} />
        {asset.status === 'violation' && actions.onFix && (
          <CardActionBtn icon="✨" label="AI 수정" onClick={() => actions.onFix!(asset.id)} />
        )}
      </div>
    </div>
  );
}

function AssetGridCard({ card, actions }: {
  card: ToolCard & { kind: 'asset_grid' };
  actions: AssetCardActions;
}) {
  return (
    <div>
      <div style={{ fontSize: 13, color: CM.textSecondary, marginBottom: 10 }}>
        <span style={{ fontWeight: 600, color: CM.text }}>{card.totalCount}건</span>의 에셋이 조건에 맞습니다.{' '}
        <span style={{ fontSize: 12, color: CM.textMuted }}>({card.intentSummary})</span>
      </div>
      {card.assets.length === 0 ? (
        <div style={{ padding: '20px 0', fontSize: 13, color: CM.textMuted }}>조건에 맞는 에셋이 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {card.assets.map(a => <AssetCard key={a.id} asset={a} actions={actions} />)}
        </div>
      )}
    </div>
  );
}

function AssetDetailCard({ card, onFix }: {
  card: ToolCard & { kind: 'asset_detail' };
  onFix: (assetId: string) => void;
}) {
  const a = card.asset;
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{ background: CM.panelBg, border: `1px solid ${CM.cardBorder}`, borderRadius: 12, overflow: 'hidden', boxShadow: CM.cardShadow }}>
      <div style={{ width: '100%', maxHeight: 320, overflow: 'hidden', background: '#F3F4F6' }}>
        {!imgErr ? (
          <img src={assetThumb(a.name)} alt={a.name} onError={() => setImgErr(true)} style={{ width: '100%', objectFit: 'cover', maxHeight: 320 }} />
        ) : (
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: CM.textMuted }}>🖼</div>
        )}
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: CM.text }}>{a.name}</div>
            <div style={{ fontSize: 12, color: CM.textMuted, marginTop: 2 }}>{a.dim} · {a.size} · {a.campaign}</div>
          </div>
          <MutedBadge tone={statusTone(a.status)} size="S">{statusLabel(a.status)}</MutedBadge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: CM.textSecondary }}>브랜드 점수</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
            <div style={{ width: `${a.brandScore}%`, height: '100%', background: a.brandScore >= 80 ? CM.success : a.brandScore >= 60 ? '#D97706' : '#DC2626', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: CM.text }}>{a.brandScore}</span>
        </div>
        {a.generationPrompt && (
          <div style={{ fontSize: 11, color: CM.textMuted, background: CM.mainBg, borderRadius: 6, padding: '6px 10px', marginBottom: 12, fontStyle: 'italic' }}>
            생성 프롬프트: {a.generationPrompt}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {a.status === 'violation' && (
            <Button variant="accent" size="S" onPress={() => onFix(a.id)}>AI 자동 수정</Button>
          )}
          <Button variant="secondary" size="S" onPress={() => window.open(`/assets/${a.id}`, '_blank')}>에셋 상세 보기</Button>
        </div>
      </div>
    </div>
  );
}

function GovernanceReportCard({
  card,
  onProceed,
  onFix,
}: {
  card: ToolCard & { kind: 'governance_report' };
  onProceed?: (assetName: string) => void;
  onFix?: (assetName: string) => void;
}) {
  const isPass = card.result === 'pass';
  const isWarn = card.result === 'warn';
  const bgColor = isPass ? CM.successBg : isWarn ? CM.warningBg : CM.dangerBg;
  const labelColor = isPass ? CM.success : isWarn ? CM.warningText : CM.danger;
  const label = isPass ? '✓ 거버넌스 통과' : isWarn ? '⚠ 경고 — 주의 필요' : '✕ 차단 — 업로드 불가';
  const [actioned, setActioned] = useState(false);
  const [showDamPicker, setShowDamPicker] = useState(false);
  const [pickedPath, setPickedPath] = useState<string | null>(null);
  const [showDamSuggest, setShowDamSuggest] = useState(false);
  const damCard = showDamSuggest ? mockDamPathSuggest(card.assetName) : null;

  return (
    <div style={{ border: `1px solid ${CM.cardBorder}`, borderRadius: 12, overflow: 'hidden', background: CM.panelBg, boxShadow: CM.cardShadow }}>
      <div style={{ padding: '14px 18px', background: bgColor, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: labelColor }}>{label}</span>
        <span style={{ fontSize: 12, color: CM.textSecondary, marginLeft: 'auto' }}>{card.assetName}</span>
      </div>
      {card.violations.length > 0 && (
        <div style={{ padding: '12px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: CM.textSecondary, marginBottom: 8 }}>위반 항목</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {card.violations.map(v => (
              <div key={v.code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MutedBadge size="S" tone={v.severity === 'error' ? 'danger' : 'warning'}>
                  {v.severity === 'error' ? '오류' : '경고'}
                </MutedBadge>
                <span style={{ fontSize: 13, color: CM.text }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {isPass && (
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${CM.cardBorder}` }}>
          <div style={{ fontSize: 13, color: CM.textSecondary, marginBottom: 10 }}>모든 브랜드 가이드라인을 준수합니다. DAM에 업로드할 수 있습니다.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="accent" size="S" onPress={() => setShowDamSuggest(true)} isDisabled={showDamSuggest}>DAM 경로 추천</Button>
            <Button variant="secondary" size="S" onPress={() => setShowDamPicker(true)}>DAM 경로 직접 선택</Button>
          </div>
        </div>
      )}
      {showDamSuggest && damCard && (
        <div style={{ padding: '0 18px 16px' }}>
          <DamPathSuggestCard card={damCard} />
        </div>
      )}
      {showDamPicker && (
        <AemDamPickerDialog
          onSelect={path => { setPickedPath(path); setShowDamPicker(false); }}
          onClose={() => setShowDamPicker(false)}
        />
      )}
      {pickedPath && (
        <div style={{ padding: '8px 18px 14px', fontSize: 12, color: CM.success, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📁</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pickedPath}</span>
          <span style={{ color: CM.textMuted, fontFamily: 'inherit' }}>경로 선택됨</span>
        </div>
      )}
      {isWarn && (
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${CM.cardBorder}`, display: 'flex', gap: 8 }}>
          {!actioned ? (
            <>
              <Button variant="accent" size="S" onPress={() => { setActioned(true); onProceed?.(card.assetName); }}>그래도 진행</Button>
              <Button variant="secondary" size="S" onPress={() => { setActioned(true); onFix?.(card.assetName); }}>AI 자동 수정</Button>
            </>
          ) : (
            <MutedBadge tone="warning">처리 중…</MutedBadge>
          )}
        </div>
      )}
      {!isPass && !isWarn && (
        <div style={{ padding: '12px 18px', borderTop: `1px solid ${CM.cardBorder}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          {!actioned ? (
            <Button variant="accent" size="S" onPress={() => { setActioned(true); onFix?.(card.assetName); }}>AI 자동 수정 시도</Button>
          ) : (
            <MutedBadge tone="danger">자동 수정 중…</MutedBadge>
          )}
          <span style={{ fontSize: 11, color: CM.danger, marginLeft: 4 }}>업로드가 차단되었습니다</span>
        </div>
      )}
    </div>
  );
}

function GenerationPreviewCard({
  card,
  onSelect,
}: {
  card: ToolCard & { kind: 'generation_preview' };
  onSelect: (src: string, promptAdj: string) => void;
}) {
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
  const filters = ['none', 'saturate(1.3) hue-rotate(10deg)', 'saturate(0.8) brightness(1.1)', 'contrast(1.1) hue-rotate(-15deg)'];

  return (
    <div>
      <div style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 10 }}>
        생성 완료 · 4개 후보 — 원하는 이미지를 선택하세요
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {card.candidates.map((c, i) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.src, c.promptAdj)}
            style={{
              border: `1px solid ${CM.cardBorder}`,
              borderRadius: 8,
              overflow: 'hidden',
              padding: 0,
              background: CM.panelBg,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'box-shadow 0.15s',
              boxShadow: CM.cardShadow,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(15,23,42,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = CM.cardShadow; }}
          >
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#F3F4F6', overflow: 'hidden' }}>
              {!imgErrs[c.id] ? (
                <img
                  src={c.src}
                  alt={`후보 ${i + 1}`}
                  onError={() => setImgErrs(prev => ({ ...prev, [c.id]: true }))}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: filters[i] ?? 'none' }}
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: CM.textMuted }}>🖼</div>
              )}
            </div>
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, color: CM.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.promptAdj}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterCard({
  card,
  onApprove,
  onRequestChange,
}: {
  card: ToolCard & { kind: 'before_after' };
  onApprove: (assetName: string) => void;
  onRequestChange?: (assetName: string, note: string) => void;
}) {
  const [beforeErr, setBeforeErr] = useState(false);
  const [afterErr, setAfterErr] = useState(false);
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [showChangeReq, setShowChangeReq] = useState(false);
  const [changeNote, setChangeNote] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  const scoreDiff = card.scoreAfter - card.scoreBefore;

  return (
    <div style={{ border: `1px solid ${CM.cardBorder}`, borderRadius: 12, overflow: 'hidden', background: CM.panelBg, boxShadow: CM.cardShadow }}>
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${CM.cardBorder}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: CM.text }}>AI 자동 수정 결과</span>
        <span style={{ fontSize: 12, color: CM.textMuted }}>— {card.assetName}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ padding: 16, borderRight: `1px solid ${CM.cardBorder}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: CM.danger, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>수정 전</div>
          <div style={{ width: '100%', aspectRatio: '1', background: '#F3F4F6', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
            {!beforeErr ? (
              <img src={card.before} alt="수정 전" onError={() => setBeforeErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: CM.textMuted }}>🖼</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: CM.textMuted }}>브랜드 점수</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: CM.danger }}>{card.scoreBefore}</span>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: CM.success, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>수정 후</div>
          <div style={{ width: '100%', aspectRatio: '1', background: '#F3F4F6', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
            {!afterErr ? (
              <img
                src={card.after}
                alt="수정 후"
                onError={() => setAfterErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: CM.textMuted }}>✓</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: CM.textMuted }}>브랜드 점수</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: CM.success }}>{card.scoreAfter}</span>
            <span style={{ fontSize: 11, color: CM.success }}>+{scoreDiff}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${CM.cardBorder}` }}>
        {showChangeReq ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              placeholder="수정 사항을 구체적으로 입력하세요…"
              rows={2}
              style={{
                border: `1px solid ${CM.inputBorder}`,
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 13,
                resize: 'none',
                fontFamily: 'inherit',
                color: CM.text,
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box' as const,
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                variant="accent"
                size="S"
                onPress={() => {
                  if (changeNote.trim()) {
                    onRequestChange?.(card.assetName, changeNote.trim());
                    setRequestSent(true);
                    setShowChangeReq(false);
                  }
                }}
              >
                전송
              </Button>
              <Button variant="secondary" size="S" onPress={() => setShowChangeReq(false)}>취소</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' as const }}>
            {approved ? (
              <MutedBadge tone="success">승인 완료 · 거버넌스 재검사 중…</MutedBadge>
            ) : rejected ? (
              <MutedBadge tone="danger">거절됨</MutedBadge>
            ) : requestSent ? (
              <MutedBadge tone="warning">수정 요청 전송됨</MutedBadge>
            ) : (
              <>
                <Button variant="accent" size="S" onPress={() => { setApproved(true); onApprove(card.assetName); }}>승인 & 업로드</Button>
                <Button variant="secondary" size="S" onPress={() => setShowChangeReq(true)}>수정 요청</Button>
                <Button variant="secondary" size="S" onPress={() => setRejected(true)}>거절</Button>
              </>
            )}
            <div style={{ marginLeft: 'auto', fontSize: 11, color: CM.textMuted }}>
              위반: {card.violations.join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DamPathSuggestCard({ card }: { card: ToolCard & { kind: 'dam_path_suggest' } }) {
  const allPaths = [card.suggestedPath, ...card.alternatives];
  const [selectedPath, setSelectedPath] = useState(card.suggestedPath);
  const [fileName, setFileName] = useState(card.suggestedFileName);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSave = () => {
    setUploadState('uploading');
    setUploadProgress(0);
    let prog = 0;
    const tick = () => {
      prog += Math.random() * 18 + 8;
      if (prog >= 100) {
        setUploadProgress(100);
        setTimeout(() => setUploadState('done'), 400);
      } else {
        setUploadProgress(prog);
        setTimeout(tick, 180);
      }
    };
    setTimeout(tick, 100);
  };

  return (
    <div style={{ border: `1px solid ${CM.cardBorder}`, borderRadius: 12, background: CM.panelBg, boxShadow: CM.cardShadow, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 18px', borderBottom: `1px solid ${CM.cardBorder}`, background: CM.successBg, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>📁</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: CM.success }}>DAM 저장 경로 추천</span>
        <span style={{ fontSize: 12, color: CM.textMuted, marginLeft: 'auto' }}>{card.assetName}</span>
      </div>

      <div style={{ padding: '14px 18px' }}>
        {/* Path selection */}
        <div style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 6, fontWeight: 600 }}>추천 경로</div>
        {allPaths.slice(0, 1).map(p => (
          <PathRow key={p} path={p} selected={selectedPath === p} isRecommended onClick={() => setSelectedPath(p)} disabled={uploadState !== 'idle'} />
        ))}

        {card.alternatives.length > 0 && (
          <>
            <div style={{ fontSize: 12, color: CM.textMuted, margin: '10px 0 6px', fontWeight: 500 }}>대안 경로</div>
            {card.alternatives.map(p => (
              <PathRow key={p} path={p} selected={selectedPath === p} onClick={() => setSelectedPath(p)} disabled={uploadState !== 'idle'} />
            ))}
          </>
        )}

        {/* File name */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 5, fontWeight: 600 }}>저장 파일명</div>
          <input
            type="text"
            value={fileName}
            onChange={e => setFileName(e.target.value)}
            disabled={uploadState !== 'idle'}
            style={{
              width: '100%',
              border: `1px solid ${CM.inputBorder}`,
              borderRadius: 7,
              padding: '7px 10px',
              fontSize: 12,
              fontFamily: 'monospace',
              color: CM.text,
              outline: 'none',
              background: uploadState !== 'idle' ? CM.mainBg : CM.panelBg,
              boxSizing: 'border-box' as const,
            }}
          />
          <div style={{ fontSize: 11, color: CM.textMuted, marginTop: 4 }}>
            전체 경로: <span style={{ fontFamily: 'monospace' }}>{selectedPath} / {fileName}</span>
          </div>
        </div>

        {/* Action area */}
        <div style={{ marginTop: 14 }}>
          {uploadState === 'idle' && (
            <Button variant="accent" size="S" onPress={handleSave}>확인 & DAM 저장</Button>
          )}
          {uploadState === 'uploading' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 12, color: CM.textSecondary }}>DAM 업로드 중…</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: CM.primaryBlue }}>{Math.round(uploadProgress)}%</div>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${CM.primaryBlue}, ${CM.accentViolet})`,
                    transition: 'width 0.18s ease-out',
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: CM.textMuted, fontFamily: 'monospace' }}>
                {selectedPath} / {fileName}
              </div>
            </div>
          )}
          {uploadState === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: CM.success,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, flexShrink: 0,
                }}>✓</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: CM.success }}>DAM 저장 완료</span>
              </div>
              <div style={{
                background: CM.successBg,
                border: `1px solid #A7F3D0`,
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: CM.success,
              }}>
                📁 {selectedPath} / {fileName}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PathRow({
  path, selected, isRecommended, onClick, disabled,
}: {
  path: string;
  selected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 12px',
        marginBottom: 5,
        border: selected ? `1px solid #6EE7B7` : `1px solid ${CM.cardBorder}`,
        borderRadius: 8,
        background: selected ? CM.successBg : CM.mainBg,
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left' as const,
        transition: 'background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={e => {
        if (!disabled && !selected) {
          (e.currentTarget as HTMLElement).style.background = '#F0FDF4';
          (e.currentTarget as HTMLElement).style.borderColor = '#A7F3D0';
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.background = CM.mainBg;
          (e.currentTarget as HTMLElement).style.borderColor = CM.cardBorder;
        }
      }}
    >
      <span style={{ fontSize: 13, flexShrink: 0 }}>📁</span>
      <span style={{
        fontSize: 13,
        fontWeight: selected ? 700 : 500,
        color: selected ? CM.success : CM.textSecondary,
        fontFamily: 'monospace',
        flex: 1,
      }}>
        {path}
      </span>
      {isRecommended && (
        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: CM.success,
          background: '#D1FAE5',
          borderRadius: 4,
          padding: '2px 6px',
          flexShrink: 0,
          letterSpacing: '0.03em',
        }}>추천</span>
      )}
    </button>
  );
}

// ── AEM DAM Path Picker Dialog ────────────────────────────────────────────────

type DamTreeNode = { path: string; label: string; children: DamTreeNode[] };

const AEM_DAM_TREE: DamTreeNode[] = [
  { path: '/content/dam/marketing/2026/summer/social', label: 'summer / social', children: [] },
  { path: '/content/dam/marketing/2026/summer/banner', label: 'summer / banner', children: [] },
  { path: '/content/dam/marketing/2026/winter/social', label: 'winter / social', children: [] },
  { path: '/content/dam/marketing/2026/winter/banner', label: 'winter / banner', children: [] },
  { path: '/content/dam/marketing/brand/core', label: 'brand / core', children: [] },
  { path: '/content/dam/marketing/brand/guidelines', label: 'brand / guidelines', children: [] },
  { path: '/content/dam/campaigns/2026-Q2/social', label: 'campaigns / 2026-Q2 / social', children: [] },
  { path: '/content/dam/campaigns/2026-Q1/banner', label: 'campaigns / 2026-Q1 / banner', children: [] },
];

function AemDamPickerDialog({
  onSelect,
  onClose,
}: {
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: CM.panelBg,
        borderRadius: 14,
        boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
        width: 540,
        maxWidth: '90vw',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Dialog header */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${CM.cardBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 900 }}>A</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: CM.text }}>AEM — DAM 경로 선택</div>
            <div style={{ fontSize: 11, color: CM.textMuted }}>/content/dam/</div>
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: CM.textMuted, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Breadcrumb */}
        <div style={{ padding: '8px 20px', borderBottom: `1px solid ${CM.cardBorder}`, background: CM.mainBg, fontSize: 11, color: CM.textMuted, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: CM.primaryBlue, fontWeight: 600 }}>/content/dam</span>
          {selectedPath && (
            <>
              <span>›</span>
              <span style={{ color: CM.text }}>{selectedPath.replace('/content/dam/', '')}</span>
            </>
          )}
        </div>

        {/* Folder list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {AEM_DAM_TREE.map(node => {
            const isSelected = selectedPath === node.path;
            const isHovered = hoveredPath === node.path;
            return (
              <div
                key={node.path}
                onClick={() => setSelectedPath(node.path)}
                onMouseEnter={() => setHoveredPath(node.path)}
                onMouseLeave={() => setHoveredPath(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isSelected ? CM.infoBg : isHovered ? CM.mainBg : 'transparent',
                  border: isSelected ? `1px solid #BFDBFE` : '1px solid transparent',
                  marginBottom: 2,
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontSize: 16 }}>{isSelected ? '📂' : '📁'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? CM.primaryBlue : CM.text, fontFamily: 'monospace' }}>
                    {node.label}
                  </div>
                  <div style={{ fontSize: 10, color: CM.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {node.path}
                  </div>
                </div>
                {isSelected && <span style={{ fontSize: 14, color: CM.primaryBlue, flexShrink: 0 }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${CM.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: CM.mainBg,
        }}>
          <div style={{ flex: 1, fontSize: 12, color: selectedPath ? CM.primaryBlue : CM.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selectedPath ?? '경로를 선택하세요'}
          </div>
          <Button
            variant="accent"
            size="S"
            isDisabled={!selectedPath}
            onPress={() => selectedPath && onSelect(selectedPath)}
          >
            선택
          </Button>
          <Button variant="secondary" size="S" onPress={onClose}>취소</Button>
        </div>
      </div>
    </div>
  );
}

// ── ToolCard Dispatcher ───────────────────────────────────────────────────────

function ToolCardRenderer({
  card,
  assetActions,
  onFix,
  onApprove,
  onGenerationSelect,
  onGovernanceProceed,
  onGovernanceFix,
  onRequestChange,
}: {
  card: ToolCard;
  assetActions: AssetCardActions;
  onFix: (assetId: string) => void;
  onApprove: (assetName: string) => void;
  onGenerationSelect: (src: string, promptAdj: string) => void;
  onGovernanceProceed?: (assetName: string) => void;
  onGovernanceFix?: (assetName: string) => void;
  onRequestChange?: (assetName: string, note: string) => void;
}) {
  if (card.kind === 'asset_grid') return <AssetGridCard card={card} actions={assetActions} />;
  if (card.kind === 'asset_detail') return <AssetDetailCard card={card} onFix={onFix} />;
  if (card.kind === 'governance_report') {
    return <GovernanceReportCard card={card} onProceed={onGovernanceProceed} onFix={onGovernanceFix} />;
  }
  if (card.kind === 'generation_preview') return <GenerationPreviewCard card={card} onSelect={onGenerationSelect} />;
  if (card.kind === 'before_after') {
    return <BeforeAfterCard card={card} onApprove={onApprove} onRequestChange={onRequestChange} />;
  }
  if (card.kind === 'dam_path_suggest') return <DamPathSuggestCard card={card} />;
  return null;
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: CopilotMessage & { role: 'user' } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 8, alignItems: 'flex-end' }}>
      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        {msg.attachment && (
          <div style={{ borderRadius: '12px 12px 4px 12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', maxWidth: 280, width: '100%' }}>
            <img
              src={msg.attachment.src}
              alt={msg.attachment.name}
              style={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'cover' }}
            />
            <div style={{ background: '#DBEAFE', padding: '5px 10px', fontSize: 11, color: CM.primaryBlue, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>📎</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.attachment.name}</span>
            </div>
          </div>
        )}
        {msg.text && (
          <div
            style={{
              background: CM.userBubbleBg,
              color: CM.userBubbleText,
              borderRadius: msg.attachment ? '12px 12px 4px 12px' : '16px 16px 4px 16px',
              padding: '10px 14px',
              fontSize: 14,
              lineHeight: 1.5,
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}

function AssistantMessage({
  msg, assetActions, onFix, onApprove, onGenerationSelect,
  onGovernanceProceed, onGovernanceFix, onRequestChange,
}: {
  msg: CopilotMessage & { role: 'assistant' };
  assetActions: AssetCardActions;
  onFix: (assetId: string) => void;
  onApprove: (assetName: string) => void;
  onGenerationSelect: (src: string, promptAdj: string) => void;
  onGovernanceProceed?: (assetName: string) => void;
  onGovernanceFix?: (assetName: string) => void;
  onRequestChange?: (assetName: string, note: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${CM.assistantAvatar}, ${CM.accentViolet})`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        marginTop: 2,
      }}>
        ✦
      </div>
      {/* Content — full width */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.kind === 'error' && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: CM.danger }}>
            {msg.text ?? '오류가 발생했습니다.'}
          </div>
        )}
        {msg.kind === 'text' && msg.text && (
          <div style={{ fontSize: 14, color: CM.text, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
        )}
        {msg.kind === 'tool_card' && msg.card && (
          <div>
            {msg.text && (
              <div style={{ fontSize: 14, color: CM.text, lineHeight: 1.65, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            )}
            <ToolCardRenderer
              card={msg.card}
              assetActions={assetActions}
              onFix={onFix}
              onApprove={onApprove}
              onGenerationSelect={onGenerationSelect}
              onGovernanceProceed={onGovernanceProceed}
              onGovernanceFix={onGovernanceFix}
              onRequestChange={onRequestChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `linear-gradient(135deg, ${CM.assistantAvatar}, ${CM.accentViolet})`,
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
      }}>✦</div>
      <div style={{ flex: 1, paddingTop: 6 }}>
        <ProgressBar label="응답 생성 중…" isIndeterminate size="S" />
      </div>
    </div>
  );
}

// ── Starter Prompts ───────────────────────────────────────────────────────────

const PROMPT_ICONS = ['🔍', '🎨', '✨', '📊', '📐', '📝'];

function StarterPrompts({ onSelect }: { onSelect: (p: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', width: '100%', maxWidth: 600 }}>
      {/* Row 1: Search & Fix */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {COPILOT_STARTER_PROMPTS.slice(0, 3).map((p, i) => (
          <StarterChip key={p} icon={PROMPT_ICONS[i]} label={p} onSelect={onSelect} />
        ))}
      </div>
      {/* Row 2: Generate & Misc */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {COPILOT_STARTER_PROMPTS.slice(3).map((p, i) => (
          <StarterChip key={p} icon={PROMPT_ICONS[3 + i]} label={p} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function StarterChip({ icon, label, onSelect }: { icon: string; label: string; onSelect: (p: string) => void }) {
  return (
    <button
      onClick={() => onSelect(label)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: CM.panelBg,
        border: `1px solid ${CM.chipBorder}`,
        borderRadius: 10,
        padding: '8px 14px',
        fontSize: 13,
        color: CM.text,
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s',
        lineHeight: 1.4,
        textAlign: 'left' as const,
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = CM.infoBg;
        el.style.borderColor = '#BFDBFE';
        el.style.boxShadow = '0 2px 6px rgba(29,78,216,0.10)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = CM.panelBg;
        el.style.borderColor = CM.chipBorder;
        el.style.boxShadow = '0 1px 2px rgba(15,23,42,0.04)';
      }}
    >
      <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ── Session Sidebar ───────────────────────────────────────────────────────────

function SessionSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        width: SESSION_SIDEBAR_W,
        flexShrink: 0,
        borderRight: `1px solid ${CM.cardBorder}`,
        backgroundColor: CM.panelBg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 12px 10px', borderBottom: `1px solid ${CM.cardBorder}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: CM.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
          대화 기록
        </div>
        <button
          onClick={onNew}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 10px',
            background: CM.infoBg,
            border: `1px solid #BFDBFE`,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: CM.primaryBlue,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#DBEAFE'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = CM.infoBg; }}
        >
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#DBEAFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1H3C2.44772 1 2 1.44772 2 2V10C2 10.5523 2.44772 11 3 11H6.5L8 13.5L9.5 11H13C13.5523 11 14 10.5523 14 10V2C14 1.44772 13.5523 1 13 1Z" fill="#1D4ED8"/>
            </svg>
          </div>
          <span>새 대화 시작</span>
        </button>
      </div>

      {/* Session list */}
      <SessionList sessions={sessions} activeId={activeId} onSelect={onSelect} onDelete={onDelete} />
    </div>
  );
}

function SessionList({ sessions, activeId, onSelect, onDelete }: {
  sessions: ChatSession[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
        {sessions.length === 0 && (
          <div style={{ padding: '20px 8px', fontSize: 12, color: CM.textMuted, textAlign: 'center' }}>
            아직 대화 기록이 없습니다.
          </div>
        )}
        {sessions.map(s => {
          const isActive = s.id === activeId;
          const isHovered = s.id === hoveredId;
          return (
            <div
              key={s.id}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                borderRadius: 8,
                marginBottom: 2,
                background: isActive ? CM.activeNav : isHovered ? CM.mainBg : 'transparent',
                borderLeft: isActive ? `3px solid ${CM.primaryBlue}` : '3px solid transparent',
                transition: 'background 0.12s',
              }}
            >
              <button
                onClick={() => onSelect(s.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 10px',
                  paddingRight: isHovered ? 30 : 10,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  borderRadius: 8,
                }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 500,
                  color: CM.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  maxWidth: SESSION_SIDEBAR_W - 48,
                }}>
                  {s.title || '새 대화'}
                </span>
                <span style={{ fontSize: 11, color: CM.textMuted }}>{relativeTime(s.updatedAt)}</span>
              </button>

              {/* Delete button — hover only */}
              {isHovered && (
                <button
                  onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                  title="대화 삭제"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 6,
                    transform: 'translateY(-50%)',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#E5E7EB',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    color: CM.textSecondary,
                    flexShrink: 0,
                    transition: 'background 0.12s, color 0.12s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = '#FEE2E2';
                    el.style.color = '#DC2626';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = '#E5E7EB';
                    el.style.color = CM.textSecondary;
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AssetsCopilot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<CopilotSession>(emptyCopilotSession());
  const [attachedFile, setAttachedFile] = useState<{ src: string; name: string } | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => uid());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoringRef = useRef(false);

  // Restore sessions from localStorage on mount, load latest session
  useEffect(() => {
    const stored = loadSessions();
    setSessions(stored);
    if (stored.length > 0) {
      restoringRef.current = true;
      const latest = stored[0];
      setActiveSessionId(latest.id);
      setMessages(latest.messages);
      setSession(latest.copilotSession);
    }
  }, []);

  // Persist current session when messages change
  useEffect(() => {
    if (restoringRef.current) {
      restoringRef.current = false;
      return;
    }
    if (messages.length === 0) return;
    const firstUserText = messages.find(m => m.role === 'user')?.text ?? '';
    const title = firstUserText.length > 28 ? firstUserText.slice(0, 28) + '…' : firstUserText || '새 대화';
    setSessions(prev => {
      const updated: ChatSession = { id: activeSessionId, title, messages, copilotSession: session, updatedAt: Date.now() };
      const others = prev.filter(s => s.id !== activeSessionId);
      const next = [updated, ...others];
      saveSessions(next);
      return next;
    });
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewSession = useCallback(() => {
    setMessages([]);
    setSession(emptyCopilotSession());
    setInput('');
    setAttachedFile(null);
    setActiveSessionId(uid());
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    const s = loadSessions().find(s => s.id === id);
    if (!s) return;
    restoringRef.current = true;
    setActiveSessionId(s.id);
    setMessages(s.messages);
    setSession(s.copilotSession);
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveSessions(next);
      return next;
    });
    if (id === activeSessionId) {
      const remaining = loadSessions().filter(s => s.id !== id);
      if (remaining.length > 0) {
        const latest = remaining[0];
        restoringRef.current = true;
        setActiveSessionId(latest.id);
        setMessages(latest.messages);
        setSession(latest.copilotSession);
      } else {
        setMessages([]);
        setSession(emptyCopilotSession());
        setActiveSessionId(uid());
      }
    }
  }, [activeSessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  function addMessage(msg: CopilotMessage) {
    setMessages(prev => [...prev, msg]);
  }

  const handleSelectAsset = useCallback((assetId: string) => {
    setSession(prev => ({ ...prev, selectedAssetId: assetId }));
    navigate(`/assets/${assetId}`);
  }, [navigate]);

  const handleSimilarSearch = useCallback((assetId: string) => {
    const asset = ASSETS.find(a => a.id === assetId);
    if (!asset) return;
    const userText = `"${asset.name}"과 유사한 이미지 찾아줘`;
    addMessage({ id: uid(), role: 'user', kind: 'text', text: userText, ts: Date.now() });
    setIsLoading(true);
    const newIntent = { ...session.searchIntent, referenceAssetId: assetId, textQuery: userText };
    const { card, updatedSession } = mockSearchCard(newIntent, { ...session, searchIntent: newIntent });
    setTimeout(() => {
      addMessage({
        id: uid(),
        role: 'assistant',
        kind: 'tool_card',
        text: `**${asset.name}**과 유사한 에셋 **${card.totalCount}건**을 찾았습니다.`,
        card,
        ts: Date.now(),
      });
      setIsLoading(false);
      setSession(updatedSession);
    }, MOCK_AI_MS);
  }, [session]);

  const handleDamNavigate = useCallback((assetId: string) => {
    navigate(`/assets/${assetId}`);
  }, [navigate]);

  const handleFix = useCallback((assetId: string) => {
    const asset = ASSETS.find(a => a.id === assetId);
    if (!asset) return;
    const fixEntry = { assetId, assetName: asset.name, violations: ['색상 톤', '로고 여백'], scoreBefore: asset.brandScore, scoreAfter: Math.min(100, asset.brandScore + 43) };
    setIsLoading(true);
    setTimeout(() => {
      const card = mockBeforeAfter(fixEntry);
      addMessage({
        id: uid(),
        role: 'assistant',
        kind: 'tool_card',
        text: `AI가 **${asset.name}**의 브랜드 위반 항목을 자동 수정했습니다. 결과를 확인하고 승인해 주세요.`,
        card,
        ts: Date.now(),
      });
      setIsLoading(false);
    }, MOCK_AI_MS);
  }, []);

  const handleApprove = useCallback((assetName: string) => {
    setSession(prev => ({ ...prev, lastApprovedAsset: assetName }));
    setIsLoading(true);
    setTimeout(() => {
      addMessage({
        id: uid(),
        role: 'assistant',
        kind: 'tool_card',
        text: `수정된 **${assetName}**의 거버넌스를 재검사합니다. DAM 경로 추천 버튼을 눌러 저장 경로를 확인하세요.`,
        card: mockGovernanceReport(assetName, 'pass'),
        ts: Date.now(),
      });
      setIsLoading(false);
    }, MOCK_AI_MS);
  }, []);

  const handleGenerationSelect = useCallback((_src: string, promptAdj: string) => {
    const assetName = `generated_${Date.now()}.png`;
    setIsLoading(true);
    setTimeout(() => {
      addMessage({
        id: uid(),
        role: 'assistant',
        kind: 'tool_card',
        text: `선택한 이미지를 거버넌스 검사합니다. DAM 경로 추천 버튼을 눌러 저장 경로를 확인하세요.\n\n프롬프트: ${promptAdj.slice(0, 80)}`,
        card: mockGovernanceReport(assetName, 'pass'),
        ts: Date.now(),
      });
      setIsLoading(false);
    }, MOCK_AI_MS);
  }, []);

  const handleGovernanceProceed = useCallback((assetName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      addMessage({
        id: uid(),
        role: 'assistant',
        kind: 'tool_card',
        text: `**${assetName}**의 DAM 저장 경로를 추천드립니다.`,
        card: mockDamPathSuggest(assetName),
        ts: Date.now(),
      });
      setIsLoading(false);
    }, 800);
  }, []);

  const handleGovernanceFix = useCallback((assetName: string) => {
    const asset = ASSETS.find(a => a.name === assetName) ?? ASSETS[0];
    handleFix(asset.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestChange = useCallback((assetName: string, note: string) => {
    addMessage({
      id: uid(),
      role: 'assistant',
      kind: 'text',
      text: `수정 요청이 전달되었습니다.\n\n**${assetName}** — 요청 내용:\n"${note}"\n\nAI가 반영하여 재수정 후 결과를 보내드리겠습니다.`,
      ts: Date.now(),
    });
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text && !attachedFile) return;
    if (isLoading) return;

    const userMsg: CopilotMessage = {
      id: uid(),
      role: 'user',
      kind: attachedFile ? 'attachment' : 'text',
      text: text || undefined,
      attachment: attachedFile ?? undefined,
      ts: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    // Parse intent
    const hasAttachment = !!attachedFile;
    const intent = parseCopilotIntent(text, session, hasAttachment);

    setTimeout(() => {
      let assistantMsg: CopilotMessage | null = null;

      if (intent.type === 'summary') {
        const searchCount = session.lastSearchResults.length;
        const selectedAsset = session.selectedAssetId ? ASSETS.find(a => a.id === session.selectedAssetId) : null;
        const lines: string[] = ['**지금까지의 대화 요약**\n'];
        if (session.lastIntent) {
          const typeLabel: Record<string, string> = {
            search: '에셋 검색', fix: 'AI 자동 수정', generate: '이미지 생성',
            governance_check: '거버넌스 체크', inspect: '에셋 상세 조회',
          };
          lines.push(`• 마지막 작업: **${typeLabel[session.lastIntent.type] ?? session.lastIntent.type}**`);
        }
        if (searchCount > 0) lines.push(`• 마지막 검색 결과: **${searchCount}건**`);
        if (selectedAsset) lines.push(`• 선택된 에셋: **${selectedAsset.name}**`);
        if (session.lastApprovedAsset) lines.push(`• 승인된 에셋: **${session.lastApprovedAsset}**`);
        if (lines.length === 1) lines.push('아직 검색·생성·수정 작업이 없습니다. 에셋 검색이나 이미지 생성을 시작해 보세요.');
        assistantMsg = { id: uid(), role: 'assistant', kind: 'text', text: lines.join('\n'), ts: Date.now() };
      } else if (intent.type === 'search') {
        // Detect brand score filter encoded in textQuery by parseCopilotIntent
        const scoreMarkerMatch = intent.slots.textQuery.match(/^\[score<(\d+)\]/);
        const scoreThreshold = scoreMarkerMatch ? parseInt(scoreMarkerMatch[1], 10) : null;
        const cleanSlots = scoreThreshold !== null
          ? { ...intent.slots, textQuery: intent.slots.textQuery.replace(/^\[score<\d+\]\s*/, '') }
          : intent.slots;

        const { card: rawCard, updatedSession } = mockSearchCard(cleanSlots, session);
        const card = scoreThreshold !== null
          ? {
              ...rawCard,
              assets: rawCard.assets.filter(a => a.brandScore < scoreThreshold),
              totalCount: rawCard.assets.filter(a => a.brandScore < scoreThreshold).length,
              intentSummary: `${rawCard.intentSummary} · 브랜드 점수 ${scoreThreshold} 미만`,
            }
          : rawCard;
        setSession(updatedSession);
        const filterNote = scoreThreshold !== null ? ` (브랜드 점수 **${scoreThreshold} 미만** 필터 적용)` : '';
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'tool_card',
          text: card.totalCount > 0
            ? `조건에 맞는 에셋 **${card.totalCount}건**을 찾았습니다.${filterNote}`
            : `조건에 맞는 에셋이 없습니다.${filterNote} 다른 검색어나 필터를 시도해 보세요.`,
          card,
          ts: Date.now(),
        };
      } else if (intent.type === 'inspect') {
        const asset = ASSETS.find(a => a.id === intent.slots.assetId);
        if (asset) {
          setSession(prev => ({ ...prev, selectedAssetId: asset.id }));
          assistantMsg = {
            id: uid(),
            role: 'assistant',
            kind: 'tool_card',
            text: `**${asset.name}** 상세 정보입니다.`,
            card: { kind: 'asset_detail', asset },
            ts: Date.now(),
          };
        }
      } else if (intent.type === 'fix') {
        const card = mockBeforeAfter(intent.slots);
        setSession(prev => ({ ...prev, selectedAssetId: intent.slots.assetId, lastIntent: intent }));
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'tool_card',
          text: `AI가 **${intent.slots.assetName}**의 브랜드 위반 항목을 자동 수정했습니다.\n위반: ${intent.slots.violations.join(', ')}\n브랜드 점수: ${intent.slots.scoreBefore} → ${intent.slots.scoreAfter}`,
          card,
          ts: Date.now(),
        };
      } else if (intent.type === 'generate') {
        const card = mockGenerationPreview(intent.slots.prompt);
        setSession(prev => ({ ...prev, lastIntent: intent }));
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'tool_card',
          text: `**${intent.slots.width}×${intent.slots.height}** 이미지 4개를 생성했습니다. 원하는 후보를 선택하면 DAM에 저장하거나 Studio에서 추가 편집할 수 있습니다.`,
          card,
          ts: Date.now(),
        };
      } else if (intent.type === 'governance_check') {
        const fileName = attachedFile?.name ?? '업로드 이미지';
        const card = mockGovernanceReport(fileName);
        setSession(prev => ({ ...prev, lastIntent: intent }));
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'tool_card',
          text: `**${fileName}** 거버넌스 검사 결과입니다.`,
          card,
          ts: Date.now(),
        };
      } else if (intent.type === 'clarify') {
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'text',
          text: intent.question,
          ts: Date.now(),
        };
      }

      if (!assistantMsg) {
        assistantMsg = {
          id: uid(),
          role: 'assistant',
          kind: 'text',
          text: '죄송합니다, 요청을 이해하지 못했습니다. 다시 말씀해 주세요.',
          ts: Date.now(),
        };
      }

      addMessage(assistantMsg);
      setIsLoading(false);
    }, MOCK_AI_MS);
  }, [input, attachedFile, isLoading, session]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setAttachedFile({ src, name: file.name });
    e.target.value = '';
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: CM.mainBg }}>
      {/* Session history sidebar */}
      <SessionSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />

      {/* Chat area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

      {/* Scrollable message area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: isEmpty ? '0' : '24px 24px 0',
        }}
      >
        <div style={{ maxWidth: MAX_CONTENT_WIDTH, margin: '0 auto' }}>
          {isEmpty ? (
            // Welcome screen
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 280px)',
                gap: 24,
                textAlign: 'center',
                padding: '40px 24px',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${CM.assistantAvatar}, ${CM.accentViolet})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: '0 4px 16px rgba(29,78,216,0.25)',
                }}
              >
                ✦
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: CM.text, letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Assets Copilot
                </div>
                <div style={{ fontSize: 15, color: CM.textSecondary, lineHeight: 1.6, maxWidth: 500 }}>
                  에셋 검색 · 이미지 생성 · 브랜드 거버넌스 · AI 자동 수정을<br />
                  하나의 대화에서 경험해 보세요.
                </div>
              </div>
              <div style={{ fontSize: 12, color: CM.textMuted, letterSpacing: '0.04em', fontWeight: 600, textTransform: 'uppercase' as const }}>
                데모 시나리오 바로 시작하기
              </div>
              <StarterPrompts onSelect={p => { setInput(p); textareaRef.current?.focus(); }} />
            </div>
          ) : (
            // Messages
            <div style={{ paddingBottom: 24 }}>
              {messages.map(msg => {
                if (msg.role === 'user') return <UserBubble key={msg.id} msg={msg} />;
                return (
                  <AssistantMessage
                    key={msg.id}
                    msg={msg}
                    assetActions={{
                      onDetail: handleSelectAsset,
                      onSimilar: handleSimilarSearch,
                      onDam: handleDamNavigate,
                      onFix: handleFix,
                    }}
                    onFix={handleFix}
                    onApprove={handleApprove}
                    onGenerationSelect={handleGenerationSelect}
                    onGovernanceProceed={handleGovernanceProceed}
                    onGovernanceFix={handleGovernanceFix}
                    onRequestChange={handleRequestChange}
                  />
                );
              })}
              {isLoading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div
        style={{
          flexShrink: 0,
          borderTop: `1px solid ${CM.cardBorder}`,
          backgroundColor: CM.panelBg,
          padding: '16px 24px 20px',
        }}
      >
        <div style={{ maxWidth: MAX_CONTENT_WIDTH, margin: '0 auto' }}>
          {attachedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: CM.infoBg,
                border: `1px solid #BFDBFE`,
                borderRadius: 8,
                padding: '6px 12px',
                marginBottom: 8,
                fontSize: 12,
                color: CM.primaryBlue,
              }}
            >
              <span>📎 {attachedFile.name}</span>
              <button
                onClick={() => setAttachedFile(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: CM.primaryBlue, fontSize: 14, padding: '0 2px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              background: CM.panelBg,
              border: `1px solid ${CM.inputBorder}`,
              borderRadius: 12,
              padding: '10px 10px 10px 14px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
              transition: 'border-color 0.15s',
            }}
            onFocus={() => {}}
          >
            {/* Attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="이미지 첨부 (거버넌스 체크)"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: CM.textMuted,
                fontSize: 18,
                padding: '4px',
                lineHeight: 1,
                flexShrink: 0,
                transition: 'color 0.12s',
                alignSelf: 'flex-end',
                marginBottom: 2,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = CM.primaryBlue; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = CM.textMuted; }}
            >
              📎
            </button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="에셋 검색, 이미지 생성, 브랜드 체크 등 무엇이든 물어보세요…"
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: 14,
                color: CM.text,
                backgroundColor: 'transparent',
                lineHeight: 1.55,
                minHeight: 24,
                maxHeight: 160,
                overflowY: 'auto',
                fontFamily: 'inherit',
              }}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !attachedFile)}
              style={{
                background: isLoading || (!input.trim() && !attachedFile) ? '#E5E7EB' : CM.primaryBlue,
                border: 'none',
                borderRadius: 8,
                width: 36,
                height: 36,
                cursor: isLoading || (!input.trim() && !attachedFile) ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 15,
                flexShrink: 0,
                alignSelf: 'flex-end',
                transition: 'background 0.15s',
              }}
            >
              ↑
            </button>
          </div>
          <div style={{ fontSize: 11, color: CM.textMuted, textAlign: 'center', marginTop: 8 }}>
            Enter로 전송 · Shift+Enter로 줄바꿈 · 📎 이미지 첨부 시 거버넌스 자동 체크
          </div>
        </div>
      </div>

      </div> {/* end chat area */}
    </div>
  );
}
