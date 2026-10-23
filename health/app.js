/* Southern Basin Health District (fictional): layout and page logic */
(function () {
  'use strict';
  const S = window.SITE;
  const D = window.HEALTH_DATA;
  const page = document.body.dataset.page;
  document.getElementById('top').innerHTML = `<div class="in"><span>Call us at (702) 555-1000</span><a href="about.html">publicinformation@sbhd.example</a><a href="about.html">Language</a></div>`;
  document.getElementById('hdr').innerHTML = `<div class="in">
      <span data-seal="SOUTHERN BASIN|HEALTH DISTRICT|✚|#00629b|60"></span>
      <div class="org">Southern Basin Health District<small>Healthy people in a healthy Southern Basin</small></div>
      <nav aria-label="Main"><a href="index.html">Clinics</a><a href="index.html">Programs</a><a href="restaurant-inspections.html">Permits &amp; Regulations</a><a href="index.html">News</a><a href="about.html">About Us</a></nav></div>`;
  document.getElementById('ftr').innerHTML = `<div class="in"><div>Southern Basin Health District · 280 S Decatur Blvd · Las Vegas, NV 89107</div><div>Inspection data updated nightly · <a href="about.html">About this site</a></div></div>`;
  const side = document.getElementById('side');
  if (side) {
    const on = (p) => (page === p ? ' class="on"' : '');
    side.innerHTML = `<a href="restaurant-inspections.html"${on('info')}>Restaurant Inspections</a><a href="restaurant-inspection-search.html"${on('search')}>Restaurant Inspection Search</a><a href="developers.html"${on('dev')}>Developers</a><a href="restaurant-inspections.html#process"${on('')}>Inspection Process</a><a href="restaurant-inspections.html#complaint">Food Establishment Complaint Form</a>`;
  }
  const gradeTag = (g) => `<span class="grade ${S.esc(g)}" aria-label="Grade ${S.esc(g)}">${S.esc(g)}</span>`;

  if (page === 'search') {
    const q = S.qs('search'), type = S.qs('type'), hotel = S.qs('hotel'), grade = S.qs('grade'), city = S.qs('city'), zip = S.qs('zip');
    const uniq = (k) => [...new Set(D.records.map((r) => r[k]).filter(Boolean))].sort();
    const opt = (id, vals, cur, all) => { document.getElementById(id).innerHTML = `<option value="">${all}</option>` + vals.map((v) => `<option${v === cur ? ' selected' : ''}>${S.esc(v)}</option>`).join(''); };
    opt('type', uniq('type'), type, 'All types'); opt('hotel', uniq('hotel'), hotel, 'All properties'); opt('grade', ['A', 'B', 'C'], grade, 'All grades'); opt('city', uniq('city'), city, 'All cities');
    document.getElementById('search').value = q; document.getElementById('zip').value = zip;
    const any = q || type || hotel || grade || city || zip;
    const out = document.getElementById('results');
    if (!any) { out.innerHTML = '<p class="count">Enter an establishment name or address, or choose a filter, to see inspection results.</p>'; return; }
    const rows = D.records.filter((r) => (!q || S.match(q, [r.name, r.street, r.permitHolder, r.hotel], 'contains')) && (!type || r.type === type) && (!hotel || r.hotel === hotel) && (!grade || r.grade === grade) && (!city || r.city === city) && (!zip || r.zip.startsWith(zip)));
    const per = 25, pages = Math.max(1, Math.ceil(rows.length / per)), pg = Math.min(Math.max(1, +S.qs('page') || 1), pages);
    const params = new URLSearchParams(location.search);
    const link = (p) => { params.set('page', p); return 'restaurant-inspection-search.html?' + params.toString(); };
    out.innerHTML = `<p class="count">${rows.length} establishment${rows.length === 1 ? '' : 's'} found</p>` + (rows.length ? `<table class="res"><thead><tr><th>Establishment Name</th><th>Address</th><th>Current Grade</th><th>Number of Demerits</th><th>Last Inspection</th><th>Action</th></tr></thead><tbody>
      ${rows.slice((pg - 1) * per, pg * per).map((r) => `<tr><td>${S.esc(r.name)}${r.status === 'Closed' ? '<br><span class="closed">CLOSED – IMMINENT HEALTH HAZARD</span>' : ''}</td><td>${S.esc(r.street)}<br>${S.esc(r.city)}, ${S.esc(r.state)} ${S.esc(r.zip)}</td><td>${gradeTag(r.grade)}</td><td>${r.demerits}</td><td>${S.esc(r.lastInspection)}</td><td><a href="establishment.html?permit=${encodeURIComponent(r.permit)}">Details</a></td></tr>`).join('')}
      </tbody></table>` : '<p>No establishments match your search.</p>') +
      (pages > 1 ? `<div class="pager">${Array.from({ length: pages }, (_, i) => i + 1).map((p) => (p === pg ? `<span>${p}</span>` : `<a href="${link(p)}">${p}</a>`)).join('')}</div>` : '');
  }

  if (page === 'establishment') {
    const r = D.records.find((x) => x.permit === S.qs('permit'));
    const box = document.getElementById('est');
    if (!r) { box.innerHTML = '<p>Establishment not found. <a href="restaurant-inspection-search.html">Search again</a>.</p>'; return; }
    document.title = `${r.name} – Inspection Details – Southern Basin Health District`;
    box.innerHTML = `<h1>${S.esc(r.name)}</h1>
      <dl class="est">
        <dt>Permit number</dt><dd>${S.esc(r.permit)}</dd>
        <dt>Category</dt><dd>${S.esc(r.type)}</dd>
        <dt>Hotel / property</dt><dd>${S.esc(r.hotel) || '—'}</dd>
        <dt>Address</dt><dd>${S.esc(r.street)}, ${S.esc(r.city)}, ${S.esc(r.state)} ${S.esc(r.zip)}</dd>
        <dt>Permit holder</dt><dd>${S.esc(r.permitHolder)}</dd>
        <dt>Permit status</dt><dd>${r.status === 'Closed' ? '<span class="closed">Closed – imminent health hazard</span>' : 'Open'}</dd>
        <dt>Current grade</dt><dd>${gradeTag(r.grade)} &nbsp;${r.demerits} demerits, inspected ${S.esc(r.lastInspection)}</dd>
      </dl>
      <h2>Inspection history</h2>
      ${r.inspections.map((i) => `<div class="insp"><div class="h">${gradeTag(i.grade)}<b>${S.esc(i.date)}</b><span>${S.esc(i.type)}</span><span>${i.demerits} demerits</span></div>
        ${i.violations.length ? `<ul>${i.violations.map((v) => `<li>Violation ${S.esc(v.code)}: ${S.esc(v.text)} (${v.demerits} demerit${v.demerits === 1 ? '' : 's'})</li>`).join('')}</ul>` : '<ul><li>No violations observed.</li></ul>'}</div>`).join('')}
      <p class="callout">Grades: A = 0–10 demerits, B = 11–20, C = 21–40. Inspections are a snapshot of the day and time of the inspection.</p>`;
  }
})();
