/* City of Desert Springs Business Licensing (fictional): layout and page logic */
(function () {
  'use strict';
  const S = window.SITE;
  const D = window.CITY_DATA;
  const page = document.body.dataset.page;
  document.getElementById('hdr').innerHTML = `<span data-seal="CITY OF DESERT SPRINGS|INCORPORATED 1954|☀|#5c1f2a|58"></span>
      <div><div class="t1">City of Desert Springs</div><div class="t2">Department of Planning &amp; Business Licensing – Business License Inquiry</div></div>`;
  document.getElementById('menu').innerHTML = `<a href="index.html">License Inquiry</a><a href="index.html#apply">How to Apply</a><a href="index.html#fees">Fee Schedule</a><a href="about.html">Contact Us</a>`;
  document.getElementById('ftr').innerHTML = `City of Desert Springs · 2900 Civic Center Dr · Desert Springs, NV 89139 · (702) 555-0177<br>Information current as of ${D.updated}. Best viewed at 1024×768. · <a href="about.html">About this site</a>`;
  const PER = 10;
  const TYPES = [...new Set(D.records.map((r) => r.type))].sort();

  if (page === 'inquiry') {
    document.getElementById('type').innerHTML = '<option value="">-- All Types --</option>' + TYPES.map((t) => `<option>${S.esc(t)}</option>`).join('');
    document.getElementById('frm').addEventListener('submit', (e) => {
      const n = document.getElementById('name').value.trim(), l = document.getElementById('lic').value.trim();
      if (!n && !l) { e.preventDefault(); document.getElementById('err').textContent = 'Please enter a business name or a license number.'; }
    });
  }

  if (page === 'results') {
    const name = S.qs('name'), lic = S.qs('lic'), type = S.qs('type');
    const rows = D.records.filter((r) => (!name || S.match(name, [r.name])) && (!lic || S.match(lic, [r.lic])) && (!type || r.type === type));
    const pages = Math.max(1, Math.ceil(rows.length / PER));
    const pg = Math.min(Math.max(1, +S.qs('page') || 1), pages);
    const crit = [name && `Business name begins with "${S.esc(name)}"`, lic && `License number "${S.esc(lic)}"`, type && `Type "${S.esc(type)}"`].filter(Boolean).join('; ');
    document.getElementById('crit').innerHTML = `Search: ${crit || '(none)'} &nbsp;–&nbsp; ${rows.length} record(s) found.`;
    const link = (p) => `results.html?name=${encodeURIComponent(name)}&lic=${encodeURIComponent(lic)}&type=${encodeURIComponent(type)}&page=${p}`;
    document.getElementById('list').innerHTML = rows.length ? `<table class="list"><thead><tr><th>License No.</th><th>Business</th><th>Type</th><th>Status</th></tr></thead><tbody>
        ${rows.slice((pg - 1) * PER, pg * PER).map((r) => `<tr><td><a href="detail.html?lic=${encodeURIComponent(r.lic)}">${S.esc(r.lic)}</a></td><td>${S.esc(r.name)}</td><td>${S.esc(r.type)}</td><td class="st-${S.esc(r.status.split(' ')[0])}">${S.esc(r.status)}</td></tr>`).join('')}
      </tbody></table>` : '<p>No businesses were found matching your inquiry.</p>';
    document.getElementById('pages').innerHTML = rows.length ? `Page ${pg} of ${pages} ${pg > 1 ? `<a href="${link(pg - 1)}">‹ Prev</a>` : ''}${pg < pages ? `<a href="${link(pg + 1)}">Next ›</a>` : ''}` : '';
  }

  if (page === 'detail') {
    const r = D.records.find((x) => x.lic === S.qs('lic'));
    const box = document.getElementById('det');
    if (!r) { box.innerHTML = '<p>Record not found. <a href="index.html">New inquiry</a></p>'; return; }
    document.title = `${r.name} – Business License ${r.lic} – City of Desert Springs`;
    const tr = (k, v) => `<tr><th>${k}</th><td>${v || '&nbsp;'}</td></tr>`;
    box.innerHTML = `<table class="det">
        ${tr('License Number', S.esc(r.lic))}
        ${tr('Business Name', S.esc(r.name))}
        ${tr('Business Type', S.esc(r.type))}
        ${tr('Owner / Licensee', S.esc(r.owner))}
        ${tr('Business Location', S.esc(r.street) + '<br>' + S.esc(r.city) + ', ' + S.esc(r.state) + ' ' + S.esc(r.zip))}
        ${tr('License Status', `<span class="st-${S.esc(r.status.split(' ')[0])}">${S.esc(r.status)}</span>`)}
        ${tr('Date Issued', S.esc(r.issued))}
        ${tr('Expiration Date', S.esc(r.expires))}
        ${tr('Renewal Application Filed', S.esc(r.renewalFiled))}
        ${tr('Remarks', S.esc(r.note))}
      </table>
      <p class="hint">A business with a status of <b>Renewal Pending</b> has filed a renewal that has not yet been approved. Contact the Business License Division for verification.</p>`;
  }
})();
