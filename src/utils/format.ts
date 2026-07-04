// Indian number formatting (lakh/crore grouping) without relying on Intl,
// which is inconsistently available across Hermes builds.

function groupIndian(intPart: string): string {
  if (intPart.length <= 3) return intPart;
  const last3 = intPart.slice(-3);
  let rest = intPart.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest.length) parts.unshift(rest);
  return parts.join(',') + ',' + last3;
}

export function formatINR(value: number, opts?: { decimals?: number; compact?: boolean }): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (opts?.compact) {
    if (abs >= 1e7) return `${sign}₹${trimZeros((abs / 1e7).toFixed(2))} Cr`;
    if (abs >= 1e5) return `${sign}₹${trimZeros((abs / 1e5).toFixed(2))} L`;
    if (abs >= 1e3) return `${sign}₹${trimZeros((abs / 1e3).toFixed(1))}K`;
  }

  const decimals = opts?.decimals ?? (abs >= 100 ? 0 : abs >= 1 ? 2 : abs === 0 ? 0 : 4);
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const grouped = groupIndian(intPart);
  return `${sign}₹${grouped}${decPart ? '.' + decPart : ''}`;
}

function trimZeros(s: string): string {
  return s.replace(/\.?0+$/, '');
}

export function formatQty(qty: number, symbol?: string): string {
  let s: string;
  if (qty === 0) s = '0';
  else if (qty >= 1000) s = groupIndian(String(Math.round(qty)));
  else if (qty >= 1) s = trimZeros(qty.toFixed(4));
  else s = trimZeros(qty.toFixed(6));
  return symbol ? `${s} ${symbol}` : s;
}

export function formatPct(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}`;
}

export function shortHash(hash: string): string {
  return hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash;
}
