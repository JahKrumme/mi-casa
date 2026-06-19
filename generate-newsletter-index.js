const fs   = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'newsletters');

function parseFrontMatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  m[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx < 0) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.length > 1 &&
        ((val[0] === '"' && val[val.length - 1] === '"') ||
         (val[0] === "'" && val[val.length - 1] === "'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  });
  return fm;
}

try {
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();

  const newsletters = files.map(filename => {
    const content = fs.readFileSync(path.join(dir, filename), 'utf8');
    const fm = parseFrontMatter(content);
    return {
      slug:           filename.replace(/\.md$/, ''),
      title:          fm.title          || '',
      date:           fm.date           || '',
      excerpt:        fm.excerpt        || '',
      featured_image: fm.featured_image || ''
    };
  });

  fs.writeFileSync(
    path.join(dir, 'index.json'),
    JSON.stringify(newsletters, null, 2) + '\n'
  );

  console.log(`Newsletter index generated: ${newsletters.length} newsletter(s).`);
} catch (err) {
  console.error('Failed to generate newsletter index:', err.message);
  process.exit(1);
}
