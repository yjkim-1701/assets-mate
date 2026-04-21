import { useEffect, useMemo, useState } from 'react';
import { Text, Button, TextField, Switch, Checkbox } from '@react-spectrum/s2';
import { Link } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { MutedBadge } from '../components/MutedBadge';
import { CAMPAIGNS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS = [
  { id: 'governance' as const, label: '브랜드 거버넌스 가이드' },
  { id: 'taxonomy' as const, label: '텍소노미·분류' },
  { id: 'channels' as const, label: '채널·소셜 프리셋' },
  { id: 'notifications' as const, label: '알림·임계값' },
  { id: 'ai' as const, label: 'AI 사용 정책' },
  { id: 'users' as const, label: '역할·사용자' },
];
type TabId = (typeof TABS)[number]['id'];

type GuideStatus = 'draft' | 'published';

interface GovernanceGuide {
  id: string;
  name: string;
  version: string;
  scope: 'global' | 'campaign';
  campaignId: string | null;
  status: GuideStatus;
  publishedAt?: string;
}

const SEVERITY_ROWS = [
  { rule: '금지 로고 변형', level: '차단' as const },
  { rule: '브랜드 색상 이탈', level: '경고' as const },
  { rule: '메타데이터 누락', level: '경고' as const },
  { rule: '라이선스 만료 임박', level: '통과(알림)' as const },
];

function statusBadge(status: GuideStatus) {
  return status === 'published' ? (
    <MutedBadge tone="success" size="S">
      게시됨
    </MutedBadge>
  ) : (
    <MutedBadge tone="neutral" size="S">
      초안
    </MutedBadge>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<TabId>('governance');
  const [guides, setGuides] = useState<GovernanceGuide[]>([
    {
      id: 'g1',
      name: '글로벌 브랜드 2026',
      version: '2.1',
      scope: 'global',
      campaignId: null,
      status: 'published',
      publishedAt: '2026-03-01',
    },
    {
      id: 'g2',
      name: '캠페인 오버라이드',
      version: '1.0',
      scope: 'campaign',
      campaignId: CAMPAIGNS[0]?.id ?? null,
      status: 'draft',
    },
  ]);
  const [selectedId, setSelectedId] = useState<string>('g1');
  const [editName, setEditName] = useState('');
  const [editVersion, setEditVersion] = useState('');
  const [editScope, setEditScope] = useState<'global' | 'campaign'>('global');
  const [editCampaign, setEditCampaign] = useState<string>(CAMPAIGNS[0]?.id ?? '');
  const [ruleBanned, setRuleBanned] = useState(true);
  const [ruleLogo, setRuleLogo] = useState(true);
  const [ruleColorType, setRuleColorType] = useState(true);
  const [ruleMeta, setRuleMeta] = useState(false);
  const [ruleLicense, setRuleLicense] = useState(true);
  const [licenseDays, setLicenseDays] = useState(30);
  const [violationNotify, setViolationNotify] = useState(true);
  const [aiHumanApproval, setAiHumanApproval] = useState(true);
  const [aiLogRetention, setAiLogRetention] = useState('90');

  const selected = useMemo(() => guides.find(g => g.id === selectedId) ?? guides[0], [guides, selectedId]);

  useEffect(() => {
    const g = guides.find(x => x.id === selectedId);
    if (!g) return;
    setEditName(g.name);
    setEditVersion(g.version);
    setEditScope(g.scope);
    setEditCampaign(g.campaignId ?? CAMPAIGNS[0]?.id ?? '');
  }, [guides, selectedId]);

  const saveDraft = () => {
    setGuides(prev =>
      prev.map(g =>
        g.id === selectedId
          ? {
              ...g,
              name: editName.trim() || g.name,
              version: editVersion.trim() || g.version,
              scope: editScope,
              campaignId: editScope === 'campaign' ? editCampaign : null,
              status: 'draft' as const,
              publishedAt: undefined,
            }
          : g
      )
    );
  };

  const publishGuide = () => {
    setGuides(prev =>
      prev.map(g =>
        g.id === selectedId
          ? {
              ...g,
              name: editName.trim() || g.name,
              version: editVersion.trim() || g.version,
              scope: editScope,
              campaignId: editScope === 'campaign' ? editCampaign : null,
              status: 'published' as const,
              publishedAt: new Date().toISOString().slice(0, 10),
            }
          : g
      )
    );
  };

  return (
    <>
      <PageHeader
        title="설정"
        description="브랜드 거버넌스 가이드를 비롯해 분류·채널·알림·AI 정책을 한 허브에서 관리합니다. (목업)"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
          {TABS.map(t =>
            tab === t.id ? (
              <Button key={t.id} variant="accent" size="S" onPress={() => setTab(t.id)}>
                {t.label}
              </Button>
            ) : (
              <Button key={t.id} variant="secondary" size="S" onPress={() => setTab(t.id)}>
                {t.label}
              </Button>
            )
          )}
        </div>

        {tab === 'governance' && (
          <div style={{ ...f({ gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }), minHeight: 0 }}>
            <div style={{ ...card, flex: '1 1 280px', minWidth: 260, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>가이드 목록</Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>
                업로드·AI 보정·브랜드 대시보드가 참조하는 규칙의 단일 소스(목업)입니다.
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {guides.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedId(g.id)}
                    style={{
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${g.id === selectedId ? CM.primaryBlue : CM.cardBorder}`,
                      backgroundColor: g.id === selectedId ? CM.infoBg : CM.mainBg,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={f({ justifyContent: 'space-between', alignItems: 'center', gap: 8 })}>
                      <Text UNSAFE_style={{ fontSize: 13, fontWeight: 700 }}>{g.name}</Text>
                      {statusBadge(g.status)}
                    </div>
                    <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 4, display: 'block' }}>
                      v{g.version} ·{' '}
                      {g.scope === 'global'
                        ? '전역'
                        : `캠페인: ${CAMPAIGNS.find(c => c.id === g.campaignId)?.name ?? g.campaignId ?? '-'}`}
                      {g.publishedAt ? ` · 게시 ${g.publishedAt}` : ''}
                    </Text>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...card, flex: '2 1 360px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>편집: {selected?.name}</Text>
              <div style={f({ gap: 12, flexWrap: 'wrap' })}>
                <TextField label="이름" value={editName} onChange={setEditName} />
                <TextField label="버전" value={editVersion} onChange={setEditVersion} />
              </div>
              <div>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                  적용 범위
                </Text>
                <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                  <Button variant={editScope === 'global' ? 'accent' : 'secondary'} size="S" onPress={() => setEditScope('global')}>
                    전역
                  </Button>
                  <Button variant={editScope === 'campaign' ? 'accent' : 'secondary'} size="S" onPress={() => setEditScope('campaign')}>
                    캠페인 오버라이드
                  </Button>
                </div>
                {editScope === 'campaign' && (
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 6 }}>캠페인</label>
                    <select
                      value={editCampaign}
                      onChange={e => setEditCampaign(e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: `1px solid ${CM.cardBorder}`,
                        fontSize: 13,
                        minWidth: 200,
                        backgroundColor: CM.panelBg,
                      }}
                    >
                      {CAMPAIGNS.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                  규칙 세트
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Checkbox isSelected={ruleBanned} onChange={setRuleBanned}>
                    금지 요소(금지 로고·카피)
                  </Checkbox>
                  <Checkbox isSelected={ruleLogo} onChange={setRuleLogo}>
                    로고 안전영역
                  </Checkbox>
                  <Checkbox isSelected={ruleColorType} onChange={setRuleColorType}>
                    색상·타이포그래피
                  </Checkbox>
                  <Checkbox isSelected={ruleMeta} onChange={setRuleMeta}>
                    필수 메타데이터
                  </Checkbox>
                  <Checkbox isSelected={ruleLicense} onChange={setRuleLicense}>
                    라이선스·만료 정책 연동
                  </Checkbox>
                </div>
              </div>

              <div>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                  위반 유형별 심각도 (표시 전용 목업)
                </Text>
                <div style={{ border: `1px solid ${CM.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
                  {SEVERITY_ROWS.map((row, i) => (
                    <div
                      key={row.rule}
                      style={{
                        ...f({ justifyContent: 'space-between', padding: '8px 12px' }),
                        backgroundColor: i % 2 === 0 ? CM.mainBg : CM.panelBg,
                        fontSize: 12,
                      }}
                    >
                      <span>{row.rule}</span>
                      <MutedBadge tone={row.level === '차단' ? 'danger' : row.level === '경고' ? 'warning' : 'success'} size="S">
                        {row.level}
                      </MutedBadge>
                    </div>
                  ))}
                </div>
              </div>

              <div style={f({ gap: 10, flexWrap: 'wrap', alignItems: 'center' })}>
                <Button variant="secondary" onPress={saveDraft}>
                  초안 저장
                </Button>
                <AccentButton onPress={publishGuide}>게시</AccentButton>
              </div>
            </div>
          </div>
        )}

        {tab === 'taxonomy' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>텍소노미·분류 정책</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
              검색의 텍소노미 탐색·에셋 업로드 시 제안 분류·캠페인 메타와 연동됩니다. 실서비스에서는 트리 편집·필수 태그 규칙을 이곳에서 정의합니다.
            </Text>
            <Link to="/search" style={{ color: CM.primaryBlue, fontWeight: 600, fontSize: 13 }}>
              검색 & 탐색으로 이동 →
            </Link>
          </div>
        )}

        {tab === 'channels' && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>채널·소셜 프리셋</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
              채널별 해상도·안전 영역 프리셋은 소셜 리사이즈와 동일 스펙을 쓰도록 맞춥니다.
            </Text>
            <Link to="/social/resize" style={{ color: CM.primaryBlue, fontWeight: 600, fontSize: 13 }}>
              소셜 리사이즈로 이동 →
            </Link>
          </div>
        )}

        {tab === 'notifications' && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>알림·임계값</Text>
            <div>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                라이선스 만료 알림 (일 전)
              </Text>
              <input
                type="range"
                min={7}
                max={90}
                value={licenseDays}
                onChange={e => setLicenseDays(Number(e.target.value))}
                style={{ width: '100%', maxWidth: 360 }}
              />
              <Text UNSAFE_style={{ fontSize: 12, marginTop: 6 }}>{licenseDays}일 전</Text>
            </div>
            <Switch isSelected={violationNotify} onChange={setViolationNotify}>
              브랜드 위반 발생 시 인박스·헤더 알림
            </Switch>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>
              목업: 값은 UI에만 반영되며 브랜드 대시보드 데이터와는 연결되지 않습니다.
            </Text>
          </div>
        )}

        {tab === 'ai' && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>AI 사용 정책</Text>
            <Switch isSelected={aiHumanApproval} onChange={setAiHumanApproval}>
              자동 보정 결과는 항상 인간 승인 필요
            </Switch>
            <TextField label="프롬프트·감사 로그 보존(일)" value={aiLogRetention} onChange={setAiLogRetention} />
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>
              Firefly 연동 범위·데이터 주체 표시는 엔터프라이즈 배포 시 확장합니다.
            </Text>
          </div>
        )}

        {tab === 'users' && (
          <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>역할·사용자</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, lineHeight: 1.6 }}>
              관리자는 거버넌스 가이드 게시·사용자 초대를 할 수 있고, 편집자는 에셋 업로드·AI 요청만 가능한 식으로 역할을 나눕니다. (목업)
            </Text>
            <div style={f({ gap: 8, flexWrap: 'wrap' })}>
              <MutedBadge tone="accent" size="S">
                관리자 2
              </MutedBadge>
              <MutedBadge tone="neutral" size="S">
                편집자 18
              </MutedBadge>
              <MutedBadge tone="info" size="S">
                뷰어 41
              </MutedBadge>
            </div>
            <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, marginTop: 8 }}>브랜드 하위 정책</Text>
            <div style={f({ gap: 12, flexWrap: 'wrap' })}>
              <Link to="/brand/template-locks" style={{ color: CM.primaryBlue, fontSize: 13 }}>
                템플릿 잠금 영역 →
              </Link>
              <Link to="/brand/forbidden" style={{ color: CM.primaryBlue, fontSize: 13 }}>
                금지 에셋 관리 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
