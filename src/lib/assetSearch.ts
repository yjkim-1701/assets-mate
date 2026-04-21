import type { Asset } from '../data/mock';

export function buildTaxonomyCounts(assets: Asset[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of assets) {
    for (let d = 1; d <= a.taxonomyPath.length; d++) {
      const key = a.taxonomyPath.slice(0, d).join('/');
      m.set(key, (m.get(key) ?? 0) + 1);
    }
  }
  return m;
}

export function matchesTaxonomyPrefix(path: string[], prefix: string[]): boolean {
  if (prefix.length === 0) return true;
  if (path.length < prefix.length) return false;
  return prefix.every((p, i) => path[i] === p);
}

export function mockVisualSimilarity(a: Asset, ref: Asset | null): number {
  if (!ref) return 100;
  let s = 100 - 14 * Math.abs(a.visualBucket - ref.visualBucket);
  if (a.campaign === ref.campaign) s += 6;
  return Math.max(0, Math.min(100, Math.round(s)));
}

export function colorMatches(asset: Asset, swatches: string[], dominance: number): boolean {
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

export function semanticScore(query: string, asset: Asset): { ok: boolean; reasons: string[] } {
  const q = query.trim().toLowerCase();
  if (!q) return { ok: true, reasons: [] };
  const tokens = q.split(/\s+/).filter(Boolean);
  const reasons: string[] = [];
  for (const h of asset.semanticHints) {
    const hl = h.toLowerCase();
    if (tokens.some(t => hl.includes(t) || (t.length >= 2 && hl.includes(t.slice(0, 2))))) reasons.push(h);
  }
  if (asset.name.toLowerCase().includes(q)) reasons.push('파일명');
  if (asset.campaign.toLowerCase().includes(q)) reasons.push('캠페인');
  const ok = reasons.length > 0 || tokens.some(t => asset.taxonomyPath.some(p => p.toLowerCase().includes(t)));
  if (!ok && tokens.some(t => asset.taxonomyPath.join(' ').toLowerCase().includes(t))) reasons.push('분류');
  return { ok: ok || reasons.length > 0, reasons: reasons.length ? reasons : ['메타/태그'] };
}
