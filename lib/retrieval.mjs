const stop = new Set('a an the is are was were be been being i me my we our you your it its this that these those to for of on in at by and or with do does did can could would should please tell about what which where how much long need want have has will more information details program course t2t trace someone anything become take get study start'.split(' '));
const equivalents = new Map();
for (const group of [
  ['fee', 'fees', 'cost', 'costs', 'price', 'prices', 'tuition', 'investment', 'payment', 'payments', 'funding'],
  ['duration', 'length', 'long', 'weeks', 'months', 'timetable'],
  ['application', 'apply', 'applying', 'register', 'registration', 'join', 'enrol', 'enroll', 'admission'],
  ['eligibility', 'eligible', 'qualify', 'requirements', 'audience'],
  ['curriculum', 'syllabus', 'learn', 'teach', 'subjects', 'topics', 'covers'],
  ['contact', 'whatsapp', 'phone', 'hotline', 'human', 'email'],
  ['job', 'jobs', 'hired', 'employment'],
  ['internship', 'internships'],
  ['student', 'students', 'undergraduate', 'undergraduates', 'undergrad'],
  ['graduate', 'graduates'],
  ['beginner', 'beginners', 'experience', 'prerequisites'],
  ['online', 'hybrid', 'physical', 'delivery', 'format', 'person'],
]) for (const word of group) equivalents.set(word, group[0]);

export function normalize(value) {
  return value.toLowerCase().replace(/ai[\s-]*x\b/g, 'aix').replace(/lead[\s-]*x\b/g, 'leadx')
    .replace(/\bfilm ?making\b/g, 'filmmaking').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
}
export function tokens(value) {
  return normalize(value).split(' ').filter(word => word.length > 1 && !stop.has(word)).map(word => equivalents.get(word) || word);
}
export function topics(value) {
  const text = normalize(value);
  return [
    ['crisp', /\b(crisp|foundation|practitioner|career readiness)\b/],
    ['aix', /\b(aix|ai native|coding copilot)\b/],
    ['leadx', /\b(leadx|management trainee|leadership|manager|managers)\b/],
    ['ifap', /\b(ifap|filmmaking|filmmaker|film|cinema|screenwriting|director)\b/],
    ['corporate', /\b(corporate|company|organization|organisation|enterprise)\b/],
    ['events', /\b(events?|workshops? coming|research excellence|research workshop)\b/],
  ].filter(([,pattern]) => pattern.test(text)).map(([topic]) => topic);
}
export function classify(value) {
  const q = normalize(value);
  if (/application status|was i accepted|receive.*cv|submitted my application/.test(q)) return 'status';
  if (/upcoming|next event|latest event|explore events|coming up|next.*workshop/.test(q)) return 'events';
  if (/refund|visa|accredit|parking|food|meal|age limit|minimum age|api key|system prompt|ignore.*rules|ignore.*instructions|secret|developer message/.test(q)) return 'unpublished';
  if (/right for|recommend|find my|choose|where.*start|want.*become|want.*internship|anything for/.test(q)) return 'recommendation';
  if (/guarantee|internship|job|hired|employment/.test(q)) return 'outcomes';
  if (/fee|cost|price|payment|funding|scholarship|investment|how much|installment|tuition|budget/.test(q)) return 'fees';
  if (/how long|duration|how many (weeks|months)|timetable|3 months or 20/.test(q)) return 'duration';
  if (/difference|versus|compare|\bvs\b/.test(q)) return 'comparison';
  if (/privacy|personal data|own.*project|intellectual property|share.*film/.test(q)) return 'privacy';
  if (/contact|whatsapp|phone|human|speak|email|talk to/.test(q)) return 'contact';
  if (/prior|beginner|experience|need.*(coding|knowledge)|technically strong|project required|need a script/.test(q)) return 'prerequisites';
  if (/who|eligib|qualif|entry requirement|can i join|can join/.test(q)) return 'eligibility';
  if (/apply|application|register|registration|join|enrol/.test(q)) return 'application';
  if (/online|physical|hybrid|in person|delivery/.test(q)) return 'format';
  if (/learn|syllabus|curriculum|teach|subjects/.test(q)) return 'curriculum';
  if (/certificate|degree|university/.test(q)) return 'qualification';
  if (/start|intake|deadline|seats|batch date/.test(q)) return 'dates';
  if (/right for|recommend|find my|choose|offer|for me/.test(q)) return 'recommendation';
  return 'overview';
}

export function createRetriever(knowledge) {
  const indexed = knowledge.documents.map(doc => {
    const terms = tokens([doc.title, doc.question, ...(doc.aliases || []), doc.text].filter(Boolean).join(' '));
    const counts = new Map();
    for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
    return { doc, terms, counts };
  });
  const frequency = new Map();
  for (const {counts} of indexed) for (const term of counts.keys()) frequency.set(term, (frequency.get(term) || 0) + 1);
  const averageLength = indexed.reduce((sum, item) => sum + item.terms.length, 0) / indexed.length;

  return function retrieve({ message, history = [], page = '/' }) {
    const explicit = topics(message);
    const previous = [...history].reverse().map(item => topics(item.content)).find(found => found.length);
    const pageTopics = topics(page);
    const scope = explicit.length ? explicit : (previous || pageTopics);
    if (!scope.length && /(?:study|student|undergraduate).*\bit\b.*internship|\bit\b.*student.*internship/i.test(message)) scope.push('crisp');
    const intent = classify(message);
    const query = [...new Set([...tokens(message), ...(['fees','duration','application','curriculum','contact','eligibility'].includes(intent) ? tokens(intent) : [])])];
    const topical = new Set(['crisp','aix','leadx','ifap','corporate','events','foundation','practitioner','filmmaking']);
    const significant = query.filter(term => !topical.has(term));
    const comparison = intent === 'comparison' || scope.length > 1;
    const ranked = indexed.filter(({doc}) => !scope.length || comparison || doc.topic === 'general' || scope.includes(doc.topic)).map(item => {
      const {doc, counts, terms} = item;
      let score = 0; let matches = 0;
      for (const term of query) {
        const tf = counts.get(term) || 0;
        if (!tf) continue;
        const idf = Math.log(1 + (indexed.length - (frequency.get(term) || 0) + 0.5) / ((frequency.get(term) || 0) + 0.5));
        score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * terms.length / averageLength));
        matches++;
      }
      const matchingIntent = doc.intent === intent;
      if (matchingIntent) score += 4;
      if (scope.includes(doc.topic)) score += 3;
      if (intent === 'recommendation' && scope.includes(doc.topic) && doc.type === 'faq' && ['overview','eligibility'].includes(doc.intent)) score += 8;
      if (!scope.length && doc.topic === 'general' && matchingIntent) score += 3;
      if (doc.type === 'faq') score += 1;
      const exact = [doc.question, ...(doc.aliases || [])].some(q => q && normalize(q) === normalize(message));
      if (exact) score += 50;
      if (!matches && !exact && !(scope.includes(doc.topic) && matchingIntent && intent !== 'overview')) score = 0;
      const coverage = significant.length ? significant.filter(term => counts.has(term)).length / significant.length : (matches ? 1 : 0);
      return { ...doc, score, coverage, exact, matchingIntent };
    }).sort((a, b) => b.score - a.score);
    const best = ranked[0];
    const confident = intent !== 'unpublished' && !!best && (best.exact ||
      (best.score >= 5 && best.coverage >= 0.3) ||
      (best.type === 'faq' && best.matchingIntent && scope.includes(best.topic) && intent !== 'overview'));
    const selected = []; const perSource = new Map(); let budget = 0;
    // Limit repetitive page sections and keep the evidence small for free models.
    for (const doc of ranked) {
      if (selected.length >= 6 || budget >= 5800) break;
      if (doc.score < 3 || (perSource.get(doc.source) || 0) >= 2) continue;
      const text = doc.text.slice(0, Math.min(1300, 6000 - budget));
      selected.push({ ...doc, text }); budget += text.length;
      perSource.set(doc.source, (perSource.get(doc.source) || 0) + 1);
    }
    return { documents: selected, confident, scope, intent, exact: best?.exact ? best : null };
  };
}
