// scripts/fix-admin.cjs
// Remove /css/style.css link from admin pages and rewrite some class names.

const fs = require('fs');
const path = require('path');

const ADMIN = path.resolve(__dirname, '..', 'public', 'admin');
const files = fs.readdirSync(ADMIN).filter(f => f.endsWith('.html'));

const classMap = {
  'stat-grid-admin': 'stat-grid',
  'stat-card-admin': 'stat-card',
  'page-subtitle': 'page-sub',
  'role-badge': 'role',
  'text-meta': 'text-mute',
};

for (const f of files) {
  const fp = path.join(ADMIN, f);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  // Remove old style.css link
  html = html.replace(/<link rel="stylesheet" href="\/css\/style\.css"[^>]*>\s*/g, '');

  // Class renames
  for (const [from, to] of Object.entries(classMap)) {
    html = html.split(from).join(to);
  }

  // Fix page-sub line (was page-subtitle → page-sub)
  // Fix btn-sm → btn block button size style if needed (we just drop btn-sm class)
  html = html.split('btn-sm ').join('');

  // Old style.css may have set body bg differently; admin-body now styles bg in admin.css. OK.

  if (html !== before) {
    fs.writeFileSync(fp, html);
    console.log('fixed', f);
  } else {
    console.log('skipped', f);
  }
}
console.log('Done.');
