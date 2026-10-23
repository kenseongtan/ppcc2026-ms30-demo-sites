/* Sagebrush State Contractors Board (fictional): shared header, footer, and page logic */
(function () {
  'use strict';
  const S = window.SITE;
  const D = window.NVSCB_DATA;
  const page = document.body.dataset.page;
  document.getElementById('hdr').innerHTML = `<div class="in">
      <span data-seal="SAGEBRUSH STATE|CONTRACTORS BOARD|⚒|#173b5c|66"></span>
      <div><div class="t1">State of Sagebrush</div><div class="t2">State Contractors Board</div><div class="t3">Protecting the public through licensing and enforcement since 1941</div></div>
      <div class="right">Las Vegas (702) 555-0100 &nbsp;·&nbsp; Reno (775) 555-0100<br><a href="index.html">Home</a><a href="about.html">Contact</a><a href="about.html">Help</a></div></div>`;
  const on = (p) => (page === p ? ' class="on"' : '');
  document.getElementById('nav').innerHTML = `<div class="in">
      <a href="index.html"${on('home')}>Home</a>
      <a href="ContractorLicenseSearch.html"${on('search')}>License Search</a>
      <a href="index.html#complaints">File a Complaint</a>
      <a href="index.html#licensing">Licensing</a>
      <a href="index.html#homeowners">Homeowners</a>
      <a href="about.html"${on('about')}>About</a></div>`;
  document.getElementById('ftr').innerHTML = `<div class="in">
      <div>State Contractors Board · 2310 Corporate Circle, Suite 200 · Henderson, NV 89074</div>
      <div>Data current as of ${D ? D.updated : ''} · <a href="about.html">About this site</a></div></div>`;

  const BY = { license: 'License Number', company: 'Company Name', principal: 'Principal or Qualified Individual Name' };

  if (page === 'search') {
    const sel = document.getElementById('searchBy'), inp = document.getElementById('criteria'), lab = document.getElementById('critLabel');
    const sync = () => { lab.textContent = BY[sel.value] + ':'; inp.setAttribute('aria-label', BY[sel.value]); };
    sel.addEventListener('change', sync); sync();
    document.getElementById('btnClear').addEventListener('click', () => { inp.value = ''; document.getElementById('err').textContent = ''; inp.focus(); });
    document.getElementById('frm').addEventListener('submit', (e) => {
      e.preventDefault();
      const v = inp.value.trim();
      if (v.replace(/\*/g, '').length < 2) { document.getElementById('err').textContent = 'A minimum of 2 characters must be entered.'; inp.focus(); return; }
      location.href = 'LicenseSearchResults.html?by=' + encodeURIComponent(sel.value) + '&q=' + encodeURIComponent(v);
    });
  }

  if (page === 'results') {
    const by = S.qs('by') || 'company', q = S.qs('q');
    document.getElementById('crit').innerHTML = `<b>Search Criteria</b> &nbsp; ${S.esc(BY[by] || BY.company)}: ${S.esc(q)}`;
    let rows = [];
    if (q) {
      rows = D.records.filter((r) => {
        if (by === 'license') return S.match(q.replace(/^0+/, ''), [r.lic.replace(/^0+/, '')]);
        if (by === 'principal') return S.match(q, [...r.principals.map((p) => p.name), ...r.qualifiers.map((p) => p.name)], 'contains');
        return S.match(q, [r.name, r.dba]);
      });
    }
    document.getElementById('count').textContent = rows.length ? `${rows.length} record(s) found.` : 'No records found matching your search criteria.';
    document.getElementById('tbody').innerHTML = rows.map((r) => `<tr>
        <td>${S.esc(r.principals[0] ? r.principals[0].name : '')}</td>
        <td>${S.esc(r.name.toUpperCase())}</td>
        <td>${S.esc(r.dba.toUpperCase())}</td>
        <td><a href="Details.html?lic=${encodeURIComponent(r.lic)}">${S.esc(r.lic)}</a></td>
        <td>${S.esc(r.nvbid)}</td>
        <td>${r.classes.map((c) => S.esc(c.code + ' ' + c.desc)).join('<br>')}</td>
        <td class="st-${S.esc(r.status.split(' ')[0])}">${S.esc(r.status)}</td>
        <td>${S.esc(r.city.toUpperCase())}</td>
        <td>${S.esc(r.state)}</td></tr>`).join('');
    document.getElementById('tbl').hidden = !rows.length;
  }

  if (page === 'details') {
    const r = D.records.find((x) => x.lic === S.qs('lic'));
    const box = document.getElementById('details');
    if (!r) { box.innerHTML = '<p class="err">License not found. <a href="ContractorLicenseSearch.html">Start a new search</a>.</p>'; return; }
    document.title = `License Details – ${r.lic} – State Contractors Board`;
    const kv = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
    const addr = `${S.esc(r.street.toUpperCase())}<br>${S.esc(r.city.toUpperCase())}, ${S.esc(r.state)} ${S.esc(r.zip)}`;
    box.innerHTML = `<dl class="kv">
        ${kv('License Number:', S.esc(r.lic))}
        ${kv('Current Date:', S.now() + ' (mm/dd/yyyy)')}
        ${kv('Business Primary Name:', S.esc(r.name.toUpperCase()))}
        ${kv('License Monetary Limit:', `<b>${S.money(r.limit)}</b>`)}
        ${kv('DBA Name:', S.esc(r.dba.toUpperCase()))}
        ${kv('Mailing Address:', addr + '<br>' + S.esc(r.phone))}
        ${kv('Physical Address:', addr)}
        ${kv('Status:', `<span class="st-${S.esc(r.status.split(' ')[0])}">${S.esc(r.status)}</span>${r.statusDetail && r.statusDetail !== r.status ? ', ' + S.esc(r.statusDetail) : ''}`)}
        ${kv('Status Date:', S.esc(r.statusDate) + ' (mm/dd/yyyy)')}
        ${kv('Origin Date:', S.esc(r.origin) + ' (mm/dd/yyyy)')}
        ${kv('Expiration Date:', S.esc(r.expiration) + ' (mm/dd/yyyy)')}
        ${kv('Business Type:', S.esc(r.businessType))}
        ${kv('NV Business ID:', S.esc(r.nvbid))}
      </dl>
      <h2>Classification(s)</h2>
      <table class="grid"><thead><tr><th>Classification</th><th>Description</th><th>Limitation</th></tr></thead><tbody>
        ${r.classes.map((c) => `<tr><td>${S.esc(c.code)}</td><td>${S.esc(c.desc)}</td><td>${S.esc(c.limitation)}</td></tr>`).join('')}</tbody></table>
      <h2>Principal(s)</h2>
      <table class="grid"><thead><tr><th>Principal Name</th><th>Relation Description</th></tr></thead><tbody>
        ${r.principals.map((p) => `<tr><td>${S.esc(p.name)}</td><td>${S.esc(p.relation)}</td></tr>`).join('')}</tbody></table>
      <h2>Qualified Individual(s)</h2>
      <table class="grid"><thead><tr><th>Qualified Individual</th><th>Qualifier Type</th></tr></thead><tbody>
        ${r.qualifiers.map((p) => `<tr><td>${S.esc(p.name)}</td><td>${S.esc(p.type)}</td></tr>`).join('')}</tbody></table>
      <h2>Bond Information</h2>
      <dl class="kv">${kv('Bond Type:', S.esc(r.bond.type))}${kv('Bond Amount:', r.bond.amount ? S.money(r.bond.amount) : '')}${kv('Surety Company:', S.esc(r.bond.company))}${kv('Effective Date:', S.esc(r.bond.effective))}</dl>
      <h2>Disciplinary Actions</h2>
      ${r.actions.length ? `<table class="grid"><thead><tr><th>Date</th><th>Action</th></tr></thead><tbody>${r.actions.map((a) => `<tr><td>${S.esc(a.date)}</td><td>${S.esc(a.text)}</td></tr>`).join('')}</tbody></table>` : '<p>No disciplinary actions on record.</p>'}
      <p class="disclaimer">The information contained on these pages is provided as a courtesy and may not reflect recent changes or updates. Neither the completeness nor accuracy is guaranteed. A contractor may not bid or contract for a single project above the monetary limit shown on its license. The Board shall have no liability or responsibility for loss and damages arising from the information provided or retrieved from these pages.</p>`;
  }
})();
