/* Shared helpers for the demo sites (vanilla JS, no dependencies). */
(function () {
  'use strict';
  const S = {};
  S.qs = (k) => new URLSearchParams(location.search).get(k) || '';
  S.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.money = (n) => (n === 0 ? 'Unlimited' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  S.money0 = (n) => '$' + Number(n).toLocaleString('en-US');
  S.now = () => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getMonth() + 1)}/${p(d.getDate())}/${d.getFullYear()} ${d.toLocaleTimeString('en-US')}`; };
  S.norm = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
  // wildcard-aware match: "*smith*" → contains; "smith" → begins with (or contains, by mode) on any of the fields
  S.match = (q, fields, mode) => {
    const n = S.norm(q);
    if (!n) return false;
    if (n.includes('*')) {
      const re = new RegExp('^' + n.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
      return fields.some((f) => re.test(S.norm(f)));
    }
    return fields.some((f) => (mode === 'contains' ? S.norm(f).includes(n) : S.norm(f).startsWith(n)));
  };
  // simple circular seal (fictional agencies only)
  S.seal = (top, bottom, glyph, color, size) => {
    const id = 'p' + Math.random().toString(36).slice(2, 8);
    size = size || 72;
    return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${S.esc(top)} seal">
      <defs><path id="${id}a" d="M 16 50 A 34 34 0 0 1 84 50"/><path id="${id}b" d="M 14 50 A 36 36 0 0 0 86 50"/></defs>
      <circle cx="50" cy="50" r="48" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 2"/>
      <circle cx="50" cy="50" r="24" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="1.2"/>
      <text font-family="Georgia, serif" font-size="8.4" fill="#fff" letter-spacing="1"><textPath href="#${id}a" startOffset="50%" text-anchor="middle">${S.esc(top)}</textPath></text>
      <text font-family="Georgia, serif" font-size="7.6" fill="#fff" letter-spacing="1"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">${S.esc(bottom)}</textPath></text>
      <text x="50" y="57" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="#fff">${glyph}</text>
    </svg>`;
  };
  // fills [data-seal] placeholders
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-seal]').forEach((el) => {
      const [top, bottom, glyph, color, size] = el.dataset.seal.split('|');
      el.innerHTML = S.seal(top, bottom, glyph, color, +size || 72);
    });
  });
  window.SITE = S;
})();
