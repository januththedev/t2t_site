(() => {
  'use strict';
  if (document.getElementById('t2t-chatbot')) return;
  const icon = (name) => {
    const paths = {
      spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="m20 2 .7 1.3L22 4l-1.3.7L20 6l-.7-1.3L18 4l1.3-.7Z"/>',
      close: '<path d="m6 6 12 12M6 18 18 6"/>',
      reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
      compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6Z"/>',
      wallet: '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-5 4h5m-16-8V4a1 1 0 0 1 1-1h12"/>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h2m4 0h2m-8 3h2"/>',
      chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6A8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8Z"/><path d="M8 11h8m-8 4h5"/>',
      arrow: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
      link: '<path d="M15 3h6v6m0-6L10 14m8-2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7"/>',
      page: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/>',
      stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
  };
  const host = document.createElement('div');
  host.id = 't2t-chatbot';
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  // Only this static, authored template uses HTML. User and model text use textContent.
  shadow.innerHTML = `
    <link rel="stylesheet" href="/chatbot/widget.css">
    <button class="launcher" aria-label="Open T2T Guide" aria-expanded="false" aria-controls="t2t-panel">${icon('spark')}<span>Ask T2T</span><span class="dot" aria-hidden="true"></span></button>
    <section class="panel" id="t2t-panel" role="dialog" aria-label="T2T Guide chat" aria-modal="false" hidden>
      <div class="topbar"><div class="brand-icon">${icon('spark')}</div><div class="brand-copy"><strong>T2T Guide</strong><span><i aria-hidden="true"></i>A little direction. A bigger future.</span></div><button class="icon-button reset" aria-label="Start a new chat" title="Start a new chat">${icon('reset')}</button><button class="icon-button close" aria-label="Close chat">${icon('close')}</button></div>
      <div class="conversation">
        <div class="welcome"><div class="eyebrow"><span></span>YOUR NEXT CHAPTER</div><h2>Big goals.<br>Let’s find your <em>next step.</em></h2><p>Find your path, get the details, and turn<br>“what’s next?” into a plan.</p>
          <div class="cards"><button class="card" data-question="Which program is right for me?">${icon('compass')}<b>Find my program</b><span>A path that fits you</span></button><button class="card" data-question="What are the program fees?">${icon('wallet')}<b>Fees & funding</b><span>Know your investment</span></button><button class="card" data-question="What events are coming up?">${icon('calendar')}<b>Explore events</b><span>Learn beyond the classroom</span></button><button class="card" data-question="How can I contact the team?">${icon('chat')}<b>Talk to the team</b><span>A human, when you need one</span></button></div>
          <div class="page-context">${icon('page')}<span>Answers grounded in the T2T website</span></div>
        </div>
        <div class="messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions"></div>
        <div class="typing" role="status" hidden><span></span><span></span><span></span><small>Finding the right details…</small></div>
        <div class="followups" aria-label="Suggested questions"></div>
      </div>
      <div class="composer-wrap"><form class="composer"><label class="sr-only" for="t2t-message">Your question</label><textarea id="t2t-message" rows="1" maxlength="1000" placeholder="What’s on your mind?"></textarea><button class="send" type="submit" aria-label="Send message" disabled>${icon('arrow')}</button></form><div class="composer-meta"><span>Check source pages for the latest details.</span><button class="about" type="button">About this guide</button><span class="counter" hidden></span></div></div>
      <div class="notice" role="region" aria-label="About this guide" hidden><strong>A guide, grounded in the website.</strong>Answers use published T2T information. Some replies use AI through OpenRouter and its model providers; AI can make mistakes. Recent messages stay in this tab’s session storage. Clear the chat to remove them. Please don’t share sensitive information.<br><a href="/privacy_policy/">Privacy policy ↗</a><br><button class="dismiss-notice">Got it</button></div>
    </section>`;
  const find = selector => shadow.querySelector(selector);
  const launcher = find('.launcher'); const panel = find('.panel');
  const welcome = find('.welcome'); const messages = find('.messages'); const followups = find('.followups');
  const input = find('textarea'); const send = find('.send'); const typing = find('.typing'); const scrollArea = find('.conversation');
  const storageKey = 't2t-guide-v1';
  let records = []; let controller; let busy = false; let generation = 0;
  const safeSource = url => typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && !/[\\\s]/.test(url);
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(records.slice(-20))); } catch { /* Storage can be disabled. */ }
  }
  function scrollToEnd() { scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
  function setSuggestions(items) {
    followups.replaceChildren();
    for (const text of items.slice(0,3)) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = text;
      button.addEventListener('click', () => ask(text)); followups.append(button);
    }
  }
  function addMessage(record) {
    welcome.hidden = true;
    const row = document.createElement('div'); row.className = 'message ' + record.role;
    if (record.role === 'assistant') {
      const label = document.createElement('div'); label.className = 'message-label'; label.innerHTML = icon('spark');
      label.append(document.createTextNode(record.error ? 'T2T Guide · connection issue' : 'T2T Guide')); row.append(label);
    }
    const bubble = document.createElement('p'); bubble.className = 'bubble'; bubble.textContent = record.content; row.append(bubble);
    if (record.role === 'assistant' && Array.isArray(record.sources) && record.sources.length) {
      const sources = document.createElement('div'); sources.className = 'sources'; sources.setAttribute('aria-label','Source pages');
      for (const source of record.sources.slice(0,5)) {
        if (!safeSource(source.url)) continue;
        const a = document.createElement('a'); a.href = source.url; a.innerHTML = icon('link');
        const label = document.createElement('span'); label.textContent = source.title; a.append(label); sources.append(a);
      }
      row.append(sources);
      const note = document.createElement('p'); note.className = 'answer-note';
      note.textContent = record.notice || (record.mode === 'ai' ? 'AI response · based on these website sources' : 'From the published T2T website'); row.append(note);
    }
    if (record.error) {
      const retry = document.createElement('button'); retry.className = 'retry'; retry.textContent = 'Try again'; retry.type = 'button';
      retry.addEventListener('click', () => {
        const previous = [...records].reverse().find(item => item.role === 'user');
        if (previous && !busy) { records = records.filter(item => item !== record); row.remove(); ask(previous.content,true); }
      }); row.append(retry);
    }
    messages.append(row);
  }
  function setBusy(value) {
    busy = value; typing.hidden = !value; input.disabled = value;
    send.disabled = !value && !input.value.trim(); send.setAttribute('aria-label',value ? 'Stop response' : 'Send message');
    send.innerHTML = icon(value ? 'stop' : 'arrow');
    shadow.querySelectorAll('.card,.followups button').forEach(button => { button.disabled = value; });
  }
  function resizeInput() {
    input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight,90) + 'px';
    const counter = find('.counter'); counter.hidden = input.value.length < 850; counter.textContent = `${input.value.length}/1000`;
    if (!busy) send.disabled = !input.value.trim();
  }
  async function ask(question, retry = false) {
    if (busy || !question.trim()) return;
    question = question.trim().slice(0,1000);
    const history = records.filter(record => !record.error);
    if (retry && history.at(-1)?.role === 'user') history.pop();
    if (!retry) { const user = {role:'user',content:question}; records.push(user); addMessage(user); }
    followups.replaceChildren(); input.value = ''; resizeInput(); save(); setBusy(true); scrollToEnd();
    controller = new AbortController(); const current = ++generation;
    const timeout = setTimeout(() => controller.abort('timeout'), 30000);
    try {
      const response = await fetch('/api/chat/', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:controller.signal,
        body:JSON.stringify({message:question,history:history.slice(-6).map(({role,content}) => ({role,content:content.slice(0,1000)})),page:location.pathname}),
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== 'string') throw new Error(data.error || 'The guide couldn’t reply just now. Please try again.');
      if (current !== generation) return;
      const record = {role:'assistant',content:data.answer,sources:data.sources,mode:data.mode,notice:data.notice};
      records.push(record); addMessage(record); setSuggestions(data.suggestions || []);
    } catch (error) {
      if (current !== generation) return;
      const record = {role:'assistant',content:controller.signal.aborted ? 'The reply was stopped. You can try again whenever you’re ready.' : error.message,error:true};
      records.push(record); addMessage(record);
    } finally {
      clearTimeout(timeout);
      if (current === generation) { setBusy(false); save(); scrollToEnd(); if (!panel.hidden && !window.matchMedia('(max-width: 480px)').matches) input.focus(); }
    }
  }
  function open() {
    panel.hidden = false; launcher.setAttribute('aria-expanded','true'); launcher.setAttribute('aria-label','Close T2T Guide');
    fitViewport(); scrollToEnd();
    if (!window.matchMedia('(max-width: 480px)').matches) input.focus(); else find('.close').focus();
  }
  function close() { panel.hidden = true; find('.notice').hidden = true; launcher.setAttribute('aria-expanded','false'); launcher.setAttribute('aria-label','Open T2T Guide'); launcher.focus(); }
  launcher.addEventListener('click', () => panel.hidden ? open() : close());
  find('.close').addEventListener('click',close);
  shadow.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  find('.reset').addEventListener('click', () => {
    generation++; controller?.abort(); records = []; messages.replaceChildren(); followups.replaceChildren();
    welcome.hidden = false; setBusy(false); save(); input.value = ''; resizeInput();
  });
  shadow.querySelectorAll('.card').forEach(button => button.addEventListener('click',() => ask(button.dataset.question)));
  find('form').addEventListener('submit',event => { event.preventDefault(); if (busy) controller?.abort(); else ask(input.value); });
  input.addEventListener('input',resizeInput);
  input.addEventListener('keydown',event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!busy) ask(input.value); } });
  find('.about').addEventListener('click',() => { find('.notice').hidden = !find('.notice').hidden; if (!find('.notice').hidden) find('.dismiss-notice').focus(); });
  find('.dismiss-notice').addEventListener('click',() => { find('.notice').hidden = true; find('.about').focus(); });
  function fitViewport() {
    const viewport = window.visualViewport;
    host.style.setProperty('--available-height',`${viewport?.height || window.innerHeight}px`);
    host.style.setProperty('--keyboard-offset',`${Math.max(0,window.innerHeight - (viewport?.height || window.innerHeight) - (viewport?.offsetTop || 0))}px`);
  }
  window.visualViewport?.addEventListener('resize',fitViewport); window.addEventListener('resize',fitViewport);
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) records = saved.filter(item => item && ['user','assistant'].includes(item.role) && typeof item.content === 'string' && item.content.length <= 5000).slice(-20);
  } catch { records = []; }
  records.forEach(addMessage);
  if (records.length) setSuggestions(['Help me choose a program','How can I contact the team?']);
  const pageName = location.pathname.match(/\/programs\/(crisp|aix|leadx|ifap)\//)?.[1];
  if (pageName) find('.page-context span').textContent = `You’re exploring ${{crisp:'CRISP',aix:'AI-X',leadx:'Lead-x',ifap:'IFAP'}[pageName]}. Ask me anything about it.`;
})();
