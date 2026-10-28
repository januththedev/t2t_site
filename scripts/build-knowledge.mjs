import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = [
  ['index.html', 'general', 'T2T programs and overview'],
  ['programs/crisp/index.html', 'crisp', 'CRISP'],
  ['programs/aix/index.html', 'aix', 'AI-X'],
  ['programs/leadx/index.html', 'leadx', 'Lead-x'],
  ['programs/ifap/index.html', 'ifap', 'IFAP'],
  ['corporate-programs/index.html', 'corporate', 'Corporate programs'],
  ['events/research-excellence/index.html', 'events', 'Research Excellence Workshop'],
  ['privacy_policy/index.html', 'general', 'Privacy Policy'],
];
const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ndash: '–', mdash: '—', bull: '•' };
export function plainText(html) {
  return html.replace(/<(script|style|svg|nav|header|footer|form)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/(?:p|li|h[1-6]|div)>|<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, value) => {
      if (value.startsWith('#')) {
        const n = value[1].toLowerCase() === 'x' ? parseInt(value.slice(2), 16) : Number(value.slice(1));
        return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
      }
      return entities[value] ?? all;
    }).split('\n').map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

export function buildKnowledge(contentRoot = root) {
  const faqs = JSON.parse(readFileSync(join(root, 'knowledge/faqs.json'), 'utf8'));
  const ids = new Set();
  const documents = faqs.map(faq => {
    if (!faq.id || ids.has(faq.id)) throw new Error(`Duplicate/missing FAQ id: ${faq.id}`);
    ids.add(faq.id);
    let published = '';
    for (const source of [faq.source, ...(faq.relatedSources || [])]) {
      const path = source.split('#')[0];
      if (!source.startsWith('/') || !existsSync(join(contentRoot, path, 'index.html'))) throw new Error(`Invalid FAQ source: ${source}`);
      published += plainText(readFileSync(join(contentRoot, path, 'index.html'),'utf8')).replace(/[\s,]/g,'');
    }
    for (const match of faq.answer.matchAll(/(?:LKR|Rs\.?)[\s:]*([\d,]+)/g)) {
      if (!published.includes(match[1].replaceAll(',',''))) throw new Error(`Review stale fee in ${faq.id}: amount no longer appears in its source pages.`);
    }
    return { ...faq, type: 'faq', title: faq.question, text: faq.answer };
  });
  const inputs = [readFileSync(join(root, 'knowledge/faqs.json'), 'utf8')];
  for (const [path, topic, label] of pages) {
    const html = readFileSync(join(contentRoot, path), 'utf8');
    inputs.push(html);
    const source = path === 'index.html' ? '/' : '/' + path.replace(/index\.html$/, '');
    let sectionNumber = 0;
    for (const match of html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)) {
      const id = match[1].match(/\bid="([^"]+)"/)?.[1];
      const heading = match[2].match(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i)?.[1];
      const title = `${label} · ${plainText(heading || label)}`;
      const text = plainText(match[2]);
      if (text.length < 80) continue;
      const lines = text.split('\n');
      const chunks = []; let chunk = '';
      for (const line of lines) {
        if (chunk.length + line.length > 1100 && chunk) { chunks.push(chunk); chunk = ''; }
        chunk += (chunk ? '\n' : '') + line;
      }
      if (chunk) chunks.push(chunk);
      for (const [index, content] of chunks.entries()) documents.push({
        id: `page-${path.replaceAll('/', '-')}-${sectionNumber}-${index}`, type: 'page', topic, title,
        source: source + (id ? '#' + id : ''), text: content.slice(0, 1600),
      });
      sectionNumber++;
    }
  }
  const events = JSON.parse(readFileSync(join(root, 'data/events.json'), 'utf8'));
  inputs.push(JSON.stringify(events));
  for (const [index, event] of events.entries()) {
    // A missing year must never be guessed from the current year.
    const eventDate = /research-excellence/.test(event.image) ? '2026-03-07' :
      (/\b20\d{2}\b/.test(event.date) && !Number.isNaN(Date.parse(event.date)) ? new Date(event.date).toISOString().slice(0, 10) : null);
    documents.push({ id: `event-${index}`, type: 'event', topic: 'events', title: event.title,
      source: /research-excellence/.test(event.image) ? '/events/research-excellence/' : '/#events',
      eventDate, text: `${event.title}\nPublished date: ${event.date}${eventDate ? ` (${eventDate})` : ' (year not specified; do not assume upcoming)'}\n${event.meta}\n${event.description}`,
    });
  }
  if (new Set(documents.map(doc => doc.id)).size !== documents.length) throw new Error('Duplicate knowledge record IDs');
  const data = { version: 1, contentHash: createHash('sha256').update(inputs.join('\n')).digest('hex'), faqCount: faqs.length, pageCount: pages.length, documents };
  writeFileSync(join(root, 'knowledge/generated.json'), JSON.stringify(data));
  console.log(`Knowledge: ${faqs.length} curated FAQs, ${documents.length} total passages from ${pages.length} pages and ${events.length} events.`);
  return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) buildKnowledge();
