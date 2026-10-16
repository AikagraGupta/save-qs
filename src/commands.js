// Prefer the project's IDs. Numeric shortcuts are only for existing D-xxx IDs.
export function resolveItemId(project, value) {
  const input = String(value || '').trim();
  const exact = project.items.find(i => i.id.toLowerCase() === input.toLowerCase());
  if (exact) return exact.id;
  const numeric = input.match(/^(?:door\s*|d[- ]*)?(\d+)$/i);
  return numeric ? project.items.find(i => i.id === `D-${numeric[1].padStart(3,'0')}`)?.id || null : null;
}

export function commandItemId(project, text) {
  // Match longest IDs first, bounded so FD-01 never resolves to FD-010.
  for (const item of [...project.items].sort((a,b) => b.id.length-a.id.length)) {
    const escaped = item.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    if (new RegExp(`(?:^|\\s)${escaped}(?=$|[\\s.,!?])`,'i').test(text)) return item.id;
  }
  const numeric = text.match(/\b(?:door\s*|d-)(\d+)\b/i);
  return numeric ? resolveItemId(project, numeric[1]) : null;
}
