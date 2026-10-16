export const SCHEMA_VERSION = 1;
export const STATUS = ['pending', 'approved', 'rejected'];
export const money = n => `${n < 0 ? '-' : ''}HK$${new Intl.NumberFormat('en-HK', { maximumFractionDigits: 2 }).format(Math.abs(n))}`;
export const id = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const reviewReason = item => item.evidenceNeedsReview ? 'New evidence submitted; QS review required.' : item.reason;
export const needsReview = item => (item.claimed && item.status === 'pending') || !!item.evidenceNeedsReview;
export const reviewQueue = project => project.items.filter(needsReview);
export const reportItems = project => project.items.filter(i => (i.claimed && i.status !== 'approved') || i.evidenceNeedsReview);
export const valuationReference = project => project.valuationReference || 'Current review';
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
export function validSourceURL(value) { try { const u = new URL(value); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; } catch { return false; } }

export function createDemo() {
  const unresolved = { 17: 'Installation needs QS confirmation', 52: 'Current photograph missing', 53: 'Frame only; full door unit not verified', 54: 'Door obscured in supplied evidence', 55: 'Door type needs a schedule check' };
  const items = Array.from({ length: 60 }, (_, i) => {
    const n = i + 1, previous = n <= 41 && n !== 17, approved = n <= 51 && n !== 17;
    return {
      id: `D-${String(n).padStart(3, '0')}`, bqId: n <= 40 ? 'BQ-DR-01' : 'BQ-DR-02',
      room: `3${String(n).padStart(2, '0')}`, floor: 'Floor 3', zone: n <= 30 ? 'Zone B' : 'Zone C',
      claimed: n <= 55, previous, status: approved ? 'approved' : 'pending',
      stage: n === 53 ? 'Frame only' : n === 54 ? 'Not visible' : 'Leaf and frame installed',
      reason: unresolved[n] || (approved ? 'QS-approved sample baseline.' : 'Outside the current claim.'),
      evidence: n === 52 || n > 55 ? [] : [{ id: `sample-${n}`, name: `Door ${n} — sample illustration`, capturedAt: '2026-10-12', source: 'Synthetic demo', note: n === 17 ? 'Leaf and frame installed; awaiting QS review.' : unresolved[n] || 'Installation recorded.', sample: true }],
      reviewedBy: approved ? 'Sample QS' : '', reviewedAt: approved ? '2026-10-12T10:00:00+08:00' : ''
    };
  });
  return {
    schemaVersion: SCHEMA_VERSION, name: 'Harbour House', scope: 'Level 03 · Door installation', period: 'October 2026', valuationDate: '2026-10-15', valuationReference: 'IPC-010', previousCertificate: 'IPC-009', reviewer: 'Alex Chan · QS',
    bq: [{ id: 'BQ-DR-01', description: 'Solid core timber door set · Type A', unit: 'nr', quantity: 40, rate: 2000 }, { id: 'BQ-DR-02', description: 'Solid core timber door set · Type B', unit: 'nr', quantity: 20, rate: 2000 }],
    items, history: [{ id: id(), at: '2026-10-12T10:00:00+08:00', actor: 'Sample QS', type: 'baseline', itemId: '', note: 'Sample loaded: 40 previously certified; 50 currently approved; 55 claimed.' }],
    variations: [{ id: 'VO-001', title: 'Additional door at storage room', location: 'Floor 3 · Store', amount: 2000, status: 'For review', instruction: 'Instruction reference required', note: 'Separate from this door claim. Not included in the assessment.' }],
    isDemo: true
  };
}

export function validateProject(p) {
  if (!p || p.schemaVersion !== 1 || !Array.isArray(p.items) || !p.items.length || !Array.isArray(p.bq) || !p.bq.length || !Array.isArray(p.history) || !Array.isArray(p.variations)) throw new Error('Use a non-empty SAVE project backup (version 1).');
  for (const key of ['name','scope','period','valuationDate','previousCertificate','reviewer']) if (typeof p[key] !== 'string' || !p[key].trim() || p[key].length > 300) throw new Error(`Invalid project ${key}.`);
  if (!validDate(p.valuationDate)) throw new Error('Invalid valuation date.');
  if (p.valuationReference !== undefined && (typeof p.valuationReference !== 'string' || !p.valuationReference.trim() || p.valuationReference.length > 300)) throw new Error('Invalid valuation reference.');
  if (p.items.length > 2000 || p.bq.length > 500) throw new Error('Prototype limit: 2,000 items and 500 BQ lines.');
  const bqIds = new Set();
  for (const b of p.bq) {
    if (!b || typeof b.id !== 'string' || !b.id || bqIds.has(b.id) || typeof b.description !== 'string' || !b.description.trim()) throw new Error('BQ item IDs must be unique and have a description.');
    if (b.unit !== 'nr') throw new Error('This prototype assesses countable units (nr) only.');
    if (!Number.isFinite(b.rate) || b.rate < 0 || b.rate > 1e9 || !Number.isInteger(b.quantity) || b.quantity < 0) throw new Error('BQ rates must be non-negative numbers (up to HK$1 billion) and quantities must be whole numbers.');
    bqIds.add(b.id);
  }
  const ids = new Set();
  for (const item of p.items) {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)) throw new Error('Physical item IDs must be unique.');
    for (const key of ['room','floor','zone','stage','reason']) if (typeof item[key] !== 'string') throw new Error(`Invalid ${key} for ${item.id}.`);
    if (!bqIds.has(item.bqId) || !STATUS.includes(item.status)) throw new Error(`Invalid BQ mapping or status for ${item.id}.`);
    if (typeof item.claimed !== 'boolean' || typeof item.previous !== 'boolean' || !Array.isArray(item.evidence)) throw new Error(`Invalid baseline or evidence for ${item.id}.`);
    if (item.evidenceNeedsReview !== undefined && typeof item.evidenceNeedsReview !== 'boolean') throw new Error('Invalid evidence review flag.');
    for (const e of item.evidence) {
      if (!e || typeof e !== 'object' || typeof e.id !== 'string' || typeof e.name !== 'string' || typeof e.source !== 'string' || typeof e.note !== 'string') throw new Error(`Invalid evidence record for ${item.id}.`);
      if (e.capturedAt && !validDate(e.capturedAt)) throw new Error('Invalid evidence capture date.');
      if (e.sample !== undefined && typeof e.sample !== 'boolean') throw new Error('Invalid evidence sample flag.');
      if (e.data && (typeof e.data !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(e.data))) throw new Error('Only JPG, PNG and WebP evidence images are accepted.');
      if (e.sourceUrl && !validSourceURL(e.sourceUrl)) throw new Error('Evidence source links must use a valid https:// URL without credentials.');
      if (!e.sample && !e.data) throw new Error('Uploaded evidence must include its image data.');
    }
    ids.add(item.id);
  }
  for (const h of p.history) if (!h || typeof h.actor !== 'string' || typeof h.note !== 'string' || typeof h.type !== 'string' || !Number.isFinite(Date.parse(h.at)) || (h.delta !== undefined && !Number.isFinite(h.delta))) throw new Error('Invalid review history record.');
  const variationIds = new Set();
  for (const v of p.variations) {
    if (!v || typeof v.id !== 'string' || !v.id.trim() || variationIds.has(v.id) || !Number.isFinite(v.amount) || v.amount < 0 || v.amount > 1e9 || ['title','location','status','instruction','note'].some(k => typeof v[k] !== 'string')) throw new Error('Invalid variation record.');
    variationIds.add(v.id);
  }
  return p;
}

export function totals(p) {
  const lines = p.bq.map(b => {
    const items = p.items.filter(i => i.bqId === b.id);
    const claimed = items.filter(i => i.claimed).length, approved = items.filter(i => i.status === 'approved').length, previous = items.filter(i => i.previous).length;
    const toCents = q => Math.round(b.rate * 100) * q;
    return { ...b, claimed, approved, previous, registered: items.length, claimedValue: toCents(claimed) / 100, assessedValue: toCents(approved) / 100, previousValue: toCents(previous) / 100, currentValue: (toCents(approved) - toCents(previous)) / 100, difference: (toCents(claimed) - toCents(approved)) / 100 };
  });
  const sum = key => lines.reduce((n, l) => n + Math.round(l[key] * 100), 0) / 100;
  return { lines, claim: sum('claimedValue'), assessed: sum('assessedValue'), previous: sum('previousValue'), current: sum('currentValue'), difference: sum('difference'), approved: p.items.filter(i => i.status === 'approved').length, claimed: p.items.filter(i => i.claimed).length, unresolved: p.items.filter(i => i.claimed && i.status === 'pending').length, reviewCount: p.items.filter(i => (i.claimed && i.status === 'pending') || i.evidenceNeedsReview).length, rejected: p.items.filter(i => i.claimed && i.status === 'rejected').length, evidenceCoverage: p.items.filter(i => i.claimed && i.evidence.length).length };
}

export function gaps(item, p) {
  const result = [];
  if (item.evidenceNeedsReview) result.push('New evidence to review');
  if (!item.evidence.length) result.push('Photo needed');
  if (item.evidence.some(e => !e.capturedAt)) result.push('Capture date needed');
  if (item.evidence.some(e => e.capturedAt > p.valuationDate)) result.push('Photo after valuation date');
  if (item.stage === 'Not visible') result.push('Visibility check');
  if (item.stage === 'Frame only') result.push('Partial installation');
  if (/type.*check|specification/i.test(item.reason)) result.push('Specification check');
  return result;
}

export function assess(project, itemId, status, note, actor = project.reviewer) {
  if (!STATUS.includes(status)) throw new Error('Choose a valid assessment.');
  if (!note?.trim() || note.trim().length < 5) throw new Error('Add a short reason (at least 5 characters).');
  if (!actor?.trim()) throw new Error('Enter the reviewer name in settings.');
  const p = structuredClone(project), item = p.items.find(i => i.id === itemId);
  if (!item) throw new Error('This item is not in the register.');
  const before = item.status, oldTotal = totals(p).assessed;
  item.status = status; item.reason = note.trim(); item.reviewedBy = actor.trim(); item.reviewedAt = new Date().toISOString(); item.evidenceNeedsReview = false;
  p.history.unshift({ id: id(), at: item.reviewedAt, actor: actor.trim(), type: 'assessment', itemId, before, after: status, delta: totals(p).assessed - oldTotal, note: note.trim() });
  return p;
}

export function explanation(p) {
  const t = totals(p);
  return `The cumulative contractor claim for the selected door items is ${money(t.claim)}. The QS-approved cumulative gross assessment is ${money(t.assessed)}, against ${money(t.previous)} previously certified under ${p.previousCertificate}. The proposed gross movement this period is ${money(t.current)}. ${t.unresolved} claimed record${t.unresolved === 1 ? ' remains' : 's remain'} awaiting assessment and ${t.rejected} ${t.rejected === 1 ? 'is' : 'are'} not accepted. The difference between the cumulative claim and assessment is ${money(t.difference)}. See the item-level evidence and reviewer reasons. Retention, variations and other adjustments are excluded. This is a draft assessment, not a payment certificate.`;
}

export function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(field.trim()); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field.trim()); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field.');
  row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) throw new Error('CSV needs a header and at least one data row.');
  const headers = rows.shift().map(h => h.toLowerCase());
  if (new Set(headers).size !== headers.length) throw new Error('CSV contains duplicate headers.');
  return rows.map((r, n) => { if (r.length !== headers.length) throw new Error(`CSV row ${n + 2} has the wrong number of columns.`); return Object.fromEntries(headers.map((h, i) => [h, r[i]])); });
}

export function importRegister(text, current) {
  const rows = parseCSV(text), required = ['door_id', 'bq_id', 'description', 'unit', 'rate', 'room', 'floor', 'zone', 'claimed', 'previously_certified'];
  if (required.some(h => !(h in rows[0]))) throw new Error(`Required columns: ${required.join(', ')}`);
  const bq = new Map(), ids = new Set();
  const boolean = (v, field) => { if (!['true', 'false', '1', '0'].includes(v.toLowerCase())) throw new Error(`${field} must be true or false.`); return ['true', '1'].includes(v.toLowerCase()); };
  const items = rows.map((r, index) => {
    const n = index + 2, rate = Number(r.rate);
    if (!r.door_id || ids.has(r.door_id)) throw new Error(`Duplicate or missing door_id on row ${n}.`);
    if (!r.bq_id || r.unit !== 'nr' || !r.rate || !Number.isFinite(rate) || rate < 0) throw new Error(`Row ${n}: check BQ ID, unit (nr) and rate.`);
    if (!r.room || !r.floor || !r.zone) throw new Error(`Row ${n}: add room, floor and zone.`);
    ids.add(r.door_id);
    const existing = bq.get(r.bq_id);
    if (existing && (existing.rate !== rate || existing.description !== r.description)) throw new Error(`Inconsistent rate or description for ${r.bq_id}.`);
    bq.set(r.bq_id, { id: r.bq_id, description: r.description, unit: r.unit, rate, quantity: (existing?.quantity || 0) + 1 });
    const previous = boolean(r.previously_certified, 'previously_certified');
    return { id: r.door_id, bqId: r.bq_id, room: r.room, floor: r.floor, zone: r.zone, claimed: boolean(r.claimed, 'claimed'), previous, status: previous ? 'approved' : 'pending', stage: 'Not assessed', reason: previous ? 'Carried forward from imported certified baseline.' : 'Imported; current QS assessment needed.', evidence: [], reviewedBy: '', reviewedAt: '' };
  });
  const metadata = Object.fromEntries(['name','scope','period','valuationDate','valuationReference','previousCertificate','reviewer'].filter(k => current?.[k] !== undefined).map(k => [k,current[k]]));
  return validateProject({ ...createDemo(), ...metadata, name: current?.name || 'My project', reviewer: current?.reviewer || 'QS reviewer', isDemo: false, items, bq: [...bq.values()], variations: [], history: [{ id: id(), at: new Date().toISOString(), actor: current?.reviewer || 'QS reviewer', type: 'import', itemId: '', note: `Imported ${items.length} unique door records. Current approvals start from the supplied prior baseline.` }] });
}

export function toCSV(rows) {
  return rows.map(row => row.map(v => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`; return `"${s.replaceAll('"', '""')}"`; }).join(',')).join('\r\n');
}

export const registerCSV = p => toCSV([['door_id','bq_id','description','unit','rate','room','floor','zone','claimed','previously_certified'], ...p.items.map(i => { const b = p.bq.find(b => b.id === i.bqId); return [i.id,i.bqId,b.description,b.unit,b.rate,i.room,i.floor,i.zone,i.claimed,i.previous]; })]);
export const valuationCSV = p => toCSV([['bq_id','description','unit','rate','previous_quantity','claimed_quantity','approved_quantity','previous_gross','claimed_gross','assessed_gross','this_period_gross','difference'], ...totals(p).lines.map(l => [l.id,l.description,l.unit,l.rate,l.previous,l.claimed,l.approved,l.previousValue,l.claimedValue,l.assessedValue,l.currentValue,l.difference])]);
