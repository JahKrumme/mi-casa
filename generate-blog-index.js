// Reads all .md files in posts/ and regenerates posts/index.json.
// Runs automatically on every Netlify deploy via netlify.toml.
const fs   = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, 'posts');

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
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // newest filenames first (YYYY-MM-DD prefix sorts correctly)

  const posts = files.map(filename => {
    const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const fm = parseFrontMatter(content);
    return {
      slug:           filename.replace(/\.md$/, ''),
      title:          fm.title          || '',
      date:           fm.date           || '',
      category:       fm.category       || '',
      excerpt:        fm.excerpt        || '',
      featured_image: fm.featured_image || ''
    };
  });

  fs.writeFileSync(
    path.join(postsDir, 'index.json'),
    JSON.stringify(posts, null, 2) + '\n'
  );

  console.log(`Blog index generated: ${posts.length} post(s).`);
} catch (err) {
  console.error('Failed to generate blog index:', err.message);
  process.exit(1);
}
