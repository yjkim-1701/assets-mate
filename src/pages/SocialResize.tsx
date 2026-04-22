import { Text, Button, Checkbox, TextField, ProgressBar, InlineAlert } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import Camera from '@react-spectrum/s2/icons/Camera';
import User from '@react-spectrum/s2/icons/User';
import Video from '@react-spectrum/s2/icons/Video';
import Briefcase from '@react-spectrum/s2/icons/Briefcase';
import Link from '@react-spectrum/s2/icons/Link';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import {
  SOCIAL_CHANNELS,
  SOCIAL_CALENDAR_EVENTS,
  CHANNEL_HEX,
  DEPLOY_HISTORY,
  type SocialCalendarEvent,
  type SocialCalendarStatus,
  type DeployHistoryStatus,
} from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS = [
  { id: 'resize', label: '리사이즈' },
  { id: 'calendar', label: '소셜 캘린더' },
  { id: 'multi-channel', label: '다채널 배포' },
  { id: 'history', label: '배포 이력' },
] as const;

const glyphWrap: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 18,
  height: 18,
  marginRight: 8,
  flexShrink: 0,
  color: CM.textSecondary,
};

function ChannelGlyph({ id }: { id: string }) {
  if (id.startsWith('ig-')) {
    return (
      <span style={glyphWrap}>
        <Camera />
      </span>
    );
  }
  if (id.startsWith('fb-')) {
    return (
      <span style={glyphWrap}>
        <User />
      </span>
    );
  }
  if (id.startsWith('yt-')) {
    return (
      <span style={glyphWrap}>
        <Video />
      </span>
    );
  }
  if (id.startsWith('li-')) {
    return (
      <span style={glyphWrap}>
        <Briefcase />
      </span>
    );
  }
  return (
    <span style={glyphWrap}>
      <Link />
    </span>
  );
}

function buildMonthCells(year: number, monthIndex: number): { iso: string | null; day: number | null }[] {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const pad = first.getDay();
  const daysInMonth = last.getDate();
  const cells: { iso: string | null; day: number | null }[] = [];
  for (let i = 0; i < pad; i++) cells.push({ iso: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ iso, day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });
  return cells;
}

function calStatusLabel(s: SocialCalendarStatus): string {
  const m: Record<SocialCalendarStatus, string> = {
    scheduled: '예정',
    publishing: '배포 중',
    completed: '완료',
    failed: '실패',
  };
  return m[s];
}

function histStatusLabel(s: DeployHistoryStatus): string {
  const m: Record<DeployHistoryStatus, string> = {
    success: '성공',
    failed: '실패',
    retrying: '재시도 중',
  };
  return m[s];
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function SocialResize() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set(['ig-feed', 'ig-story', 'fb-feed', 'yt-thumb']));
  const [expandPrompt, setExpandPrompt] = useState('상·하단을 같은 하늘 그라데이션으로 자연스럽게 확장해줘');
  const [expandBusy, setExpandBusy] = useState(false);
  const [expandProgress, setExpandProgress] = useState(0);
  const [expandApplied, setExpandApplied] = useState(false);

  const [calEvents, setCalEvents] = useState<SocialCalendarEvent[]>(() => SOCIAL_CALENDAR_EVENTS.map(e => ({ ...e })));
  const [calView, setCalView] = useState<'month' | 'week' | 'day'>('month');
  const [calMonth, setCalMonth] = useState(() => new Date(2026, 3, 1));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [dayFocus, setDayFocus] = useState<string>('2026-04-17');

  const [deployPick, setDeployPick] = useState<Set<string>>(new Set(['ig-feed', 'fb-feed', 'yt-thumb', 'li-feed']));
  const [deployTiming, setDeployTiming] = useState<'now' | 'later'>('now');
  const [scheduleLocal, setScheduleLocal] = useState('2026-04-20T10:00');
  const [captions, setCaptions] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const ch of SOCIAL_CHANNELS) {
      o[ch.id] =
        ch.id.startsWith('ig')
          ? '#SummerHero #브랜드'
          : ch.id.startsWith('yt')
            ? '여름 캠페인 티저 — 링크 인 바이오'
            : `${ch.name}용 캡션`;
    }
    return o;
  });
  const [deployPhase, setDeployPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [deployFailedCh, setDeployFailedCh] = useState<string | null>(null);

  const [histChannel, setHistChannel] = useState<string>('all');
  const [histFrom, setHistFrom] = useState('2026-04-01');
  const [histTo, setHistTo] = useState('2026-04-30');
  const [histStatus, setHistStatus] = useState<'all' | DeployHistoryStatus>('all');

  const toggle = (id: string) => {
    const next = new Set(selectedChannels);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedChannels(next);
  };

  const selectAll = () => {
    if (selectedChannels.size === SOCIAL_CHANNELS.length) {
      setSelectedChannels(new Set());
    } else {
      setSelectedChannels(new Set(SOCIAL_CHANNELS.map(c => c.id)));
    }
  };

  const selected = SOCIAL_CHANNELS.filter(c => selectedChannels.has(c.id));
  const needsExpandAny = selected.some(ch => ch.height / ch.width > 1.5);

  const applyExpandToPreviews = () => {
    setExpandBusy(true);
    setExpandProgress(0);
    setExpandApplied(false);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setExpandProgress(Math.min(100, Math.round(((Date.now() - t0) / 1600) * 100)));
    }, 60);
    window.setTimeout(() => {
      window.clearInterval(id);
      setExpandProgress(100);
      setExpandBusy(false);
      setExpandApplied(true);
    }, 1600);
  };

  const year = calMonth.getFullYear();
  const monthIndex = calMonth.getMonth();
  const monthCells = useMemo(() => buildMonthCells(year, monthIndex), [year, monthIndex]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, SocialCalendarEvent[]>();
    for (const e of calEvents) {
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [calEvents]);

  const selectedEvent = calEvents.find(e => e.id === selectedEventId) ?? null;

  const onCalDragStart = useCallback((e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('text/plain', eventId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const onCalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onCalDrop = useCallback(
    (iso: string) => (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (!id || !iso) return;
      setCalEvents(prev => prev.map(ev => (ev.id === id ? { ...ev, date: iso } : ev)));
      setSelectedEventId(id);
    },
    []
  );

  const shiftMonth = (delta: number) => {
    setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const weekRangeLabel = useMemo(() => {
    const d = new Date(dayFocus);
    const dow = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - dow);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (x: Date) => `${x.getMonth() + 1}/${x.getDate()}`;
    return `${fmt(start)} – ${fmt(end)}`;
  }, [dayFocus]);

  const laneWeekEvents = useMemo(() => {
    const d = new Date(dayFocus);
    const dow = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - dow);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const t0 = start.getTime();
    const t1 = end.getTime();
    return calEvents.filter(ev => {
      const t = new Date(ev.date + 'T12:00:00').getTime();
      return t >= t0 && t < t1;
    });
  }, [calEvents, dayFocus]);

  const toggleDeployCh = (id: string) => {
    setDeployPick(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const runDeploy = () => {
    setDeployPhase('running');
    setDeployFailedCh(null);
    window.setTimeout(() => {
      setDeployPhase('done');
      setDeployFailedCh('yt-thumb');
    }, 1400);
  };

  const retryFailed = () => {
    setDeployFailedCh(null);
    setDeployPhase('done');
  };

  const filteredHistory = useMemo(() => {
    return DEPLOY_HISTORY.filter(row => {
      if (histChannel !== 'all' && row.channelId !== histChannel) return false;
      if (histStatus !== 'all' && row.status !== histStatus) return false;
      const day = row.deployedAt.slice(0, 10);
      if (day < histFrom || day > histTo) return false;
      return true;
    });
  }, [histChannel, histFrom, histTo, histStatus]);

  const channelCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of filteredHistory) {
      m.set(r.channel, (m.get(r.channel) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredHistory]);

  const maxBar = Math.max(1, ...channelCounts.map(([, n]) => n));

  const exportCsv = () => {
    const header = ['assetName', 'channel', 'deployedAt', 'deployedBy', 'status', 'campaign'];
    const lines = [header.join(',')].concat(
      filteredHistory.map(r =>
        [r.assetName, r.channel, r.deployedAt, r.deployedBy, r.status, r.campaign].map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')
      )
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy-history-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const dayEvents = calEvents.filter(e => e.date === dayFocus);

  return (
    <>
      <PageHeader
        title="소셜 미디어"
        description="채널별 비율에 맞춰 리사이즈하고, 게시 일정·다채널 배포·배포 이력을 한 화면에서 다룹니다."
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

        {activeTab === 0 && (
          <>
            <div style={card}>
              <div style={f({ gap: 16, alignItems: 'center' })}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: CM.surfacePlaceholder,
                  }}
                >
                  <SampleAssetImage filename="product_shot_01.png" />
                </div>
                <div style={f({ flexDirection: 'column', gap: 4 })}>
                  <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>product_shot_01.png</Text>
                  <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>3840×2160 · 4.2 MB · 2026 Summer Campaign</Text>
                  <MutedBadge tone="success" size="S">
                    브랜드 스코어: 92
                  </MutedBadge>
                </div>
              </div>
            </div>

            <div style={card}>
              <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
                <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>채널 선택</Text>
                <Button variant="secondary" size="S" onPress={selectAll}>
                  {selectedChannels.size === SOCIAL_CHANNELS.length ? '전체 해제' : '전체 선택'}
                </Button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {SOCIAL_CHANNELS.map(ch => (
                  <Checkbox key={ch.id} isSelected={selectedChannels.has(ch.id)} onChange={() => toggle(ch.id)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <ChannelGlyph id={ch.id} />
                      {ch.name} ({ch.width}×{ch.height})
                    </span>
                  </Checkbox>
                ))}
              </div>
            </div>

            {selected.length > 0 && (
              <>
                {needsExpandAny && (
                  <InlineAlert variant="informative">
                    <Text>
                      선택한 채널 중 세로 비율(예: 9:16)이 원본과 달라 잘림이 예상됩니다. Generative Expand로 상·하·좌·우 영역을 채울 수 있습니다.
                    </Text>
                  </InlineAlert>
                )}

                {needsExpandAny && (
                  <div style={card}>
                    <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold', display: 'block', marginBottom: 10 }}>
                      Generative Expand — 타깃 프리셋에 맞춤
                    </Text>
                    <TextField label="확장 영역 프롬프트" value={expandPrompt} onChange={setExpandPrompt} />
                    <div style={{ marginTop: 12 }}>
                      <AccentButton isDisabled={expandBusy} onPress={applyExpandToPreviews}>
                        원클릭 Expand 적용 (아래 프리뷰 반영)
                      </AccentButton>
                    </div>
                    {expandBusy && (
                      <div style={{ marginTop: 12 }}>
                        <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 6 }}>Expand Image API 연결 중…</Text>
                        <ProgressBar value={expandProgress} />
                      </div>
                    )}
                    {expandApplied && (
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.success, marginTop: 10, display: 'block', fontWeight: 600 }}>
                        적용됨: 세로 프리뷰에 확장 영역이 반영되었습니다.
                      </Text>
                    )}
                  </div>
                )}

                <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>프리뷰 ({selected.length}개 채널)</Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {selected.map(ch => {
                    const ratio = ch.width / ch.height;
                    const previewW = 200;
                    const previewH = Math.min(previewW / ratio, 280);
                    const needsExpand = ch.height / ch.width > 1.5;
                    return (
                      <div key={ch.id} style={f({ flexDirection: 'column', gap: 8 })}>
                        <div
                          style={{
                            width: previewW,
                            height: previewH,
                            backgroundColor: expandApplied && needsExpand ? '#E0E7FF' : CM.surfacePlaceholder,
                            borderRadius: 12,
                            overflow: 'hidden',
                            position: 'relative',
                            color: CM.textMuted,
                            boxSizing: 'border-box',
                            border: expandApplied && needsExpand ? `2px solid #6366F1` : 'none',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: needsExpand && expandApplied ? '10% 8%' : 0,
                            }}
                          >
                            <div
                              style={{
                                width: needsExpand && expandApplied ? '100%' : '100%',
                                height: needsExpand && expandApplied ? '72%' : '100%',
                                borderRadius: needsExpand && expandApplied ? 8 : 0,
                                overflow: 'hidden',
                                boxShadow: needsExpand && expandApplied ? '0 0 0 2px rgba(99,102,241,0.5)' : 'none',
                              }}
                            >
                              <SampleAssetImage filename="product_shot_01.png" />
                            </div>
                          </div>
                          {needsExpand && (
                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                              <MutedBadge tone="accent" size="S">
                                AI Expand
                              </MutedBadge>
                            </div>
                          )}
                        </div>
                        <div style={f({ flexDirection: 'column', gap: 2, alignItems: 'center' })}>
                          <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <ChannelGlyph id={ch.id} />
                              {ch.name}
                            </span>
                          </Text>
                          <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>
                            {ch.width}×{ch.height}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={f({ gap: 12, justifyContent: 'flex-end' })}>
                  <Button variant="secondary">프리뷰 확인</Button>
                  <AccentButton>일괄 생성 & 저장 ({selected.length}개)</AccentButton>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 1 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
              <Button variant={calView === 'month' ? 'accent' : 'secondary'} size="S" onPress={() => setCalView('month')}>
                월간
              </Button>
              <Button variant={calView === 'week' ? 'accent' : 'secondary'} size="S" onPress={() => setCalView('week')}>
                주간
              </Button>
              <Button variant={calView === 'day' ? 'accent' : 'secondary'} size="S" onPress={() => setCalView('day')}>
                일간
              </Button>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, marginLeft: 8 }}>
                드래그하여 다른 날짜로 일정을 옮길 수 있습니다.
              </Text>
            </div>

            {calView === 'month' && (
              <div style={{ ...card, cursor: 'default' }}>
                <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
                  <Button variant="secondary" size="S" onPress={() => shiftMonth(-1)}>
                    ◀
                  </Button>
                  <Text UNSAFE_style={{ fontSize: 16, fontWeight: 700 }}>
                    {year}년 {monthIndex + 1}월
                  </Text>
                  <Button variant="secondary" size="S" onPress={() => shiftMonth(1)}>
                    ▶
                  </Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                  {WEEKDAYS.map(w => (
                    <div key={w} style={{ fontSize: 11, fontWeight: 700, color: CM.textMuted, textAlign: 'center' }}>
                      {w}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                  {monthCells.map((cell, idx) => (
                    <div
                      key={idx}
                      onDragOver={cell.iso ? onCalDragOver : undefined}
                      onDrop={cell.iso ? onCalDrop(cell.iso) : undefined}
                      style={{
                        minHeight: 88,
                        padding: 6,
                        borderRadius: 8,
                        backgroundColor: cell.iso ? CM.breadcrumbBg : 'transparent',
                        border: cell.iso === dayFocus ? `2px solid ${CM.primaryBlue}` : `1px solid ${CM.cardBorder}`,
                        opacity: cell.iso ? 1 : 0.35,
                      }}
                      onClick={() => cell.iso && setDayFocus(cell.iso)}
                    >
                      {cell.day != null && (
                        <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{cell.day}</Text>
                      )}
                      {cell.iso &&
                        (eventsByDate.get(cell.iso) ?? []).map(ev => (
                          <div
                            key={ev.id}
                            draggable
                            onDragStart={e => onCalDragStart(e, ev.id)}
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedEventId(ev.id);
                            }}
                            style={{
                              fontSize: 10,
                              padding: '3px 5px',
                              borderRadius: 4,
                              marginBottom: 3,
                              cursor: 'grab',
                              color: '#fff',
                              backgroundColor: CHANNEL_HEX[ev.channelId] ?? '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {calView === 'week' && (
              <div style={{ ...card, cursor: 'default' }}>
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  주간 {weekRangeLabel}
                </Text>
                <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                  {laneWeekEvents.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${CM.cardBorder}`,
                        minWidth: 200,
                        borderLeft: `4px solid ${CHANNEL_HEX[ev.channelId] ?? '#64748B'}`,
                      }}
                    >
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</Text>
                      <Text UNSAFE_style={{ fontSize: 11, color: CM.textSecondary, display: 'block' }}>
                        {ev.date} {ev.time} · {ev.channel}
                      </Text>
                      <MutedBadge tone="info" size="S">
                        {calStatusLabel(ev.status)}
                      </MutedBadge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {calView === 'day' && (
              <div style={{ ...card, cursor: 'default' }}>
                <TextField label="날짜 (YYYY-MM-DD)" value={dayFocus} onChange={setDayFocus} />
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700, marginTop: 12, marginBottom: 8, display: 'block' }}>
                  {dayFocus} 일정
                </Text>
                <div style={f({ flexDirection: 'column', gap: 8 })}>
                  {dayEvents.length === 0 && <Text UNSAFE_style={{ color: CM.textMuted }}>일정 없음</Text>}
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      style={f({
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${CM.cardBorder}`,
                      })}
                    >
                      <div>
                        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>{ev.title}</Text>
                        <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{ev.time}</Text>
                      </div>
                      <Button variant="secondary" size="S" onPress={() => setSelectedEventId(ev.id)}>
                        상세
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                채널 레인 (이번 주)
              </Text>
              <div style={f({ flexDirection: 'column', gap: 10 })}>
                {SOCIAL_CHANNELS.slice(0, 6).map(ch => {
                  const evs = laneWeekEvents.filter(e => e.channelId === ch.id);
                  const col = CHANNEL_HEX[ch.id] ?? '#94A3B8';
                  return (
                    <div key={ch.id} style={f({ alignItems: 'center', gap: 12 })}>
                      <div style={{ width: 120, flexShrink: 0, fontSize: 12, fontWeight: 600 }}>
                        <span style={{ color: col }}>●</span> {ch.name}
                      </div>
                      <div style={{ flex: 1, height: 36, backgroundColor: CM.surfacePlaceholder, borderRadius: 6, position: 'relative' }}>
                        {evs.map(ev => (
                          <div
                            key={ev.id}
                            title={ev.title}
                            style={{
                              position: 'absolute',
                              top: 6,
                              left: 8,
                              height: 24,
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              backgroundColor: col,
                              color: '#fff',
                              maxWidth: '90%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedEvent && (
              <div style={{ ...card, cursor: 'default', borderColor: CM.primaryBlue }}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  일정 상세 (팝오버 대체)
                </Text>
                <Text UNSAFE_style={{ fontSize: 14 }}>{selectedEvent.title}</Text>
                <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginTop: 4 }}>
                  {selectedEvent.date} {selectedEvent.time} · {selectedEvent.channel}
                </Text>
                <Text UNSAFE_style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
                  에셋: {selectedEvent.assetName} · 반복:{' '}
                  {selectedEvent.repeatRule === 'none' ? '없음' : selectedEvent.repeatRule === 'weekly' ? '매주' : '매월'}
                </Text>
                <div style={{ marginTop: 10 }}>
                  <MutedBadge
                    tone={
                      selectedEvent.status === 'failed'
                        ? 'danger'
                        : selectedEvent.status === 'completed'
                          ? 'success'
                          : selectedEvent.status === 'publishing'
                            ? 'accent'
                            : 'info'
                    }
                    size="S"
                  >
                    {calStatusLabel(selectedEvent.status)}
                  </MutedBadge>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Button variant="secondary" size="S" onPress={() => navigate(`/assets/${selectedEvent.assetId}`)}>
                    에셋로 이동
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                배포 대상 채널 (3개 이상 선택 가능)
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {SOCIAL_CHANNELS.map(ch => (
                  <Checkbox key={ch.id} isSelected={deployPick.has(ch.id)} onChange={() => toggleDeployCh(ch.id)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <ChannelGlyph id={ch.id} />
                      {ch.name}
                    </span>
                  </Checkbox>
                ))}
              </div>
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                배포 옵션
              </Text>
              <div style={f({ gap: 8, marginBottom: 12 })}>
                <Button variant={deployTiming === 'now' ? 'accent' : 'secondary'} size="S" onPress={() => setDeployTiming('now')}>
                  즉시 배포
                </Button>
                <Button variant={deployTiming === 'later' ? 'accent' : 'secondary'} size="S" onPress={() => setDeployTiming('later')}>
                  예약 배포
                </Button>
              </div>
              {deployTiming === 'later' && (
                <label style={f({ flexDirection: 'column', gap: 6, maxWidth: 360 })}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>예약 일시</Text>
                  <input
                    type="datetime-local"
                    value={scheduleLocal}
                    onChange={e => setScheduleLocal(e.target.value)}
                    style={{ padding: 8, borderRadius: 8, border: `1px solid ${CM.cardBorder}`, fontSize: 14 }}
                  />
                </label>
              )}
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                채널별 캡션 · 해시태그
              </Text>
              <div style={f({ flexDirection: 'column', gap: 12 })}>
                {SOCIAL_CHANNELS.filter(ch => deployPick.has(ch.id)).map(ch => (
                  <TextField
                    key={ch.id}
                    label={`${ch.name}`}
                    value={captions[ch.id] ?? ''}
                    onChange={v => setCaptions(prev => ({ ...prev, [ch.id]: v }))}
                  />
                ))}
              </div>
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                배포 전 확인
              </Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 12, display: 'block' }}>
                원본 product_shot_01.png · 선택 {deployPick.size}개 채널 ·{' '}
                {deployTiming === 'now' ? '즉시' : `예약 ${scheduleLocal}`}
              </Text>
              <div style={{ width: 120, height: 120, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                <SampleAssetImage filename="product_shot_01.png" />
              </div>
              <div style={f({ gap: 12 })}>
                <AccentButton isDisabled={deployPick.size < 3 || deployPhase === 'running'} onPress={runDeploy}>
                  {deployPhase === 'running' ? '배포 중…' : '배포 실행'}
                </AccentButton>
                {deployPhase === 'running' && <ProgressBar isIndeterminate />}
              </div>
              {deployPhase === 'done' && (
                <div style={{ marginTop: 12 }}>
                  <InlineAlert variant={deployFailedCh ? 'notice' : 'positive'}>
                    <Text>
                      {deployFailedCh
                        ? `일부 채널 실패: ${SOCIAL_CHANNELS.find(c => c.id === deployFailedCh)?.name}. 재시도할 수 있습니다.`
                        : '모든 채널에 배포가 완료되었습니다.'}
                    </Text>
                  </InlineAlert>
                </div>
              )}
              {deployFailedCh && deployPhase === 'done' && (
                <div style={{ marginTop: 12 }}>
                  <Button variant="secondary" size="S" onPress={retryFailed}>
                    실패 채널 재시도
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                필터
              </Text>
              <div style={f({ gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' })}>
                <label style={f({ flexDirection: 'column', gap: 4 })}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>채널</Text>
                  <select
                    value={histChannel}
                    onChange={e => setHistChannel(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, minWidth: 180 }}
                  >
                    <option value="all">전체</option>
                    {[...new Set(DEPLOY_HISTORY.map(d => d.channelId))].map(id => {
                      const row = DEPLOY_HISTORY.find(d => d.channelId === id);
                      return (
                        <option key={id} value={id}>
                          {row?.channel}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <TextField label="시작일" value={histFrom} onChange={setHistFrom} />
                <TextField label="종료일" value={histTo} onChange={setHistTo} />
                <label style={f({ flexDirection: 'column', gap: 4 })}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>상태</Text>
                  <select
                    value={histStatus}
                    onChange={e => setHistStatus(e.target.value as 'all' | DeployHistoryStatus)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${CM.cardBorder}`, minWidth: 140 }}
                  >
                    <option value="all">전체</option>
                    <option value="success">성공</option>
                    <option value="failed">실패</option>
                    <option value="retrying">재시도 중</option>
                  </select>
                </label>
                <Button variant="secondary" size="S" onPress={exportCsv}>
                  CSV 내보내기
                </Button>
              </div>
            </div>

            <div style={{ ...card, cursor: 'default' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                채널별 건수 (필터 반영)
              </Text>
              <div style={f({ flexDirection: 'column', gap: 8 })}>
                {channelCounts.map(([ch, n]) => (
                  <div key={ch} style={f({ alignItems: 'center', gap: 12 })}>
                    <div style={{ width: 140, fontSize: 12, flexShrink: 0 }}>{ch}</div>
                    <div style={{ flex: 1, height: 10, backgroundColor: CM.surfacePlaceholder, borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${(n / maxBar) * 100}%`, height: '100%', backgroundColor: CM.primaryBlue }} />
                    </div>
                    <div style={{ width: 28, fontSize: 12, textAlign: 'right' }}>{n}</div>
                  </div>
                ))}
                {channelCounts.length === 0 && <Text UNSAFE_style={{ color: CM.textMuted }}>데이터 없음</Text>}
              </div>
            </div>

            <div style={{ ...card, cursor: 'default', overflow: 'auto' }}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                배포 이력
              </Text>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${CM.cardBorder}`, textAlign: 'left' }}>
                    <th style={{ padding: 8 }}>에셋</th>
                    <th style={{ padding: 8 }}>채널</th>
                    <th style={{ padding: 8 }}>배포 시각</th>
                    <th style={{ padding: 8 }}>배포자</th>
                    <th style={{ padding: 8 }}>상태</th>
                    <th style={{ padding: 8 }}>캠페인</th>
                    <th style={{ padding: 8 }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(row => (
                    <tr key={row.id} style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                      <td style={{ padding: 8 }}>{row.assetName}</td>
                      <td style={{ padding: 8 }}>
                        <span style={{ color: CHANNEL_HEX[row.channelId] ?? '#64748B', marginRight: 6 }}>●</span>
                        {row.channel}
                      </td>
                      <td style={{ padding: 8, color: CM.textSecondary }}>{row.deployedAt}</td>
                      <td style={{ padding: 8 }}>{row.deployedBy}</td>
                      <td style={{ padding: 8 }}>
                        <MutedBadge
                          tone={row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'}
                          size="S"
                        >
                          {histStatusLabel(row.status)}
                        </MutedBadge>
                      </td>
                      <td style={{ padding: 8 }}>{row.campaign}</td>
                      <td style={{ padding: 8 }}>
                        <Button variant="secondary" size="S" onPress={() => navigate(`/assets/${row.assetId}`)}>
                          에셋
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHistory.length === 0 && (
                <Text UNSAFE_style={{ color: CM.textMuted, marginTop: 12, display: 'block' }}>조건에 맞는 이력이 없습니다.</Text>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
