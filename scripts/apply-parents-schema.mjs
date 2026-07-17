// Apply parent-portal schema additions to Turso
import { readFileSync } from 'fs';

const URL = 'libsql://virat-public-school-ajitjaat1011-ui.aws-ap-south-1.turso.io';
const TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQxNzI0ODEsImlkIjoiMDE5ZjY4ZjctNWMwMS03NDVhLTllZDItZTIzNzAyZmIwYzRhIiwia2lkIjoienVDWHBCUlUtOU1paW1aOW45NlhYRUJyRzdUU0U3Y1JJWG4zbE5rQUxzWSIsInJpZCI6IjBhMjBkYmFmLTc5YTktNDliOC1hZDg2LWMzYzNiOGEyYzgxZCJ9.luNfzLTKvqXKQlLyOM4suZbdCihXhKlxwTwoVCvLELFQyjlUu5E_Q5PiLTAn6hEscx2_IC7Y1MuqT185DDD_BA';

const httpUrl = URL.replace(/^libsql:/, 'https:');

function toTursoValue(v) {
  if (v === null || v === undefined) return { type: 'null' };
  if (typeof v === 'number') return Number.isInteger(v) ? { type: 'integer', value: String(v) } : { type: 'float', value: v };
  if (typeof v === 'boolean') return { type: 'integer', value: v ? '1' : '0' };
  return { type: 'text', value: String(v) };
}

async function run(sql) {
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' }
      ]
    })
  });
  if (!res.ok) {
    console.error('HTTP', res.status, await res.text());
    return;
  }
  const data = await res.json();
  const r = data.results?.[0]?.response;
  if (r?.type === 'error') {
    console.error('SQL error:', r.error?.message);
  } else {
    console.log('OK:', sql.split('\n')[0].slice(0, 80));
  }
}

const sql = readFileSync('schema-parents.sql', 'utf-8');
// Split by semicolon at end of line, but keep comments
const statements = sql
  .split('\n')
  .filter(l => !l.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0);

console.log(`Applying ${statements.length} statements...`);
for (const stmt of statements) {
  await run(stmt);
}
console.log('Done.');
