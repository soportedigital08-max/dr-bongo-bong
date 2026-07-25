const fs = require('fs');
const path = require('path');

const SQL_PATH = path.join(__dirname, '..', 'wple_posts.sql');
const sql = fs.readFileSync(SQL_PATH, 'utf8');
console.log('sql size', sql.length);

const reBlock = /INSERT INTO `wple_posts`[\s\S]*?VALUES\s*([\s\S]*?);\s*COMMIT/s;
const m = sql.match(reBlock);
console.log('block match?', !!m, 'len', m ? m[1].length : 0);

if (!m) process.exit(1);

function splitRows(text) {
  const rows = [];
  let current = '';
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (const ch of text) {
    if (esc) { current += ch; esc = false; continue; }
    if (ch === '\\') { esc = true; current += ch; continue; }
    if (ch === "'") { inStr = !inStr; current += ch; continue; }
    if (!inStr && ch === '(') { depth++; current += ch; continue; }
    if (!inStr && ch === ')') {
      depth--;
      if (depth === 0) {
        rows.push(current.trim());
        current = '';
        continue;
      } else {
        current += ch;
        continue;
      }
    }
    current += ch;
  }
  return rows;
}

function parseRow(row) {
  let text = row.trim();
  if (text.startsWith('(')) text = text.slice(1);
  if (text.endsWith(')')) text = text.slice(0, -1);
  const parts = [];
  let cur = '';
  let inStr = false;
  let esc = false;
  for (const ch of text) {
    if (esc) { cur += ch; esc = false; continue; }
    if (ch === '\\') { esc = true; cur += ch; continue; }
    if (ch === "'") { inStr = !inStr; cur += ch; continue; }
    if (ch === ',' && !inStr) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur.trim());

  const unquote = (s) => {
    if (!s) return '';
    let v = s.trim();
    if (v.startsWith('(')) v = v.slice(1);
    if (v.endsWith(')')) v = v.slice(0, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    return v.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  };

  if (parts.length < 21) return null;
  return {
    type: unquote(parts[20]),
    status: unquote(parts[7]),
    name: unquote(parts[11]),
  };
}

const rows = splitRows(m[1]);
console.log('rows', rows.length);

const counts = {};
const posts = [];
for (const row of rows) {
  const p = parseRow(row);
  if (!p) continue;
  counts[p.type + '/' + p.status] = (counts[p.type + '/' + p.status] || 0) + 1;
  if (p.type === 'post') {
    posts.push(p);
    console.log('POST', p.status, p.name);
  }
}
console.log('counts', counts);
console.log('posts found', posts.length);
