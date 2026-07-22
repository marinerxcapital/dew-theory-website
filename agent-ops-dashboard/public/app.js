(() => {
  const seen = new Set();
  const feedEl = document.getElementById('feed');
  const agentsEl = document.getElementById('agents');
  const conn = document.getElementById('conn');
  const connLabel = document.getElementById('conn-label');
  const missionEl = document.getElementById('mission');
  const clockEl = document.getElementById('clock');
  const startedEl = document.getElementById('started');

  let state = { agents: {}, stats: {} };

  function fmtTime(iso) {
    try {
      return new Date(iso).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return '—';
    }
  }

  function setConn(mode) {
    conn.classList.remove('live', 'down');
    if (mode === 'live') {
      conn.classList.add('live');
      connLabel.textContent = 'live';
    } else if (mode === 'down') {
      conn.classList.add('down');
      connLabel.textContent = 'offline';
    } else {
      connLabel.textContent = 'connecting';
    }
  }

  function renderStats() {
    const agents = Object.keys(state.agents || {}).length;
    const stats = state.stats || {};
    document.getElementById('stat-agents').textContent = String(agents);
    document.getElementById('stat-sub').textContent = String(stats.subagents || 0);
    document.getElementById('stat-tools').textContent = String(stats.tools || 0);
    document.getElementById('stat-files').textContent = String(stats.files || 0);
    document.getElementById('stat-events').textContent = String(stats.events || 0);

    const active = Object.values(state.agents || {}).filter((a) =>
      ['active', 'running', 'working'].includes((a.status || '').toLowerCase())
    ).length;
    document.getElementById('agent-count').textContent = `${active} active · ${agents} total`;
  }

  function renderAgents() {
    const list = Object.values(state.agents || {}).sort((a, b) =>
      String(b.lastTs || '').localeCompare(String(a.lastTs || ''))
    );
    if (!list.length) {
      agentsEl.innerHTML = '<p class="empty">No agents reported yet.</p>';
      return;
    }
    agentsEl.innerHTML = list
      .map((a) => {
        const st = (a.status || 'idle').toLowerCase();
        return `
        <article class="agent" data-id="${escapeAttr(a.id)}">
          <div class="agent-top">
            <span class="agent-name">${escapeHtml(a.id)}</span>
            <span class="badge ${escapeAttr(st)}">${escapeHtml(st)}</span>
          </div>
          <p class="agent-title">${escapeHtml(a.lastTitle || 'Standing by')}</p>
          <p class="agent-meta">${escapeHtml(a.role || 'agent')} · ${a.eventCount || 0} events · ${fmtTime(a.lastTs)}</p>
        </article>`;
      })
      .join('');
  }

  function flashAgent(id) {
    const el = agentsEl.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }

  function prependEvent(evt) {
    if (!evt || !evt.id || seen.has(evt.id)) return;
    seen.add(evt.id);

    const empty = feedEl.querySelector('.empty');
    if (empty) empty.remove();

    const li = document.createElement('li');
    const type = evt.type || 'info';
    li.innerHTML = `
      <time datetime="${escapeAttr(evt.ts || '')}">${fmtTime(evt.ts)}</time>
      <div>
        <div class="who">${escapeHtml(evt.agent || 'agent')}<span class="type-chip ${escapeAttr(type)}">${escapeHtml(type)}</span></div>
        <p class="title">${escapeHtml(evt.title || '')}</p>
        ${evt.detail ? `<p class="detail">${escapeHtml(evt.detail)}</p>` : ''}
      </div>`;
    feedEl.prepend(li);

    while (feedEl.children.length > 250) {
      feedEl.removeChild(feedEl.lastChild);
    }

    if (evt.agent) flashAgent(evt.agent);
  }

  function applyState(s) {
    state = s || state;
    if (s?.mission) missionEl.textContent = s.mission;
    if (s?.startedAt) {
      startedEl.textContent = `Session started ${fmtTime(s.startedAt)}`;
    }
    renderStats();
    renderAgents();
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function tickClock() {
    clockEl.textContent = new Date().toLocaleString();
  }
  tickClock();
  setInterval(tickClock, 1000);

  feedEl.innerHTML = '<p class="empty">Listening for the first event…</p>';

  let es;
  function connect() {
    setConn('connecting');
    if (es) es.close();
    es = new EventSource('/api/stream');
    es.addEventListener('hello', () => setConn('live'));
    es.addEventListener('state', (e) => {
      try {
        applyState(JSON.parse(e.data));
      } catch {
        /* ignore */
      }
    });
    es.addEventListener('agent', (e) => {
      try {
        const evt = JSON.parse(e.data);
        prependEvent(evt);
      } catch {
        /* ignore */
      }
    });
    es.onopen = () => setConn('live');
    es.onerror = () => {
      setConn('down');
      es.close();
      setTimeout(connect, 2000);
    };
  }

  connect();
})();
