import { Text, Button, Checkbox, TextField } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { MutedProgressBar } from '../components/MutedProgressBar';
import { useState, useRef, useCallback, useMemo } from 'react';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import {
  CAMPAIGNS,
  CAMPAIGN_TASKS,
  ASSETS,
  ASSET_VERSION_HISTORY,
  BRAND_KIT_ITEMS,
  SHARE_ACCESS_LOGS,
  REVIEW_COMMENTS,
  REVIEW_PINS,
  APPROVAL_KANBAN_SEED,
  type ApprovalKanbanCard,
  type ApprovalKanbanColumn,
} from '../data/mock';
import { BADGE_TOKENS } from '../theme/tokens';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS = [
  { id: 'F-4.1', label: '에셋 공유 포털' },
  { id: 'F-4.2', label: '리뷰 & 피드백' },
  { id: 'F-4.3', label: '버전 비교' },
  { id: 'F-4.4', label: '캠페인 워크스페이스' },
  { id: 'F-4.5', label: '승인 대시보드' },
] as const;

const REVIEWS = [
  { id: 'r1', asset: 'summer_banner_v3.png', reviewer: 'Kim', workflow: '검토 중', status: 'pending', submitted: '2시간 전' },
  { id: 'r2', asset: 'social_post_agency.jpg', reviewer: 'Park (Agency)', workflow: '수정 요청', status: 'changes', submitted: '5시간 전' },
  { id: 'r3', asset: 'email_header_final.png', reviewer: 'Lee', workflow: '승인', status: 'approved', submitted: '1일 전' },
  { id: 'r4', asset: 'product_shot_01.jpg', reviewer: 'Choi (Agency)', workflow: '검토 중', status: 'pending', submitted: '2일 전' },
];

const KANBAN_COLS: { key: ApprovalKanbanColumn; label: string }[] = [
  { key: 'unsubmitted', label: '미제출' },
  { key: 'in_review', label: '검토 중' },
  { key: 'changes', label: '수정 요청' },
  { key: 'approved', label: '승인됨' },
];

export default function Collaboration() {
  const [activeTab, setActiveTab] = useState(0);
  const [shareExpiry, setShareExpiry] = useState('2026-05-01');
  const [shareMaxDl, setShareMaxDl] = useState('25');
  const [sharePassword, setSharePassword] = useState('');
  const [shareIncludeKit, setShareIncludeKit] = useState(true);
  const [selectedForShare, setSelectedForShare] = useState<Set<string>>(() => new Set(['a1', 'a2']));
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const [comments, setComments] = useState(() => [...REVIEW_COMMENTS]);
  const [selectedReviewId, setSelectedReviewId] = useState('r1');

  const versionAssetId = useMemo(() => {
    const keys = Object.keys(ASSET_VERSION_HISTORY);
    return keys[0] ?? 'a1';
  }, []);
  const [compareAssetId, setCompareAssetId] = useState(versionAssetId);
  const versions = ASSET_VERSION_HISTORY[compareAssetId] ?? [];
  const [leftVid, setLeftVid] = useState(versions[1]?.versionId ?? '');
  const [rightVid, setRightVid] = useState(versions[0]?.versionId ?? '');
  const [compareMode, setCompareMode] = useState<'side' | 'overlay'>('side');
  const [wipePct, setWipePct] = useState(50);
  const scrollSync = useRef(false);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const onScrollSync = useCallback((source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollSync.current) return;
    const src = e.currentTarget;
    const target = source === 'left' ? rightScrollRef.current : leftScrollRef.current;
    if (!target) return;
    scrollSync.current = true;
    target.scrollTop = src.scrollTop;
    target.scrollLeft = src.scrollLeft;
    requestAnimationFrame(() => {
      scrollSync.current = false;
    });
  }, []);

  const leftRow = versions.find(v => v.versionId === leftVid);
  const rightRow = versions.find(v => v.versionId === rightVid);
  const compareAsset = ASSETS.find(a => a.id === compareAssetId);

  const [kanban, setKanban] = useState<ApprovalKanbanCard[]>(() => [...APPROVAL_KANBAN_SEED]);
  const [kanbanSelected, setKanbanSelected] = useState<Set<string>>(new Set());
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const assignees = useMemo(() => ['all', ...new Set(kanban.map(k => k.assignee))], [kanban]);

  const filteredKanban = useMemo(
    () => (assigneeFilter === 'all' ? kanban : kanban.filter(k => k.assignee === assigneeFilter)),
    [kanban, assigneeFilter]
  );

  const toggleShareAsset = (id: string) => {
    setSelectedForShare(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const generateShareLink = () => {
    const token = Math.random().toString(36).slice(2, 11);
    setGeneratedLink(`https://share.asset-mate.mock/p/${token}`);
  };

  const toggleCommentResolved = (id: string) => {
    setComments(prev => prev.map(c => (c.id === id ? { ...c, resolved: !c.resolved } : c)));
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDropCard = (col: ApprovalKanbanColumn) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    setKanban(prev => prev.map(k => (k.id === id ? { ...k, column: col } : k)));
  };

  const toggleKanbanSelect = (id: string) => {
    setKanbanSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const batchApprove = () => {
    if (kanbanSelected.size === 0) return;
    setKanban(prev => prev.map(k => (kanbanSelected.has(k.id) ? { ...k, column: 'approved' as const } : k)));
    setKanbanSelected(new Set());
  };

  const batchReject = () => {
    if (kanbanSelected.size === 0) return;
    setKanban(prev => prev.map(k => (kanbanSelected.has(k.id) ? { ...k, column: 'changes' as const } : k)));
    setKanbanSelected(new Set());
  };

  const reviewPins = REVIEW_PINS.filter(p => p.reviewId === selectedReviewId);
  const threadComments = comments.filter(c => c.reviewId === selectedReviewId);
  const selectedReview = REVIEWS.find(r => r.id === selectedReviewId);

  return (
    <>
      <PageHeader
        title="협업 & 승인"
        description="F-4.1~F-4.5: 공유 포털·리뷰·버전 비교·캠페인 워크스페이스·승인 대시보드 (목 데이터)"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
          {TABS.map((tab, i) =>
            activeTab === i ? (
              <AccentButton key={tab.id} size="S" onPress={() => setActiveTab(i)}>
                {tab.label}
              </AccentButton>
            ) : (
              <Button key={tab.id} variant="secondary" size="S" onPress={() => setActiveTab(i)}>
                {tab.label}
              </Button>
            )
          )}
        </div>

        {/* F-4.1 에셋 공유 포털 */}
        {activeTab === 0 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                공유 패키지 구성
              </Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 12 }}>
                에셋을 선택한 뒤 만료일·다운로드 한도·선택적 비밀번호로 공개 링크를 생성합니다. 에이전시는 AEM 계정 없이 링크로 미리보기·다운로드할 수 있습니다 (목업).
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 16 }}>
                {ASSETS.slice(0, 8).map(a => (
                  <label
                    key={a.id}
                    style={f({ gap: 8, alignItems: 'center', padding: 8, borderRadius: 8, border: `1px solid ${CM.cardBorder}`, cursor: 'pointer' })}
                  >
                    <Checkbox isSelected={selectedForShare.has(a.id)} onChange={() => toggleShareAsset(a.id)} />
                    <span style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                  </label>
                ))}
              </div>
              <div style={f({ gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 })}>
                <TextField label="만료일" value={shareExpiry} onChange={setShareExpiry} />
                <TextField label="최대 다운로드 횟수" value={shareMaxDl} onChange={setShareMaxDl} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>비밀번호 (선택)</Text>
                  <input
                    type="password"
                    value={sharePassword}
                    onChange={e => setSharePassword(e.target.value)}
                    autoComplete="new-password"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${CM.cardBorder}`,
                      fontSize: 14,
                      minWidth: 200,
                    }}
                  />
                </div>
                <label style={f({ gap: 8, alignItems: 'center', marginBottom: 4 })}>
                  <Checkbox isSelected={shareIncludeKit} onChange={setShareIncludeKit} />
                  <Text UNSAFE_style={{ fontSize: 13 }}>브랜드 킷 포함</Text>
                </label>
              </div>
              <AccentButton onPress={generateShareLink}>공유 링크 생성</AccentButton>
              {generatedLink && (
                <Text UNSAFE_style={{ fontSize: 13, color: CM.accentIndigo, marginTop: 12, display: 'block', wordBreak: 'break-all' }}>
                  {generatedLink}
                </Text>
              )}
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 12 }}>브랜드 킷</Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {BRAND_KIT_ITEMS.map(b => (
                  <div
                    key={b.id}
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${CM.cardBorder}`,
                      backgroundColor: CM.breadcrumbBg,
                    }}
                  >
                    <MutedBadge tone="info" size="S">
                      {b.kind}
                    </MutedBadge>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 6 }}>{b.name}</Text>
                    <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{b.format}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 12 }}>
                접근·다운로드 로그
              </Text>
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: `1px solid ${CM.cardBorder}` }}>
                      <th style={{ padding: '8px 6px' }}>시각</th>
                      <th style={{ padding: '8px 6px' }}>주체</th>
                      <th style={{ padding: '8px 6px' }}>동작</th>
                      <th style={{ padding: '8px 6px' }}>에셋</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHARE_ACCESS_LOGS.map(row => (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                        <td style={{ padding: '8px 6px', color: CM.textSecondary }}>{row.at}</td>
                        <td style={{ padding: '8px 6px' }}>{row.actor}</td>
                        <td style={{ padding: '8px 6px' }}>{row.action}</td>
                        <td style={{ padding: '8px 6px' }}>{row.asset}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, marginTop: 10, display: 'block' }}>
                버전 동기화: 원본이 갱신되면 구독 중인 에이전시에 인앱·메일 알림을 보냅니다 (연동 예정).
              </Text>
            </div>
          </div>
        )}

        {/* F-4.2 리뷰/피드백 루프 */}
        {activeTab === 1 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={f({ gap: 8, flexWrap: 'wrap' })}>
              <Button variant="secondary" size="S">
                전체
              </Button>
              <Button variant="secondary" size="S">
                대기 중 (2)
              </Button>
              <Button variant="secondary" size="S">
                수정요청 (1)
              </Button>
              <Button variant="secondary" size="S">
                승인 (1)
              </Button>
            </div>
            <div style={f({ gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' })}>
              <div style={f({ flexDirection: 'column', gap: 8, flex: 1, minWidth: 280 })}>
                {REVIEWS.map(r => (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedReviewId(r.id)}
                    onKeyDown={e => e.key === 'Enter' && setSelectedReviewId(r.id)}
                    style={{
                      ...card,
                      cursor: 'pointer',
                      padding: 16,
                      outline: selectedReviewId === r.id ? `2px solid ${CM.primaryBlue}` : undefined,
                    }}
                  >
                    <div style={f({ gap: 16, alignItems: 'center' })}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: CM.surfacePlaceholder,
                        }}
                      >
                        <SampleAssetImage filename={r.asset} />
                      </div>
                      <div style={f({ flexDirection: 'column', gap: 4, flex: 1 })}>
                        <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>{r.asset}</Text>
                        <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                          리뷰어: {r.reviewer} · {r.submitted}
                        </Text>
                        <MutedBadge tone="neutral" size="S">
                          워크플로: {r.workflow}
                        </MutedBadge>
                      </div>
                      <MutedBadge tone={r.status === 'approved' ? 'success' : r.status === 'changes' ? 'warning' : 'info'} size="S">
                        {r.status === 'approved' ? '승인' : r.status === 'changes' ? '수정요청' : '대기'}
                      </MutedBadge>
                      <div style={f({ gap: 8 })}>
                        <Button variant="secondary" size="S">
                          리뷰
                        </Button>
                        {r.status === 'pending' && <AccentButton size="S">승인</AccentButton>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedReview && (
                <div style={{ ...card, cursor: 'default', flex: 1, minWidth: 320, maxWidth: 520 }}>
                  <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                    비주얼 마크업 · 코멘트 ({selectedReview.asset})
                  </Text>
                  <div
                    style={{
                      position: 'relative',
                      borderRadius: 8,
                      overflow: 'hidden',
                      backgroundColor: CM.surfacePlaceholder,
                      aspectRatio: '16 / 9',
                      marginBottom: 12,
                    }}
                  >
                    <SampleAssetImage filename={selectedReview.asset} />
                    {reviewPins.map(p => (
                      <div
                        key={p.id}
                        title={`마크업 ${p.label}`}
                        style={{
                          position: 'absolute',
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          width: 28,
                          height: 28,
                          marginLeft: -14,
                          marginTop: -14,
                          borderRadius: '50%',
                          backgroundColor: CM.primaryBlue,
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                          cursor: 'default',
                        }}
                      >
                        {p.label}
                      </div>
                    ))}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 8, display: 'block' }}>
                    포인트별 스레드 — 해결 여부를 전환할 수 있습니다 (목업).
                  </Text>
                  <div style={f({ flexDirection: 'column', gap: 10 })}>
                    {threadComments.map(c => (
                      <div
                        key={c.id}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: `1px solid ${CM.cardBorder}`,
                          backgroundColor: c.resolved ? CM.successBg : CM.panelBg,
                          opacity: c.resolved ? 0.85 : 1,
                        }}
                      >
                        <div style={f({ justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 })}>
                          <Text UNSAFE_style={{ fontSize: 13 }}>{c.body}</Text>
                          <label style={f({ gap: 6, alignItems: 'center', flexShrink: 0 })}>
                            <Checkbox isSelected={c.resolved} onChange={() => toggleCommentResolved(c.id)} />
                            <span style={{ fontSize: 11, color: CM.textMuted }}>해결됨</span>
                          </label>
                        </div>
                        <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 6 }}>
                          {c.author} · {c.at}
                        </Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* F-4.3 버전 비교 */}
        {activeTab === 2 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={f({ gap: 12, flexWrap: 'wrap', alignItems: 'center' })}>
              <label style={f({ gap: 8, alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 13 }}>에셋</Text>
                <select
                  value={compareAssetId}
                  onChange={e => {
                    const id = e.target.value;
                    setCompareAssetId(id);
                    const vs = ASSET_VERSION_HISTORY[id] ?? [];
                    setLeftVid(vs[1]?.versionId ?? vs[0]?.versionId ?? '');
                    setRightVid(vs[0]?.versionId ?? '');
                  }}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, fontSize: 13 }}
                >
                  {Object.keys(ASSET_VERSION_HISTORY).map(id => (
                    <option key={id} value={id}>
                      {id} — {ASSETS.find(a => a.id === id)?.name ?? id}
                    </option>
                  ))}
                </select>
              </label>
              <label style={f({ gap: 8, alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 13 }}>좌측 버전</Text>
                <select
                  value={leftVid}
                  onChange={e => setLeftVid(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, fontSize: 13 }}
                >
                  {versions.map(v => (
                    <option key={v.versionId} value={v.versionId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={f({ gap: 8, alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 13 }}>우측 버전</Text>
                <select
                  value={rightVid}
                  onChange={e => setRightVid(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, fontSize: 13 }}
                >
                  {versions.map(v => (
                    <option key={v.versionId} value={v.versionId}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <div style={f({ gap: 8 })}>
                <Button variant={compareMode === 'side' ? 'accent' : 'secondary'} size="S" onPress={() => setCompareMode('side')}>
                  나란히
                </Button>
                <Button variant={compareMode === 'overlay' ? 'accent' : 'secondary'} size="S" onPress={() => setCompareMode('overlay')}>
                  오버레이
                </Button>
              </div>
            </div>

            {compareAsset && (
              <>
                {compareMode === 'side' ? (
                  <div style={f({ gap: 16, alignItems: 'stretch', flexWrap: 'wrap' })}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                        {leftRow?.label ?? '—'}
                      </Text>
                      <div
                        ref={leftScrollRef}
                        onScroll={onScrollSync('left')}
                        style={{
                          maxHeight: 360,
                          overflow: 'auto',
                          borderRadius: 8,
                          border: `1px solid ${CM.cardBorder}`,
                          position: 'relative',
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <SampleAssetImage filename={compareAsset.name} />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 12,
                              right: 12,
                              width: '28%',
                              height: '22%',
                              border: `2px dashed ${CM.warning}`,
                              backgroundColor: 'rgba(251, 191, 36, 0.15)',
                              pointerEvents: 'none',
                            }}
                            title="변경 영역 (mock 하이라이트)"
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>
                        {rightRow?.label ?? '—'}
                      </Text>
                      <div
                        ref={rightScrollRef}
                        onScroll={onScrollSync('right')}
                        style={{
                          maxHeight: 360,
                          overflow: 'auto',
                          borderRadius: 8,
                          border: `1px solid ${CM.cardBorder}`,
                          position: 'relative',
                        }}
                      >
                        <SampleAssetImage filename={compareAsset.name} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={f({ flexDirection: 'column', gap: 8, alignItems: 'stretch' })}>
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                      슬라이더로 위 레이어를 드러내 비교합니다 (동일 목 이미지 데모).
                    </Text>
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: `1px solid ${CM.cardBorder}`,
                        maxWidth: 720,
                      }}
                    >
                      <div style={{ opacity: 0.55 }}>
                        <SampleAssetImage filename={compareAsset.name} />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          clipPath: `inset(0 ${100 - wipePct}% 0 0)`,
                          pointerEvents: 'none',
                        }}
                      >
                        <SampleAssetImage filename={compareAsset.name} />
                      </div>
                    </div>
                    <label style={f({ gap: 12, alignItems: 'center', maxWidth: 400 })}>
                      <Text UNSAFE_style={{ fontSize: 12 }}>와이프 {wipePct}%</Text>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={wipePct}
                        onChange={e => setWipePct(Number(e.target.value))}
                        style={{ flex: 1 }}
                      />
                    </label>
                  </div>
                )}

                <div style={{ ...card, cursor: 'default' }}>
                  <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'block' }}>
                    메타데이터 비교
                  </Text>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                        <th style={{ textAlign: 'left', padding: 8 }}>항목</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>{leftRow?.label}</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>{rightRow?.label}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ['해상도', leftRow?.dim, rightRow?.dim],
                          ['파일 크기', leftRow?.size, rightRow?.size],
                          ['색 공간', leftRow?.colorProfile, rightRow?.colorProfile],
                          ['수정일', leftRow?.modified, rightRow?.modified],
                          ['작성자', leftRow?.author, rightRow?.author],
                          ['변경 사유', leftRow?.reason, rightRow?.reason],
                        ] as const
                      ).map(([label, a, b]) => (
                        <tr key={label} style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                          <td style={{ padding: 8, color: CM.textSecondary }}>{label}</td>
                          <td style={{ padding: 8 }}>{a}</td>
                          <td style={{ padding: 8 }}>{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* F-4.4 캠페인 워크스페이스 */}
        {activeTab === 3 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            {CAMPAIGNS.map(c => {
              const tasks = CAMPAIGN_TASKS.filter(t => t.campaignId === c.id);
              const campaignAssets = ASSETS.filter(a => a.campaign === c.name).slice(0, 6);
              return (
                <div key={c.id} style={{ ...card, cursor: 'default' }}>
                  <div style={f({ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 })}>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold', display: 'block' }}>{c.name}</Text>
                      <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, marginTop: 4, display: 'block' }}>
                        기간 {c.period} · 담당 {c.owner} · 채널 {c.channels.join(', ')}
                      </Text>
                    </div>
                    <MutedBadge tone={c.status === 'active' ? 'success' : 'info'} size="S">
                      {c.status === 'active' ? '진행 중' : '완료'}
                    </MutedBadge>
                  </div>
                  <MutedProgressBar value={c.progress} label={`진행률 ${c.progress}% · ${c.assets}개 에셋 · ${c.pending}건 대기`} />
                  <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8, display: 'block' }}>
                    타임라인 (요약)
                  </Text>
                  <div style={{ position: 'relative', height: 10, backgroundColor: CM.surfacePlaceholder, borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${c.progress}%`, height: '100%', backgroundColor: CM.primaryBlue, borderRadius: 6 }} />
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, marginTop: 6, display: 'block' }}>
                    간트·드래그 일정 조정은 추후 연동. 현재는 진행률 막대로 캠페인 구간을 표시합니다.
                  </Text>
                  <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8, display: 'block' }}>
                    태스크
                  </Text>
                  <div style={f({ flexDirection: 'column', gap: 8 })}>
                    {tasks.map(t => (
                      <div
                        key={t.id}
                        style={f({
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: `1px solid ${CM.cardBorder}`,
                          flexWrap: 'wrap',
                          gap: 8,
                        })}
                      >
                        <Text UNSAFE_style={{ fontSize: 13 }}>{t.title}</Text>
                        <div style={f({ gap: 8, alignItems: 'center' })}>
                          <MutedBadge
                            tone={t.status === 'done' ? 'success' : t.status === 'in_progress' ? 'accent' : 'neutral'}
                            size="S"
                          >
                            {t.status === 'done' ? '완료' : t.status === 'in_progress' ? '진행' : '대기'}
                          </MutedBadge>
                          <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                            {t.assignee} · 마감 {t.due}
                          </Text>
                        </div>
                      </div>
                    ))}
                    {tasks.length === 0 && <Text UNSAFE_style={{ color: CM.textMuted }}>태스크 없음</Text>}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 8, display: 'block' }}>
                    캠페인 에셋 보드
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                    {campaignAssets.map(a => (
                      <div
                        key={a.id}
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: `1px solid ${CM.cardBorder}`,
                          aspectRatio: '1',
                          backgroundColor: CM.surfacePlaceholder,
                        }}
                      >
                        <SampleAssetImage filename={a.name} />
                      </div>
                    ))}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 8, display: 'block' }}>
                    에셋을 드래그해 캠페인에 추가하는 플로는 DAM 연동 시 확장 예정.
                  </Text>
                </div>
              );
            })}
          </div>
        )}

        {/* F-4.5 승인 상태 대시보드 */}
        {activeTab === 4 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={f({ gap: 12, flexWrap: 'wrap', alignItems: 'center' })}>
              <label style={f({ gap: 8, alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 13 }}>담당자</Text>
                <select
                  value={assigneeFilter}
                  onChange={e => setAssigneeFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, fontSize: 13 }}
                >
                  {assignees.map(a => (
                    <option key={a} value={a}>
                      {a === 'all' ? '전체' : a}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="secondary" size="S" onPress={batchApprove} isDisabled={kanbanSelected.size === 0}>
                일괄 승인 ({kanbanSelected.size})
              </Button>
              <Button variant="secondary" size="S" onPress={batchReject} isDisabled={kanbanSelected.size === 0}>
                일괄 수정 요청 ({kanbanSelected.size})
              </Button>
            </div>
            <div style={f({ gap: 12, alignItems: 'stretch', flexWrap: 'wrap' })}>
              {KANBAN_COLS.map(col => (
                <div
                  key={col.key}
                  onDragOver={onDragOver}
                  onDrop={onDropCard(col.key)}
                  style={{
                    flex: '1 1 200px',
                    minHeight: 280,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: CM.breadcrumbBg,
                    border: `1px dashed ${CM.cardBorder}`,
                  }}
                >
                  <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'block' }}>
                    {col.label}
                  </Text>
                  <div style={f({ flexDirection: 'column', gap: 8 })}>
                    {filteredKanban
                      .filter(k => k.column === col.key)
                      .map(k => (
                        <div
                          key={k.id}
                          draggable
                          onDragStart={e => onDragStart(e, k.id)}
                          style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor: CM.panelBg,
                            border: `1px solid ${CM.cardBorder}`,
                            boxShadow: CM.cardShadow,
                            cursor: 'grab',
                          }}
                        >
                          <label style={f({ gap: 8, alignItems: 'flex-start' })}>
                            <Checkbox isSelected={kanbanSelected.has(k.id)} onChange={() => toggleKanbanSelect(k.id)} />
                            <div style={f({ flexDirection: 'column', gap: 4, flex: 1 })}>
                              <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>{k.assetName}</Text>
                              <Text UNSAFE_style={{ fontSize: 11, color: CM.textSecondary }}>
                                {k.assignee} · 기한 {k.dueDate}
                                {k.overdue && <span style={{ color: CM.warning, marginLeft: 6 }}>기한 초과</span>}
                              </Text>
                            </div>
                          </label>
                          {k.overdue && (
                            <span style={{ fontSize: 16, marginLeft: 4 }} title="검토 기한 초과">
                              ⚠
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                상태별 건수
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {(
                  [
                    { label: '미제출', key: 'unsubmitted' as const, tone: 'accent' as const },
                    { label: '검토 중', key: 'in_review' as const, tone: 'info' as const },
                    { label: '수정 요청', key: 'changes' as const, tone: 'warning' as const },
                    { label: '승인됨', key: 'approved' as const, tone: 'success' as const },
                  ] as const
                ).map(stat => {
                  const count = kanban.filter(k => k.column === stat.key).length;
                  const t = BADGE_TOKENS[stat.tone];
                  return (
                    <div
                      key={stat.key}
                      style={{
                        backgroundColor: t.bg,
                        border: `1px solid ${t.border}`,
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center',
                      }}
                    >
                      <Text UNSAFE_style={{ fontSize: 28, fontWeight: 'bold', color: t.text, display: 'block' }}>{count}</Text>
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{stat.label}</Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
