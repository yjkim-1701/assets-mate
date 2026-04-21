import { Text, Button, TextField } from '@react-spectrum/s2';
import Video from '@react-spectrum/s2/icons/Video';
import Download from '@react-spectrum/s2/icons/Download';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { MutedBadge } from '../components/MutedBadge';
import { SampleAssetImage } from '../components/SampleAssetImage';
import {
  ASSETS,
  ASSET_VERSION_HISTORY,
  BRAND_VIOLATIONS,
  findAiFixInboxEntryByAssetId,
  getAssetLicense,
  type Asset,
} from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 16,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return (
    <MutedBadge tone={tone} size="M">
      {score}
    </MutedBadge>
  );
}

export default function AssetDetail() {
  const { assetId = '' } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const asset = ASSETS.find(a => a.id === assetId) ?? null;
  const [zoomPct, setZoomPct] = useState(100);
  const [tagsDraft, setTagsDraft] = useState('');
  const [tagsSaved, setTagsSaved] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setTagsDraft(asset.semanticHints.join(', '));
    setTagsSaved(false);
  }, [asset?.id]);

  const versions = ASSET_VERSION_HISTORY[assetId] ?? [];
  const license = useMemo(() => getAssetLicense(assetId), [assetId]);

  const violations = useMemo(() => BRAND_VIOLATIONS.filter(v => v.assetId === assetId), [assetId]);

  const curatedFix = useMemo(() => findAiFixInboxEntryByAssetId(assetId), [assetId]);

  const relatedCampaign = useMemo(() => {
    if (!asset) return [];
    return ASSETS.filter(a => a.campaign === asset.campaign && a.id !== asset.id).slice(0, 6);
  }, [asset]);

  const relatedLang = useMemo(() => {
    if (!asset?.langGroupId) return [];
    return ASSETS.filter(a => a.langGroupId === asset.langGroupId && a.id !== asset.id);
  }, [asset]);

  const similarVisual = useMemo(() => {
    if (!asset) return [];
    return ASSETS.filter(a => a.id !== asset.id && a.visualBucket === asset.visualBucket).slice(0, 4);
  }, [asset]);

  if (!asset) {
    return (
      <>
        <PageHeader title="에셋 상세" description="요청한 에셋을 찾을 수 없습니다" />
        <div style={{ padding: '24px 28px' }}>
          <div style={{ ...card, maxWidth: 480 }}>
            <Text UNSAFE_style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
              ID <code>{assetId}</code>에 해당하는 에셋을 찾을 수 없습니다.
            </Text>
            <Button variant="accent" onPress={() => navigate('/search')}>
              검색으로 이동
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="에셋 상세"
        description={`${asset.name} — 미리보기, 메타데이터, 버전, 라이선스, 관련 에셋`}
      />
      <div style={{ padding: '24px 28px 40px' }}>
        <div style={{ fontSize: 13, color: CM.textSecondary, marginBottom: 16 }}>
          <Link to="/search" style={{ color: CM.primaryBlue, textDecoration: 'none' }}>
            검색
          </Link>
          <span style={{ margin: '0 8px', color: CM.textMuted }}>/</span>
          <span style={{ color: CM.text }}>{asset.name}</span>
        </div>

        <div
          style={{
            ...card,
            marginBottom: 20,
            borderLeft: `4px solid ${CM.accentIndigo}`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={f({ flexDirection: 'column', gap: 6, flex: 1, minWidth: 200 })}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 700 }}>자연어로 이 에셋 수정</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
              브랜드 가이드를 반영한 지시문으로 Firefly 스타일 편집 화면으로 이동합니다.
            </Text>
            {violations.length > 0 && (
              <Link to="/brand" style={{ fontSize: 12, fontWeight: 600, color: CM.primaryBlue, textDecoration: 'none' }}>
                브랜드 인박스에서 위반 {violations.length}건 확인 →
              </Link>
            )}
          </div>
          <div style={f({ gap: 10, alignItems: 'stretch', flexWrap: 'wrap' })}>
            <AccentButton size="M" onPress={() => navigate(`/ai/brand-fix/${asset.id}`)}>
              <MagicWand />
              <Text>AI 자연어 수정 열기</Text>
            </AccentButton>
            {curatedFix && (
              <Button variant="secondary" onPress={() => navigate(`/ai/inbox/${curatedFix.id}`)}>
                AI Curated 검토
              </Button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 24, alignItems: 'start' }}>
          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={card}>
              <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 })}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700 }}>미리보기</Text>
                <label style={f({ alignItems: 'center', gap: 10 })}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>확대 {zoomPct}%</Text>
                  <input
                    type="range"
                    min={100}
                    max={200}
                    value={zoomPct}
                    onChange={e => setZoomPct(Number(e.target.value))}
                    style={{ width: 160 }}
                  />
                </label>
              </div>
              <div
                style={{
                  borderRadius: 12,
                  overflow: 'auto',
                  maxHeight: 520,
                  backgroundColor: CM.surfacePlaceholder,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoomPct / 100})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.12s ease',
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <SampleAssetImage filename={asset.name} />
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
                      }}
                    >
                      <span style={{ width: 56, height: 56, color: 'rgba(255,255,255,0.95)' }}>
                        <Video />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 8, display: 'block' }}>
                라이트박스·핀치 줌과 연동할 수 있으며, 여기서는 확대 배율을 슬라이더로 조절합니다.
              </Text>
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                액션
              </Text>
              <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                <Button variant="secondary" onPress={() => {}}>
                  <span style={f({ alignItems: 'center', gap: 6 })}>
                    <Download />
                    다운로드
                  </span>
                </Button>
                <Button variant="secondary" onPress={() => navigate('/social')}>
                  소셜 리사이즈
                </Button>
                <Button variant="secondary" onPress={() => navigate(`/ai/studio/${asset.id}`)}>
                  AI 스튜디오
                </Button>
                <Button variant="secondary" onPress={() => navigate(`/ai/variations/${asset.id}`)}>
                  변형 생성
                </Button>
                <Button variant="secondary" onPress={() => navigate('/collaboration')}>
                  리뷰 요청
                </Button>
                <Button variant="secondary" onPress={() => navigate('/optimize')}>
                  최적화·크롭
                </Button>
              </div>
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                브랜드 스코어 · 검사
              </Text>
              <div style={f({ alignItems: 'center', gap: 12, marginBottom: 12 })}>
                <ScoreBadge score={asset.brandScore} />
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
                  위반 {violations.length}건 ·{' '}
                  <Link to="/brand" style={{ color: CM.primaryBlue }}>
                    거버넌스 대시보드
                  </Link>
                </Text>
              </div>
              {violations.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: CM.textSecondary }}>
                  {violations.slice(0, 3).map(v => (
                    <li key={v.id}>{v.description}</li>
                  ))}
                </ul>
              ) : (
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>등록된 자동 검사 위반이 없습니다.</Text>
              )}
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                버전 이력
              </Text>
              {versions.length === 0 ? (
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textMuted }}>별도 버전 이력이 없습니다.</Text>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${CM.cardBorder}`, textAlign: 'left' }}>
                      <th style={{ padding: 6 }}>버전</th>
                      <th style={{ padding: 6 }}>수정일</th>
                      <th style={{ padding: 6 }}>작성자</th>
                      <th style={{ padding: 6 }}>사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map(v => (
                      <tr key={v.versionId} style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                        <td style={{ padding: 6 }}>{v.label}</td>
                        <td style={{ padding: 6, color: CM.textSecondary }}>{v.modified}</td>
                        <td style={{ padding: 6 }}>{v.author}</td>
                        <td style={{ padding: 6 }}>{v.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: 12 }}>
                <Button variant="secondary" size="S" onPress={() => navigate('/collaboration')}>
                  버전 비교 (협업)
                </Button>
              </div>
            </div>
          </div>

          <div style={f({ flexDirection: 'column', gap: 16 })}>
            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'block' }}>
                메타데이터
              </Text>
              <dl style={{ margin: 0, fontSize: 13 }}>
                <MetaRow label="파일명" value={asset.name} />
                <MetaRow label="해상도" value={asset.dim} />
                <MetaRow label="용량" value={asset.size} />
                <MetaRow label="포맷" value={asset.format.toUpperCase()} />
                <MetaRow label="캠페인" value={asset.campaign} />
                <MetaRow label="언어" value={asset.lang.toUpperCase()} />
                <MetaRow label="채널" value={asset.channels.join(', ')} />
                <MetaRow label="시즌" value={asset.season} />
                <MetaRow label="유형" value={asset.assetKind} />
                <MetaRow label="수정일" value={asset.modified} />
                <MetaRow label="분류" value={asset.taxonomyPath.join(' › ')} />
                <MetaRow label="승인 상태" value={asset.status} />
              </dl>
              {asset.generationPrompt != null && asset.generationPrompt !== '' && (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: CM.infoBg,
                    border: `1px solid ${CM.cardBorder}`,
                  }}
                >
                  <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                    생성·편집 프롬프트 (메타)
                  </Text>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {asset.generationPrompt}
                  </Text>
                  <div style={{ marginTop: 10 }}>
                    <Button
                      variant="secondary"
                      size="S"
                      onPress={() => {
                        void navigator.clipboard.writeText(asset.generationPrompt ?? '');
                      }}
                    >
                      복사
                    </Button>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12 }}>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>태그 (인라인 편집)</Text>
                <TextField label="쉼표로 구분" value={tagsDraft} onChange={setTagsDraft} />
                <div style={{ marginTop: 8 }}>
                  <AccentButton size="S" onPress={() => setTagsSaved(true)}>
                    태그 저장
                  </AccentButton>
                  {tagsSaved && (
                    <Text UNSAFE_style={{ fontSize: 12, color: CM.success, marginLeft: 12, display: 'inline' }}>
                      저장되었습니다
                    </Text>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>지배색</Text>
                <div style={f({ gap: 6, flexWrap: 'wrap' })}>
                  {asset.dominantColors.map(c => (
                    <span
                      key={c}
                      title={c}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: c,
                        border: `1px solid ${CM.cardBorder}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                라이선스
              </Text>
              <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>{license.licenseType}</Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginTop: 4 }}>
                만료: {license.expires}
              </Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginTop: 8, lineHeight: 1.5, display: 'block' }}>
                {license.terms}
              </Text>
            </div>

            {relatedLang.length > 0 && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  다국어 그룹
                </Text>
                <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                  {relatedLang.map(a => (
                    <ThumbLink key={a.id} asset={a} onNavigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {relatedCampaign.length > 0 && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  동일 캠페인 에셋
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {relatedCampaign.map(a => (
                    <ThumbLink key={a.id} asset={a} onNavigate={navigate} />
                  ))}
                </div>
              </div>
            )}

            {similarVisual.length > 0 && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, display: 'block' }}>
                  유사 비주얼 버킷
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {similarVisual.map(a => (
                    <ThumbLink key={a.id} asset={a} onNavigate={navigate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 8, marginBottom: 8 }}>
      <dt style={{ color: CM.textMuted, margin: 0 }}>{label}</dt>
      <dd style={{ margin: 0 }}>{value}</dd>
    </div>
  );
}

function ThumbLink({ asset, onNavigate }: { asset: Asset; onNavigate: (path: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(`/assets/${asset.id}`)}
      style={{
        border: `1px solid ${CM.cardBorder}`,
        borderRadius: 8,
        padding: 6,
        background: CM.panelBg,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ height: 72, borderRadius: 6, overflow: 'hidden', marginBottom: 6, backgroundColor: CM.surfacePlaceholder }}>
        <SampleAssetImage filename={asset.name} />
      </div>
      <Text UNSAFE_style={{ fontSize: 11, fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {asset.name}
      </Text>
    </button>
  );
}
