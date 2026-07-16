// scripts/rewrite-pages.js
// Strips old hardcoded header/footer/topbar from all 22 inner pages
// and replaces with injection slots + new partials.js script.

const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const SKIP = new Set(['index.html', 'preview.html']);

const files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.html') && !SKIP.has(f));

// Regex: top bar div (greedy match from opening <div class="top-bar"> to its closing </div>)
function stripTopBar(html) {
  // The top bar is the first <div class="top-bar"> ... </div> block.
  const re = /<div class="top-bar">[\s\S]*?<\/div>\s*<\/div>/;
  return html.replace(re, '<div id="vps-topbar"></div>');
}

function stripHeader(html) {
  // Match the whole <header class="site-header" ...>...</header> including its trailing mobile menu nav
  const re = /<header class="site-header"[\s\S]*?<\/header>/;
  return html.replace(re, '<div id="vps-header"></div>');
}

function stripFooter(html) {
  const re = /<footer class="site-footer"[\s\S]*?<\/footer>/;
  return html.replace(re, '<div id="vps-footer"></div>');
}

function ensurePartialsLoaded(html) {
  if (html.includes('js/partials.js')) return html;
  // Add before the closing </body>, after any other scripts
  return html.replace('</body>', '<script src="js/partials.js?v=2"></script>\n</body>');
}

function ensureMainJsLoaded(html) {
  if (html.includes('js/main.js')) return html;
  return html.replace('</body>', '<script src="js/main.js?v=2"></script>\n</body>');
}

function softTypography(html) {
  // Swap heavy font family stacks for the new soft ones
  html = html.replace(/Playfair\+Display[^"]*/g, 'Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600');
  return html;
}

let changed = 0;
for (const f of files) {
  const fp = path.join(PUBLIC, f);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = stripTopBar(html);
  html = stripHeader(html);
  html = stripFooter(html);
  html = ensurePartialsLoaded(html);
  html = ensureMainJsLoaded(html);
  if (html !== before) {
    fs.writeFileSync(fp, html);
    changed++;
    console.log('rewrote', f);
  } else {
    console.log('skipped', f);
  }
}
console.log(`Done. ${changed}/${files.length} files updated.`);
