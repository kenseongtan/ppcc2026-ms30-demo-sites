/* Mesa County Business License (fictional): layout and page logic */
(function () {
  'use strict';
  const S = window.SITE;
  const D = window.COUNTY_DATA;
  const page = document.body.dataset.page;
  document.getElementById('hdr').innerHTML = `<div class="in">
      <span data-seal="MESA COUNTY|STATE OF SAGEBRUSH|✦|#4a3f8f|52"></span>
      <div><div class="name">Mesa County</div><div class="sub">Department of Business License</div></div>
      <nav aria-label="Main"><a href="index.html">License Search</a><a href="index.html#apply">Apply</a><a href="index.html#renew">Renew</a><a href="about.html">Help</a></nav></div>`;
  document.getElementById('ftr').innerHTML = `<div class="in">
      <div>Mesa County Department of Business License · 500 S Grand Central Pkwy, 3rd Floor · (702) 555-0140</div>
      <div>Records updated ${D.updated} · <a href="about.html">About this site</a></div></div>`;

  const BY = { name: 'Business name', owner: 'Business owner', license: 'License number', parcel: 'Parcel number' };
  const PH = { name: 'Search by business name or DBA', owner: 'Search by owner name', license: 'Search by license number', parcel: 'Search by parcel number (e.g. 162-25-701-004)' };
  const STATUS = { all: 'All statuses', active: 'Active', activepending: 'Active and Pending', pending: 'Pending', inactive: 'Inactive' };

  if (page === 'search') {
    const by = S.qs('by') || 'name', q = S.qs('q'), status = S.qs('status') || 'all', pg = Math.max(1, +S.qs('page') || 1);
    const inp = document.getElementById('q'), sel = document.getElementById('status'), hid = document.getElementById('by');
    inp.value = q; sel.value = status; hid.value = by;
    const setBy = (b) => { hid.value = b; inp.placeholder = PH[b]; inp.setAttribute('aria-label', PH[b]); document.querySelectorAll('.tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.by === b))); };
    document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => { setBy(b.dataset.by); inp.focus(); }));
    setBy(by);
    const out = document.getElementById('results');
    if (!q) { out.innerHTML = '<div class="empty">Enter a business name, owner, license number, or parcel number to search Mesa County business licenses.</div>'; return; }
    const okStatus = (s) => status === 'all' || (status === 'active' && s === 'Active') || (status === 'pending' && s === 'Pending') || (status === 'inactive' && s === 'Inactive') || (status === 'activepending' && (s === 'Active' || s === 'Pending'));
    const rows = D.records.filter((r) => okStatus(r.status) && (
      by === 'owner' ? S.match(q, [r.owner], 'contains') : by === 'license' ? S.match(q, [r.lic]) : by === 'parcel' ? S.match(q, [r.parcel]) : S.match(q, [r.name, r.dba], 'contains')));
    const per = 12, pages = Math.max(1, Math.ceil(rows.length / per)), cur = Math.min(pg, pages);
    const slice = rows.slice((cur - 1) * per, cur * per);
    const label = `${rows.length} result${rows.length === 1 ? '' : 's'} for “${S.esc(q)}”` + (status !== 'all' ? ` · ${STATUS[status]}` : '');
    if (!rows.length) { out.innerHTML = `<p class="meta">${label}</p><div class="empty">No business licenses match your search. Check the spelling, or try fewer words.</div>`; return; }
    const link = (p) => `index.html?by=${encodeURIComponent(by)}&q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&page=${p}`;
    out.innerHTML = `<p class="meta">${label}</p><div class="cards">${slice.map((r) => `
      <article class="card">
        <h2><a href="license.html?id=${encodeURIComponent(r.lic)}">${S.esc(r.dba || r.name)}</a></h2>
        <div class="cat">${S.esc(r.category)} · ${S.esc(r.city)}</div>
        <div class="small">${r.dba ? 'Legal name: ' + S.esc(r.name) + '<br>' : ''}License ${S.esc(r.lic)}</div>
        <div class="row"><span class="pill ${S.esc(r.status)}">${S.esc(r.status)}</span>
          <span class="small">${r.status === 'Active' ? 'Renewed ' + S.esc(r.renewed.slice(0, 2) + '/' + r.renewed.slice(6)) : r.status === 'Inactive' ? 'Expired ' + S.esc(r.expires) : 'Application under review'}</span></div>
      </article>`).join('')}</div>
      ${pages > 1 ? `<div class="pager">${cur > 1 ? `<a href="${link(cur - 1)}">‹ Previous</a>` : ''}${Array.from({ length: pages }, (_, i) => i + 1).map((p) => (p === cur ? `<span class="cur">${p}</span>` : `<a href="${link(p)}">${p}</a>`)).join('')}${cur < pages ? `<a href="${link(cur + 1)}">Next ›</a>` : ''}</div>` : ''}`;
  }

  if (page === 'license') {
    const r = D.records.find((x) => x.lic === S.qs('id'));
    const box = document.getElementById('detail');
    if (!r) { box.innerHTML = '<div class="empty">License not found. <a href="index.html">Search again</a>.</div>'; return; }
    document.title = `${r.dba || r.name} – Business License ${r.lic} – Mesa County`;
    const kv = (k, v) => `<div>${k}</div><div>${v || '—'}</div>`;
    box.innerHTML = `<div class="detail">
        <div class="crumbs"><a href="javascript:history.back()">‹ Back to results</a></div>
        <h2>${S.esc(r.dba || r.name)}</h2>
        <div class="row" style="display:flex;gap:12px;align-items:center"><span class="pill ${S.esc(r.status)}">${S.esc(r.status)}</span><span class="small">${S.esc(r.category)}</span></div>
        <div class="dgrid">
          ${kv('License number', S.esc(r.lic))}
          ${kv('Legal business name', S.esc(r.name))}
          ${kv('Doing business as', S.esc(r.dba))}
          ${kv('Business owner', S.esc(r.owner))}
          ${kv('License category', S.esc(r.category))}
          ${kv('License status', S.esc(r.status))}
          ${kv('Original issue date', S.esc(r.issued))}
          ${kv('Last renewed', S.esc(r.renewed))}
          ${kv('Expires', S.esc(r.expires))}
          ${kv('Business address', S.esc(r.street) + '<br>' + S.esc(r.city) + ', ' + S.esc(r.state) + ' ' + S.esc(r.zip))}
          ${kv('Primary jurisdiction', S.esc(r.jurisdiction))}
          ${kv('Parcel number', S.esc(r.parcel))}
          ${kv('Employees reported', S.esc(r.employees))}
        </div>
        <p class="note">License status definitions: <b>Active</b>, the business is currently licensed with Mesa County. <b>Pending</b>, the business has applied for a license that has not been approved yet. <b>Inactive</b>, the business is not currently licensed with Mesa County.</p>
      </div>`;
  }
})();
