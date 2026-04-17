import { useState } from 'react';
import { Text, Button, InlineAlert } from '@react-spectrum/s2';
import { PageHeader, CM } from '../components/AppLayout';
import { MutedBadge } from '../components/MutedBadge';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { AccentButton } from '../components/AccentButton';
import {
  FORBIDDEN_ASSETS,
  FORBIDDEN_REASON_LABELS,
  type ForbiddenAssetRow,
} from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 24,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

export default function ForbiddenAssets() {
  const [rows, setRows] = useState<ForbiddenAssetRow[]>(() => [...FORBIDDEN_ASSETS]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map(r => r.id)));
  };

  const bulkLift = () => {
    if (selected.size === 0) return;
    setRows(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
    setBanner(`${selected.size}건을 금지 해제했습니다. (목업)`);
  };

  const simulateDownloadBlock = (name: string) => {
    setBanner(
      `「${name}」은(는) 사용 금지 에셋입니다. 다운로드가 차단되었으며, 아래 대체 에셋을 사용해 주세요.`
    );
  };

  return (
    <>
      <PageHeader
        title="금지 에셋 관리"
        description="라이선스·브랜드 정책상 더 이상 쓰면 안 되는 에셋을 목록으로 관리하고, 검색·다운로드 시 경고합니다"
      />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {banner && (
          <div style={f({ flexDirection: 'column', gap: 8 })}>
            <InlineAlert variant="notice">
              <Text>{banner}</Text>
            </InlineAlert>
            <Button variant="secondary" size="S" onPress={() => setBanner(null)}>
              닫기
            </Button>
          </div>
        )}

        <div style={f({ gap: 12, alignItems: 'center', flexWrap: 'wrap' })}>
          <AccentButton size="S" onPress={bulkLift} isDisabled={selected.size === 0}>
            선택 항목 금지 해제
          </AccentButton>
          <Button variant="secondary" size="S" onPress={toggleAll}>
            {selected.size === rows.length ? '전체 해제' : '전체 선택'}
          </Button>
          <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
            관리자 일괄 처리 · 다운로드 시도 시 차단 + 대체 제안 (목업)
          </Text>
        </div>

        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 16 }}>
            금지 목록 ({rows.length})
          </Text>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: `1px solid ${CM.cardBorder}` }}>
                  <th style={{ padding: '10px 8px', width: 36 }} />
                  <th style={{ padding: '10px 8px' }}>에셋</th>
                  <th style={{ padding: '10px 8px' }}>사유</th>
                  <th style={{ padding: '10px 8px' }}>금지 일시</th>
                  <th style={{ padding: '10px 8px' }}>대체 에셋</th>
                  <th style={{ padding: '10px 8px' }}>참조</th>
                  <th style={{ padding: '10px 8px' }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style={{ borderBottom: `1px solid ${CM.cardBorder}` }}>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <input
                        type="checkbox"
                        checked={selected.has(row.id)}
                        onChange={() => toggle(row.id)}
                        aria-label={`${row.assetName} 선택`}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <div style={f({ gap: 10, alignItems: 'center' })}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            overflow: 'hidden',
                            backgroundColor: CM.surfacePlaceholder,
                            flexShrink: 0,
                          }}
                        >
                          <SampleAssetImage filename={row.assetName} />
                        </div>
                        <div style={f({ flexDirection: 'column', gap: 4 })}>
                          <div style={f({ gap: 6, alignItems: 'center', flexWrap: 'wrap' })}>
                            <Text UNSAFE_style={{ fontWeight: 600 }}>{row.assetName}</Text>
                            <MutedBadge tone="danger" size="S">
                              사용 금지
                            </MutedBadge>
                          </div>
                          <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted }}>{row.assetId}</Text>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <MutedBadge tone="warning" size="S">
                        {FORBIDDEN_REASON_LABELS[row.reason]}
                      </MutedBadge>
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top', color: CM.textSecondary }}>
                      {row.forbiddenAt}
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      {row.replacementName ? (
                        <div style={f({ flexDirection: 'column', gap: 4 })}>
                          <Text UNSAFE_style={{ fontSize: 13 }}>{row.replacementName}</Text>
                          <Button variant="secondary" size="S" onPress={() => {}}>
                            대체로 이동
                          </Button>
                        </div>
                      ) : (
                        <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>제안 없음</Text>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top', maxWidth: 220 }}>
                      {row.usedIn.map((u, i) => (
                        <div key={i} style={{ marginBottom: 4 }}>
                          <Text UNSAFE_style={{ fontSize: 12 }}>
                            {u.type === 'campaign' ? '캠페인' : '페이지'} · {u.name}
                          </Text>
                        </div>
                      ))}
                    </td>
                    <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                      <Button variant="accent" size="S" onPress={() => simulateDownloadBlock(row.assetName)}>
                        다운로드 시도
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, padding: 24 }}>
              등록된 금지 에셋이 없습니다.
            </Text>
          )}
        </div>
      </div>
    </>
  );
}
