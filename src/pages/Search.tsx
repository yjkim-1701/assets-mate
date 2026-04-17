import { Text, SearchField, Button, Checkbox, TextField } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import Video from '@react-spectrum/s2/icons/Video';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { ASSETS, type Asset } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 16,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS: { id: string; label: string }[] = [
  { id: 'integrated', label: '통합 검색' },
  { id: 'visual', label: '비주얼 유사도' },
  { id: 'color', label: '색상 검색' },
  { id: 'semantic', label: '시맨틱 검색' },
  { id: 'multilang', label: '다국어 그룹' },
  { id: 'duplicate', label: '중복 탐지' },
  { id: 'taxonomy', label: '텍소노미' },
];

const BRAND_COLOR_PRESETS = [
  { label: 'Primary Blue', hex: '#1D4ED8' },
  { label: 'Success Green', hex: '#047857' },
  { label: 'Warning Amber', hex: '#B45309' },
];

const SEMANTIC_SUGGESTIONS = [
  '가을 분위기 카페 인테리어',
  '봄 시즌 아웃도어 라이프스타일',
  '미니멀 이메일 헤더',
  '소셜 피드 정사각형',
  '겨울 쿨톤 히어로',
];

const CHANNEL_OPTS = ['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin', 'x', 'display', 'email'];
const SEASON_OPTS: Asset['season'][] = ['spring', 'summer', 'fall', 'winter', 'year-round'];
const STATUS_OPTS: { key: Asset['status']; label: string }[] = [
  { key: 'approved', label: '승인됨' },
  { key: 'review', label: '검토 중' },
  { key: 'violation', label: '위반' },
];
const KIND_OPTS: { key: Asset['assetKind']; label: string }[] = [
  { key: 'photo', label: '사진' },
  { key: 'illustration', label: '일러스트' },
  { key: 'banner', label: '배너' },
  { key: 'logo', label: '로고' },
  { key: 'video', label: '비디오' },
  { key: 'document', label: '문서' },
];

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return (
    <MutedBadge tone={tone} size="S">
      {score}
    </MutedBadge>
  );
}

function buildTaxonomyCounts(assets: Asset[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of assets) {
    for (let d = 1; d <= a.taxonomyPath.length; d++) {
      const key = a.taxonomyPath.slice(0, d).join('/');
      m.set(key, (m.get(key) ?? 0) + 1);
    }
  }
  return m;
}

function matchesTaxonomyPrefix(path: string[], prefix: string[]): boolean {
  if (prefix.length === 0) return true;
  if (path.length < prefix.length) return false;
  return prefix.every((p, i) => path[i] === p);
}

function mockVisualSimilarity(a: Asset, ref: Asset | null): number {
  if (!ref) return 100;
  let s = 100 - 14 * Math.abs(a.visualBucket - ref.visualBucket);
  if (a.campaign === ref.campaign) s += 6;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function colorMatches(asset: Asset, swatches: string[], dominance: number): boolean {
  if (swatches.length === 0) return true;
  const tol = Math.max(0.2, 1 - dominance / 120);
  return asset.dominantColors.some(dc => {
    const dh = dc.replace('#', '').toLowerCase();
    return swatches.some(sw => {
      const sh = sw.replace('#', '').toLowerCase();
      if (dh === sh) return true;
      let match = 0;
      for (let i = 0; i < Math.min(dh.length, sh.length); i++) if (dh[i] === sh[i]) match++;
      return match / 6 >= tol;
    });
  });
}

function semanticScore(query: string, asset: Asset): { ok: boolean; reasons: string[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { ok: true, reasons: [] };
  const tokens = q.split(/\s+/).filter(Boolean);
  const reasons: string[] = [];
  for (const h of asset.semanticHints) {
    const hl = h.toLowerCase();
    if (tokens.some(t => hl.includes(t) || t.length >= 2 && hl.includes(t.slice(0, 2)))) reasons.push(h);
  }
  if (asset.name.toLowerCase().includes(q)) reasons.push('파일명');
  if (asset.campaign.toLowerCase().includes(q)) reasons.push('캠페인');
  const ok = reasons.length > 0 || tokens.some(t => asset.taxonomyPath.some(p => p.toLowerCase().includes(t)));
  if (!ok && tokens.some(t => asset.taxonomyPath.join(' ').toLowerCase().includes(t))) reasons.push('분류');
  return { ok: ok || reasons.length > 0, reasons: reasons.length ? reasons : ['메타/태그'] };
}

type SavedFilter = { name: string; payload: string };

export default function Search() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState('');
  const [gridMode, setGridMode] = useState<'grid' | 'list'>('grid');

  const [selCampaigns, setSelCampaigns] = useState<Set<string>>(new Set());
  const [selChannels, setSelChannels] = useState<Set<string>>(new Set());
  const [selSeasons, setSelSeasons] = useState<Set<string>>(new Set());
  const [selStatus, setSelStatus] = useState<Set<string>>(new Set());
  const [selKinds, setSelKinds] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const [visualRefId, setVisualRefId] = useState<string | null>(null);
  const [similarityMin, setSimilarityMin] = useState(65);
  const [dragOver, setDragOver] = useState(false);

  const [colorSwatches, setColorSwatches] = useState<string[]>([]);
  const [hexInput, setHexInput] = useState('#1D4ED8');
  const [colorDominance, setColorDominance] = useState(55);

  const [semanticQuery, setSemanticQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [taxonomyPrefix, setTaxonomyPrefix] = useState<string[]>([]);

  const [duplicateKeep, setDuplicateKeep] = useState<Record<string, string>>({});

  const campaigns = useMemo(() => [...new Set(ASSETS.map(a => a.campaign))], []);

  const taxonomyCounts = useMemo(() => buildTaxonomyCounts(ASSETS), []);
  const taxonomyKeys = useMemo(() => [...taxonomyCounts.keys()].sort((a, b) => a.localeCompare(b, 'ko')), [taxonomyCounts]);

  const visualRef = useMemo(() => ASSETS.find(a => a.id === visualRefId) ?? null, [visualRefId]);

  useEffect(() => {
    const q = semanticQuery.trim();
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => {
      setSuggestions(SEMANTIC_SUGGESTIONS.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 5));
    }, 300);
    return () => {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
    };
  }, [semanticQuery]);

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) => {
    set(prev => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const integratedFiltered = useMemo(() => {
    return ASSETS.filter(a => {
      if (query && !a.name.toLowerCase().includes(query.toLowerCase()) && !a.campaign.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (selCampaigns.size && !selCampaigns.has(a.campaign)) return false;
      if (selChannels.size && !a.channels.some(c => selChannels.has(c))) return false;
      if (selSeasons.size && !selSeasons.has(a.season)) return false;
      if (selStatus.size && !selStatus.has(a.status)) return false;
      if (selKinds.size && !selKinds.has(a.assetKind)) return false;
      if (dateFrom && a.modified < dateFrom) return false;
      if (dateTo && a.modified > dateTo) return false;
      return true;
    });
  }, [query, selCampaigns, selChannels, selSeasons, selStatus, selKinds, dateFrom, dateTo]);

  const visualFiltered = useMemo(() => {
    if (!visualRef) return ASSETS.map(a => ({ a, sim: mockVisualSimilarity(a, null) }));
    return ASSETS.map(a => ({ a, sim: mockVisualSimilarity(a, visualRef) }))
      .filter(({ sim }) => sim >= similarityMin)
      .sort((x, y) => y.sim - x.sim);
  }, [visualRef, similarityMin]);

  const colorFiltered = useMemo(() => {
    return ASSETS.filter(a => colorMatches(a, colorSwatches, colorDominance));
  }, [colorSwatches, colorDominance]);

  const semanticFiltered = useMemo(() => {
    return ASSETS.map(a => {
      const { ok, reasons } = semanticScore(semanticQuery, a);
      return { a, ok, reasons };
    })
      .filter(x => x.ok)
      .sort((x, y) => y.a.brandScore - x.a.brandScore);
  }, [semanticQuery]);

  const taxonomyFiltered = useMemo(() => {
    return ASSETS.filter(a => matchesTaxonomyPrefix(a.taxonomyPath, taxonomyPrefix));
  }, [taxonomyPrefix]);

  const langGroups = useMemo(() => {
    const m = new Map<string, Asset[]>();
    for (const a of ASSETS) {
      if (!a.langGroupId) continue;
      const list = m.get(a.langGroupId) ?? [];
      list.push(a);
      m.set(a.langGroupId, list);
    }
    return m;
  }, []);

  const dupGroups = useMemo(() => {
    const m = new Map<string, Asset[]>();
    for (const a of ASSETS) {
      if (!a.duplicateGroupId) continue;
      const list = m.get(a.duplicateGroupId) ?? [];
      list.push(a);
      m.set(a.duplicateGroupId, list);
    }
    return m;
  }, []);

  const resetFilters = () => {
    setSelCampaigns(new Set());
    setSelChannels(new Set());
    setSelSeasons(new Set());
    setSelStatus(new Set());
    setSelKinds(new Set());
    setDateFrom('');
    setDateTo('');
    setQuery('');
  };

  const saveCurrentFilter = () => {
    const name = window.prompt('저장할 필터 이름');
    if (!name?.trim()) return;
    const payload = JSON.stringify({
      selCampaigns: [...selCampaigns],
      selChannels: [...selChannels],
      selSeasons: [...selSeasons],
      selStatus: [...selStatus],
      selKinds: [...selKinds],
      dateFrom,
      dateTo,
      query,
    });
    setSavedFilters(prev => [...prev, { name: name.trim(), payload }]);
  };

  const loadSavedFilter = (payload: string) => {
    try {
      const p = JSON.parse(payload) as {
        selCampaigns: string[];
        selChannels: string[];
        selSeasons: string[];
        selStatus: string[];
        selKinds: string[];
        dateFrom: string;
        dateTo: string;
        query: string;
      };
      setSelCampaigns(new Set(p.selCampaigns));
      setSelChannels(new Set(p.selChannels));
      setSelSeasons(new Set(p.selSeasons));
      setSelStatus(new Set(p.selStatus));
      setSelKinds(new Set(p.selKinds));
      setDateFrom(p.dateFrom ?? '');
      setDateTo(p.dateTo ?? '');
      setQuery(p.query ?? '');
    } catch {
      /* ignore */
    }
  };

  const addSwatch = useCallback((hex: string) => {
    const h = hex.startsWith('#') ? hex : `#${hex}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(h)) return;
    setColorSwatches(prev => (prev.includes(h) ? prev : prev.length >= 5 ? [...prev.slice(1), h] : [...prev, h]));
  }, []);

  const onDropVisual = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setVisualRefId('a1');
  };

  const renderAssetCard = (
    asset: Asset,
    opts?: { similarity?: string; matchReasons?: string[] }
  ) => (
    <div
      key={asset.id}
      style={{ ...card, padding: 0, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => navigate(`/assets/${asset.id}`)}
    >
      <div
        style={{
          width: '100%',
          height: 160,
          position: 'relative',
          backgroundColor: CM.surfacePlaceholder,
          overflow: 'hidden',
        }}
      >
        <SampleAssetImage filename={asset.name} phase={asset.status === 'violation' ? 'before' : 'after'} />
        {asset.type === 'video' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.35)',
              pointerEvents: 'none',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            <span style={{ display: 'flex', width: 40, height: 40 }}>
              <Video />
            </span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            pointerEvents: 'none',
          }}
        >
          {asset.dominantColors.slice(0, 3).map(c => (
            <span
              key={c}
              title={c}
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                backgroundColor: c,
                border: `1px solid ${CM.cardBorder}`,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{asset.name}</Text>
        <div style={f({ justifyContent: 'space-between', alignItems: 'center' })}>
          <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{asset.dim} · {asset.size}</Text>
          <ScoreBadge score={asset.brandScore} />
        </div>
        {opts?.similarity && (
          <Text UNSAFE_style={{ fontSize: 11, color: CM.accentIndigo, marginTop: 4, display: 'block' }}>
            유사도 {opts.similarity}
          </Text>
        )}
        {opts?.matchReasons && opts.matchReasons.length > 0 && (
          <div style={{ ...f({ gap: 4, flexWrap: 'wrap', marginTop: 6 }) }}>
            {opts.matchReasons.slice(0, 3).map(r => (
              <MutedBadge key={r} tone="info" size="S">
                {r}
              </MutedBadge>
            ))}
          </div>
        )}
        <div style={f({ marginTop: 4, gap: 4 })}>
          <MutedBadge variant="informative" size="S">
            {asset.campaign}
          </MutedBadge>
        </div>
      </div>
    </div>
  );

  const tabId = TABS[activeTab].id;

  return (
    <>
      <PageHeader
        title="검색 & 탐색"
        description="비주얼·색상·의미 기반 검색과 복합 필터로 에셋을 찾고, 다국어 변형·중복 정리·분류 탐색까지 한 화면에서 처리합니다."
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
          {TABS.map((tab, i) =>
            activeTab === i ? (
              <Button key={tab.id} variant="accent" size="S" onPress={() => setActiveTab(i)}>
                {tab.label}
              </Button>
            ) : (
              <Button key={tab.id} variant="secondary" size="S" onPress={() => setActiveTab(i)}>
                {tab.label}
              </Button>
            )
          )}
        </div>

        {tabId === 'visual' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>참조 이미지</Text>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 12 }}>
              참조 이미지를 드래그하여 넣거나 샘플을 고른 뒤 유사도 하한을 조절합니다. 유사도는 콘텐츠 특성과 캠페인 메타데이터를 반영해 계산됩니다.
            </Text>
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDropVisual}
              style={{
                border: `2px dashed ${dragOver ? CM.primaryBlue : CM.cardBorder}`,
                borderRadius: 12,
                padding: 24,
                textAlign: 'center',
                backgroundColor: dragOver ? CM.infoBg : CM.mainBg,
                marginBottom: 12,
              }}
            >
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>이미지를 여기에 놓으면 샘플 참조로 처리됩니다</Text>
            </div>
            <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 12 })}>
              {ASSETS.filter(a => a.type === 'image').slice(0, 4).map(a => (
                <Button key={a.id} variant={visualRefId === a.id ? 'accent' : 'secondary'} size="S" onPress={() => setVisualRefId(a.id)}>
                  참조: {a.name.slice(0, 18)}…
                </Button>
              ))}
            </div>
            {visualRef && (
              <div style={f({ alignItems: 'center', gap: 12, marginBottom: 12 })}>
                <Text UNSAFE_style={{ fontSize: 13 }}>유사도 {similarityMin}% 이상</Text>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={similarityMin}
                  onChange={e => setSimilarityMin(Number(e.target.value))}
                  style={{ flex: 1, maxWidth: 320 }}
                />
              </div>
            )}
          </div>
        )}

        {tabId === 'color' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>색상 팔레트 (최대 5색)</Text>
            <div style={f({ gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 })}>
              <input type="color" value={hexInput} onChange={e => setHexInput(e.target.value)} style={{ width: 44, height: 36, border: 'none' }} />
              <TextField label="HEX" value={hexInput} onChange={setHexInput} />
              <Button variant="secondary" size="S" onPress={() => addSwatch(hexInput)}>
                팔레트에 추가
              </Button>
            </div>
            <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 12 })}>
              {BRAND_COLOR_PRESETS.map(p => (
                <Button key={p.label} variant="secondary" size="S" onPress={() => addSwatch(p.hex)}>
                  {p.label}
                </Button>
              ))}
            </div>
            <div style={f({ gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' })}>
              {colorSwatches.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorSwatches(prev => prev.filter(x => x !== c))}
                  title="클릭하여 제거"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: c,
                    border: `2px solid ${CM.cardBorder}`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div style={f({ alignItems: 'center', gap: 12 })}>
              <Text UNSAFE_style={{ fontSize: 13 }}>색상 비중(매칭 엄격도)</Text>
              <input
                type="range"
                min={0}
                max={100}
                value={colorDominance}
                onChange={e => setColorDominance(Number(e.target.value))}
                style={{ flex: 1, maxWidth: 280 }}
              />
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{colorDominance}</Text>
            </div>
          </div>
        )}

        {tabId === 'semantic' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>자연어 시맨틱 검색</Text>
            <TextField label="의도를 문장으로 입력" value={semanticQuery} onChange={setSemanticQuery} />
            {suggestions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 6 }}>제안</Text>
                <div style={f({ gap: 6, flexWrap: 'wrap' })}>
                  {suggestions.map(s => (
                    <Button key={s} variant="secondary" size="S" onPress={() => setSemanticQuery(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tabId === 'multilang' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>다국어 유사 에셋 그룹</Text>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, lineHeight: 1.5 }}>
              동일 캠페인·그룹으로 묶인 언어별 변형입니다. 현지화·검수 상태는 배지로 구분합니다.
            </Text>
            {[...langGroups.entries()].map(([gid, items]) => (
              <div key={gid} style={{ marginTop: 16, padding: 12, borderRadius: 8, border: `1px solid ${CM.cardBorder}` }}>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>그룹 {gid}</Text>
                <div style={f({ gap: 16, flexWrap: 'wrap' })}>
                  {items.map(a => (
                    <div key={a.id} style={f({ flexDirection: 'column', gap: 6, width: 200 })}>
                      <div style={{ height: 120, borderRadius: 8, overflow: 'hidden', backgroundColor: CM.surfacePlaceholder }}>
                        <SampleAssetImage filename={a.name} />
                      </div>
                      <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600 }}>{a.lang.toUpperCase()}</Text>
                      <MutedBadge tone={a.status === 'approved' ? 'success' : a.status === 'review' ? 'warning' : 'danger'} size="S">
                        {a.status === 'approved' ? '완료' : a.status === 'review' ? '진행중' : '검토 필요'}
                      </MutedBadge>
                      <Button variant="secondary" size="S" onPress={() => navigate(`/assets/${a.id}`)}>
                        에셋 열기
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {langGroups.size === 0 && <Text UNSAFE_style={{ color: CM.textMuted }}>그룹 없음</Text>}
          </div>
        )}

        {tabId === 'duplicate' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>중복·유사 에셋 그룹</Text>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 12 }}>
              그룹에서 유지할 대표 에셋을 선택합니다. 정리 작업 실행과 감사 리포트는 승인 워크플로와 연결할 수 있습니다.
            </Text>
            {[...dupGroups.entries()].map(([gid, items]) => (
              <div key={gid} style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: CM.breadcrumbBg }}>
                <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'block' }}>{gid}</Text>
                <div style={f({ gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' })}>
                  {items.map(a => (
                    <label key={a.id} style={f({ gap: 8, alignItems: 'center', cursor: 'pointer' })}>
                      <input
                        type="radio"
                        name={gid}
                        checked={duplicateKeep[gid] === a.id}
                        onChange={() => setDuplicateKeep(prev => ({ ...prev, [gid]: a.id }))}
                      />
                      <div style={{ width: 120, height: 90, borderRadius: 8, overflow: 'hidden' }}>
                        <SampleAssetImage filename={a.name} />
                      </div>
                      <div>
                        <Text UNSAFE_style={{ fontSize: 12 }}>{a.name}</Text>
                        <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{a.dim} · {a.modified}</Text>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tabId === 'taxonomy' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>텍소노미 탐색</Text>
            <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 })}>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                현재: {taxonomyPrefix.length ? taxonomyPrefix.join(' › ') : '전체'}
              </Text>
              {taxonomyPrefix.length > 0 && (
                <Button variant="secondary" size="S" onPress={() => setTaxonomyPrefix([])}>
                  상위로
                </Button>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 8,
                maxHeight: 200,
                overflowX: 'auto',
                overflowY: 'hidden',
                marginBottom: 12,
                paddingBottom: 4,
              }}
            >
              {taxonomyKeys
                .filter(k => {
                  const parts = k.split('/');
                  if (taxonomyPrefix.length === 0) return parts.length === 1;
                  const pref = taxonomyPrefix.join('/');
                  return k.startsWith(pref + '/') && parts.length === taxonomyPrefix.length + 1;
                })
                .map(k => {
                  const parts = k.split('/');
                  const label = parts[parts.length - 1];
                  const cnt = taxonomyCounts.get(k) ?? 0;
                  return (
                    <Button
                      key={k}
                      variant="secondary"
                      size="S"
                      onPress={() => setTaxonomyPrefix(k.split('/'))}
                      UNSAFE_style={{ flexShrink: 0 }}
                    >
                      {label} ({cnt})
                    </Button>
                  );
                })}
            </div>
          </div>
        )}

        {(tabId === 'integrated' || tabId === 'visual' || tabId === 'color' || tabId === 'semantic' || tabId === 'taxonomy') && (
          <>
            {tabId === 'integrated' && (
              <>
                <div style={{ width: '100%' }}>
                  <SearchField label="에셋 검색" value={query} onChange={setQuery} />
                </div>
                <div style={f({ gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>적용된 필터</Text>
                  {query && (
                    <MutedBadge tone="info" size="S">
                      검색어: {query}
                    </MutedBadge>
                  )}
                  {[...selCampaigns].map(c => (
                    <MutedBadge key={c} tone="neutral" size="S">
                      캠페인: {c}
                    </MutedBadge>
                  ))}
                  {[...selChannels].map(c => (
                    <MutedBadge key={c} tone="neutral" size="S">
                      채널: {c}
                    </MutedBadge>
                  ))}
                  {[...selSeasons].map(s => (
                    <MutedBadge key={s} tone="neutral" size="S">
                      시즌: {s}
                    </MutedBadge>
                  ))}
                  {[...selStatus].map(s => (
                    <MutedBadge key={s} tone="neutral" size="S">
                      상태: {s}
                    </MutedBadge>
                  ))}
                  {[...selKinds].map(k => (
                    <MutedBadge key={k} tone="neutral" size="S">
                      유형: {k}
                    </MutedBadge>
                  ))}
                  {(dateFrom || dateTo) && (
                    <MutedBadge tone="neutral" size="S">
                      날짜: {dateFrom || '…'} ~ {dateTo || '…'}
                    </MutedBadge>
                  )}
                </div>
                <div style={f({ gap: 8 })}>
                  <Button variant="secondary" size="S" onPress={resetFilters}>
                    필터 초기화
                  </Button>
                  <Button variant="secondary" size="S" onPress={saveCurrentFilter}>
                    현재 필터 저장
                  </Button>
                  {savedFilters.map((sf, i) => (
                    <Button key={i} variant="secondary" size="S" onPress={() => loadSavedFilter(sf.payload)}>
                      불러오기: {sf.name}
                    </Button>
                  ))}
                </div>
              </>
            )}

            <div style={f({ gap: 20 })}>
              {tabId === 'integrated' && (
                <div style={{ ...card, width: 260, flexShrink: 0 }}>
                  <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>복합 필터</Text>
                  <div style={f({ flexDirection: 'column', gap: 16 })}>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>캠페인</Text>
                      <div style={f({ flexDirection: 'column', gap: 4 })}>
                        {campaigns.map(c => (
                          <Checkbox key={c} isSelected={selCampaigns.has(c)} onChange={() => toggle(setSelCampaigns, c)}>
                            {c}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>채널</Text>
                      <div style={f({ flexDirection: 'column', gap: 4 })}>
                        {CHANNEL_OPTS.map(c => (
                          <Checkbox key={c} isSelected={selChannels.has(c)} onChange={() => toggle(setSelChannels, c)}>
                            {c}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>시즌</Text>
                      <div style={f({ flexDirection: 'column', gap: 4 })}>
                        {SEASON_OPTS.map(s => (
                          <Checkbox key={s} isSelected={selSeasons.has(s)} onChange={() => toggle(setSelSeasons, s)}>
                            {s}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>승인 상태</Text>
                      <div style={f({ flexDirection: 'column', gap: 4 })}>
                        {STATUS_OPTS.map(({ key, label }) => (
                          <Checkbox key={key} isSelected={selStatus.has(key)} onChange={() => toggle(setSelStatus, key)}>
                            {label}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>에셋 유형</Text>
                      <div style={f({ flexDirection: 'column', gap: 4 })}>
                        {KIND_OPTS.map(({ key, label }) => (
                          <Checkbox key={key} isSelected={selKinds.has(key)} onChange={() => toggle(setSelKinds, key)}>
                            {label}
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>수정일 범위</Text>
                      <div style={f({ flexDirection: 'column', gap: 8 })}>
                        <TextField label="시작 (YYYY-MM-DD)" value={dateFrom} onChange={setDateFrom} />
                        <TextField label="종료 (YYYY-MM-DD)" value={dateTo} onChange={setDateTo} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 })}>
                  <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary }}>
                    {tabId === 'visual' && visualRef
                      ? `${visualFiltered.length}개 (유사도 ${similarityMin}% 이상)`
                      : tabId === 'color'
                        ? `${colorFiltered.length}개`
                        : tabId === 'semantic'
                          ? `${semanticFiltered.length}개`
                          : tabId === 'taxonomy'
                            ? `${taxonomyFiltered.length}개`
                            : `${integratedFiltered.length}개`}{' '}
                    에셋
                  </Text>
                  <div style={f({ gap: 8 })}>
                    <Button variant={gridMode === 'grid' ? 'accent' : 'secondary'} size="S" onPress={() => setGridMode('grid')}>
                      그리드
                    </Button>
                    <Button variant={gridMode === 'list' ? 'accent' : 'secondary'} size="S" onPress={() => setGridMode('list')}>
                      리스트
                    </Button>
                  </div>
                </div>

                {tabId === 'visual' && !visualRef && (
                  <Text UNSAFE_style={{ color: CM.textMuted, marginBottom: 12 }}>참조 이미지를 선택하면 유사도 순으로 결과가 표시됩니다.</Text>
                )}

                <div
                  style={
                    gridMode === 'grid'
                      ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }
                      : { display: 'flex', flexDirection: 'column', gap: 8 }
                  }
                >
                  {tabId === 'visual' &&
                    visualRef &&
                    visualFiltered.map(({ a, sim }) => renderAssetCard(a, { similarity: `${sim}%` }))}
                  {tabId === 'visual' && !visualRef && ASSETS.map(a => renderAssetCard(a))}
                  {tabId === 'semantic' &&
                    semanticFiltered.map(({ a, reasons }) => renderAssetCard(a, { matchReasons: reasons }))}
                  {tabId === 'integrated' && integratedFiltered.map(a => renderAssetCard(a))}
                  {tabId === 'color' && colorFiltered.map(a => renderAssetCard(a))}
                  {tabId === 'taxonomy' && taxonomyFiltered.map(a => renderAssetCard(a))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
