// ── Date helpers ──────────────────────────────────────────
export function parseRoDate(dateStr) {
  const parts = dateStr?.split('.');
  if (!parts || parts.length < 3) return null;
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

export function todayRo() {
  return new Date().toLocaleDateString('ro-RO');
}

export function todayFull() {
  return new Date().toLocaleDateString('ro-RO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function inDateRange(dateStr, from, to) {
  const d = parseRoDate(dateStr);
  if (!d) return false;
  return d >= from && d < to;
}

export function getWeekStart() {
  const now = new Date();
  const ws = new Date(now);
  ws.setDate(now.getDate() - now.getDay());
  ws.setHours(0, 0, 0, 0);
  return ws;
}

export function daysSince(dateStr) {
  const d = parseRoDate(dateStr);
  if (!d) return 0;
  return Math.floor((new Date() - d) / 86400000) || 0;
}

// ── Initials from full name ───────────────────────────────
export function getInitials(fullName = '') {
  return fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ── Export members to CSV ─────────────────────────────────
export function exportMembersCSV(members) {
  if (!members.length) { alert('Niciun membru de exportat!'); return; }
  const headers = ['ID', 'Nume', 'Grad', 'Status', 'Discord', 'Data Angajarii', 'Activitati', 'Note'];
  const rows = members.map(m => [
    m.id,
    `"${m.name}"`,
    m.rank,
    m.status,
    m.discord || '',
    m.date,
    m.activities,
    `"${m.notes || ''}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'membri_pr_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
}
