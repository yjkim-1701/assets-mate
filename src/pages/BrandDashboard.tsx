import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';
import { Text, Button } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { MutedMeter } from '../components/MutedMeter';
import Color from '@react-spectrum/s2/icons/Color';
import Logo from '@react-spectrum/s2/icons/Logo';
import TextIcon from '@react-spectrum/s2/icons/Text';
import Layout from '@react-spectrum/s2/icons/Layout';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import {
  BRAND_VIOLATIONS,
  LICENSES_EXPIRING,
  buildCampaignGovernanceSummaries,
  groupBrandViolationsByCampaign,
  groupLicensesByCampaign,
  type BrandViolation,
  type LicenseExpiringRow,
} from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const CATEGORY_SCORES: { name: string; score: number; Icon: ComponentType }[] = [
  { name: '색상', score: 92, Icon: Color },
  { name: '로고', score: 88, Icon: Logo },
  { name: '폰트', score: 85, Icon: TextIcon },
  { name: '레이아웃', score: 81, Icon: Layout },
];

function SeverityBadge({ severity }: { severity: string }) {
  const tone = severity === 'high' ? 'danger' : severity === 'medium' ? 'warning' : 'info';
  const label = severity === 'high' ? '높음' : severity === 'medium' ? '보통' : '낮음';
  return (
    <MutedBadge tone={tone} size="S">
      {label}
    </MutedBadge>
  );
}

function ViolationRows({
  items,
  navigate,
}: {
  items: readonly BrandViolation[];
  navigate: (path: string) => void;
}) {
  return (
    <div style={f({ flexDirection: 'column', gap: 12 })}>
      {items.map(v => (
        <div
          key={v.id}
          style={f({
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: CM.dangerBg,
            borderRadius: 8,
          })}
        >
          <div style={f({ flexDirection: 'column', gap: 4 })}>
            <div style={f({ gap: 8, alignItems: 'center' })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{v.assetName}</Text>
              <SeverityBadge severity={v.severity} />
            </div>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{v.description}</Text>
          </div>
          <AccentButton size="S" onPress={() => navigate(`/ai/brand-fix/${v.assetId}`)}>
            <MagicWand />
            <Text>AI 수정</Text>
          </AccentButton>
        </div>
      ))}
    </div>
  );
}

function LicenseRows({ items }: { items: readonly LicenseExpiringRow[] }) {
  return (
    <div style={f({ flexDirection: 'column', gap: 12 })}>
      {items.map(lic => (
        <div
          key={lic.id}
          style={f({
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            backgroundColor: CM.warningBg,
            borderRadius: 8,
          })}
        >
          <div style={f({ gap: 12, alignItems: 'center' })}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                overflow: 'hidden',
                flexShrink: 0,
                backgroundColor: CM.surfacePlaceholder,
              }}
            >
              <SampleAssetImage filename={lic.assetName} />
            </div>
            <div style={f({ flexDirection: 'column', gap: 2 })}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{lic.assetName}</Text>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{lic.type}</Text>
            </div>
          </div>
          <MutedBadge tone={lic.daysLeft <= 7 ? 'danger' : 'warning'} size="S">
            D-{lic.daysLeft}
          </MutedBadge>
        </div>
      ))}
    </div>
  );
}

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [listMode, setListMode] = useState<'flat' | 'byCampaign'>('flat');

  const campaignSummaries = useMemo(() => buildCampaignGovernanceSummaries(), []);
  const violationGroups = useMemo(
    () => [...groupBrandViolationsByCampaign(BRAND_VIOLATIONS).entries()].sort((a, b) => b[1].length - a[1].length),
    []
  );
  const licenseGroups = useMemo(
    () => [...groupLicensesByCampaign(LICENSES_EXPIRING).entries()].sort((a, b) => b[1].length - a[1].length),
    []
  );

  return (
    <>
      <PageHeader title="브랜드 거버넌스" description="브랜드 일관성과 컴플라이언스 현황을 확인합니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={f({ gap: 12, flexWrap: 'wrap' })}>
          <Link
            to="/brand/template-locks"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: CM.primaryBlue,
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${CM.cardBorder}`,
              backgroundColor: CM.panelBg,
            }}
          >
            템플릿 잠금 영역 →
          </Link>
          <Link
            to="/brand/forbidden"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: CM.primaryBlue,
              textDecoration: 'none',
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${CM.cardBorder}`,
              backgroundColor: CM.panelBg,
            }}
          >
            금지 에셋 관리 →
          </Link>
        </div>
        <div style={card}>
          <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 })}>
            <Text UNSAFE_style={{ fontSize: 18, fontWeight: 'bold' }}>브랜드 건강도 종합 스코어</Text>
            <Text UNSAFE_style={{ fontSize: 36, fontWeight: 'bold', color: CM.success }}>87 / 100</Text>
          </div>
          <div style={f({ gap: 24, flexWrap: 'wrap' })}>
            {CATEGORY_SCORES.map(cat => {
              const CatIcon = cat.Icon;
              return (
                <div key={cat.name} style={{ flex: 1, minWidth: 140 }}>
                  <div style={f({ gap: 8, alignItems: 'center', marginBottom: 8 })}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: CM.text,
                      }}
                    >
                      <CatIcon />
                    </span>
                    <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</Text>
                  </div>
                  <MutedMeter
                    value={cat.score}
                    label={`${cat.score}/100`}
                    variant={cat.score >= 90 ? 'positive' : cat.score >= 80 ? 'informative' : 'notice'}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
            캠페인별 요약
          </Text>
          <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, display: 'block', marginBottom: 14 }}>
            에셋 평균 브랜드 스코어·위반·만료 임박 라이선스 건수입니다. 카드를 눌러 해당 캠페인으로 검색을 엽니다.
          </Text>
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              paddingBottom: 4,
              scrollSnapType: 'x mandatory',
            }}
          >
            {campaignSummaries.map(s => (
              <Link
                key={s.campaign}
                to={`/search?campaign=${encodeURIComponent(s.campaign)}`}
                style={{
                  scrollSnapAlign: 'start',
                  minWidth: 200,
                  flex: '0 0 auto',
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${CM.cardBorder}`,
                  backgroundColor: CM.panelBg,
                  textDecoration: 'none',
                  color: CM.text,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 700 }}>{s.campaign}</Text>
                <div style={f({ gap: 6, flexWrap: 'wrap' })}>
                  <MutedBadge tone="neutral" size="S">
                    에셋 {s.assetCount}
                  </MutedBadge>
                  <MutedBadge tone={s.avgBrandScore >= 80 ? 'success' : s.avgBrandScore >= 60 ? 'warning' : 'danger'} size="S">
                    평균 {s.avgBrandScore}
                  </MutedBadge>
                  {s.violationCount > 0 && (
                    <MutedBadge tone="danger" size="S">
                      위반 {s.violationCount}
                    </MutedBadge>
                  )}
                  {s.licensesExpiringCount > 0 && (
                    <MutedBadge tone="warning" size="S">
                      라이선스 {s.licensesExpiringCount}
                    </MutedBadge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div style={f({ gap: 12, alignItems: 'center', flexWrap: 'wrap' })}>
          <Text UNSAFE_style={{ fontSize: 14, fontWeight: 600 }}>위반·라이선스 보기</Text>
          <div style={f({ gap: 8 })}>
            <Button variant={listMode === 'flat' ? 'accent' : 'secondary'} size="S" onPress={() => setListMode('flat')}>
              전체
            </Button>
            <Button
              variant={listMode === 'byCampaign' ? 'accent' : 'secondary'}
              size="S"
              onPress={() => setListMode('byCampaign')}
            >
              캠페인별
            </Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={card}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>위반 에셋 목록</Text>
              <MutedBadge tone="danger" size="S">
                {BRAND_VIOLATIONS.length}건
              </MutedBadge>
            </div>
            {listMode === 'flat' ? (
              <ViolationRows items={BRAND_VIOLATIONS} navigate={navigate} />
            ) : (
              <div style={f({ flexDirection: 'column', gap: 8 })}>
                {violationGroups.map(([campaign, violations], idx) => (
                  <details
                    key={campaign}
                    open={idx === 0}
                    style={{
                      border: `1px solid ${CM.cardBorder}`,
                      borderRadius: 8,
                      padding: '4px 10px 10px',
                      backgroundColor: CM.panelBg,
                    }}
                  >
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '8px 4px',
                        listStyle: 'none',
                      }}
                    >
                      <span style={f({ gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                        {campaign}
                        <MutedBadge tone="danger" size="S">
                          {violations.length}건
                        </MutedBadge>
                        <Link
                          to={`/search?campaign=${encodeURIComponent(campaign)}`}
                          style={{ fontSize: 12, fontWeight: 500, color: CM.primaryBlue }}
                          onClick={e => e.stopPropagation()}
                        >
                          검색 →
                        </Link>
                      </span>
                    </summary>
                    <div style={{ marginTop: 8 }}>
                      <ViolationRows items={violations} navigate={navigate} />
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={f({ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 })}>
              <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold' }}>만료 임박 라이선스</Text>
              <MutedBadge tone="warning" size="S">
                {LICENSES_EXPIRING.length}건
              </MutedBadge>
            </div>
            {listMode === 'flat' ? (
              <LicenseRows items={LICENSES_EXPIRING} />
            ) : (
              <div style={f({ flexDirection: 'column', gap: 8 })}>
                {licenseGroups.map(([campaign, rows], idx) => (
                  <details
                    key={campaign}
                    open={idx === 0}
                    style={{
                      border: `1px solid ${CM.cardBorder}`,
                      borderRadius: 8,
                      padding: '4px 10px 10px',
                      backgroundColor: CM.panelBg,
                    }}
                  >
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        padding: '8px 4px',
                        listStyle: 'none',
                      }}
                    >
                      <span style={f({ gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                        {campaign}
                        <MutedBadge tone="warning" size="S">
                          {rows.length}건
                        </MutedBadge>
                        <Link
                          to={`/search?campaign=${encodeURIComponent(campaign)}`}
                          style={{ fontSize: 12, fontWeight: 500, color: CM.primaryBlue }}
                          onClick={e => e.stopPropagation()}
                        >
                          검색 →
                        </Link>
                      </span>
                    </summary>
                    <div style={{ marginTop: 8 }}>
                      <LicenseRows items={rows} />
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
            6개월 브랜드 스코어 추이
          </Text>
          <div style={f({ gap: 32, justifyContent: 'center', alignItems: 'flex-end', height: 120 })}>
            {[78, 82, 85, 83, 86, 87].map((val, i) => (
              <div key={i} style={f({ flexDirection: 'column', alignItems: 'center', gap: 4 })}>
                <div
                  style={{
                    width: 40,
                    height: val,
                    backgroundColor: val >= 85 ? '#A7F3D0' : '#FDE68A',
                    borderRadius: 4,
                    border: `1px solid ${val >= 85 ? '#6EE7B7' : '#FCD34D'}`,
                  }}
                />
                <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>
                  {['11월', '12월', '1월', '2월', '3월', '4월'][i]}
                </Text>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 'bold' }}>{val}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
