(() => {
  const SOURCE = 'chatgpt-scrollmap-bridge';

  if (window.__chatgptScrollmapBridgeInstalled) return;
  window.__chatgptScrollmapBridgeInstalled = true;

  function emit(type, payload) {
    try {
      window.postMessage({ source: SOURCE, type, ...payload }, '*');
    } catch {}
  }

  function normalizeTime(value) {
    try {
      if (value == null) return '';
      if (typeof value === 'number' && Number.isFinite(value)) {
        const ms = value > 1e12 ? value : value * 1000;
        const iso = new Date(ms).toISOString();
        return Number.isNaN(new Date(iso).getTime()) ? '' : iso;
      }
      const text = String(value).trim();
      if (!text) return '';
      if (/^\d+(\.\d+)?$/.test(text)) {
        return normalizeTime(Number(text));
      }
      const iso = new Date(text).toISOString();
      return Number.isNaN(new Date(iso).getTime()) ? '' : iso;
    } catch {
      return '';
    }
  }

  function collectConversationTurnTimes(payload) {
    try {
      const mapping = payload?.mapping;
      if (!mapping || typeof mapping !== 'object') return;
      const turnTimes = {};
      for (const [nodeId, node] of Object.entries(mapping)) {
        const message = node?.message;
        if (!message || message?.author?.role !== 'user') continue;
        const turnId = String(message.id || nodeId || '').trim();
        if (!turnId) continue;
        const normalized = normalizeTime(message.create_time);
        if (normalized) turnTimes[turnId] = normalized;
      }
      if (Object.keys(turnTimes).length === 0) return;
      emit('conversation-times', {
        conversationId: payload?.conversation_id || payload?.id || null,
        turnTimes
      });
    } catch {}
  }

  function collectPendingTurnTimes(bodyText) {
    try {
      if (!bodyText || typeof bodyText !== 'string') return;
      const payload = JSON.parse(bodyText);
      const messages = Array.isArray(payload?.messages) ? payload.messages : [];
      const turnTimes = {};
      const fallbackIso = new Date().toISOString();
      for (const message of messages) {
        if (message?.author?.role !== 'user') continue;
        const turnId = String(message?.id || '').trim();
        if (!turnId) continue;
        turnTimes[turnId] = normalizeTime(message?.create_time) || fallbackIso;
      }
      if (Object.keys(turnTimes).length === 0) return;
      emit('pending-user-times', {
        conversationId: payload?.conversation_id || null,
        turnTimes
      });
    } catch {}
  }

  function isConversationApi(url) {
    try {
      return /\/backend-api\/conversation(\/|$)/.test(String(url || ''));
    } catch {
      return false;
    }
  }

  function readRequestBody(input, init) {
    try {
      if (init && typeof init.body === 'string') return Promise.resolve(init.body);
      if (typeof Request !== 'undefined' && input instanceof Request) {
        return input.clone().text().catch(() => '');
      }
    } catch {}
    return Promise.resolve('');
  }

  const originalFetch = window.fetch;
  if (typeof originalFetch === 'function') {
    window.fetch = function patchedFetch(input, init) {
      const url = typeof input === 'string' ? input : input?.url;
      const method = String(init?.method || input?.method || 'GET').toUpperCase();

      if (isConversationApi(url) && method === 'POST') {
        readRequestBody(input, init).then(collectPendingTurnTimes).catch(() => {});
      }

      return originalFetch.apply(this, arguments).then((response) => {
        try {
          if (!isConversationApi(url)) return response;
          const contentType = response.headers?.get?.('content-type') || '';
          if (/application\/json/i.test(contentType)) {
            // Pure JSON response (e.g. GET conversation history)
            response.clone().json().then(collectConversationTurnTimes).catch(() => {});
          } else if (/text\/event-stream|text\/plain/i.test(contentType) || method === 'POST') {
            // SSE or streamed response: read full body text and try to extract
            // the final JSON object which often contains the full conversation payload
            response.clone().text().then((text) => {
              try {
                // SSE streams have lines like "data: {...}\n\n"; find the last parseable JSON
                const lines = text.split('\n');
                for (let k = lines.length - 1; k >= 0; k--) {
                  let line = lines[k].trim();
                  if (line.startsWith('data: ')) line = line.slice(6);
                  if (!line || line === '[DONE]') continue;
                  try {
                    const obj = JSON.parse(line);
                    if (obj && obj.mapping) {
                      collectConversationTurnTimes(obj);
                      break;
                    }
                  } catch {}
                }
              } catch {}
            }).catch(() => {});
          }
        } catch {}
        return response;
      });
    };
  }

  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function patchedOpen(method, url) {
    try {
      this.__chatgptScrollmapMethod = String(method || 'GET').toUpperCase();
      this.__chatgptScrollmapUrl = String(url || '');
    } catch {}
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function patchedSend(body) {
    try {
      const url = this.__chatgptScrollmapUrl || '';
      const method = this.__chatgptScrollmapMethod || 'GET';
      if (isConversationApi(url) && method === 'POST' && typeof body === 'string') {
        collectPendingTurnTimes(body);
      }
      this.addEventListener('load', () => {
        try {
          if (!isConversationApi(url)) return;
          const contentType = this.getResponseHeader('content-type') || '';
          const text = this.responseText || '';
          if (/application\/json/i.test(contentType)) {
            const payload = JSON.parse(text || 'null');
            collectConversationTurnTimes(payload);
          } else {
            // SSE or plain text: scan for last JSON object with mapping
            const lines = text.split('\n');
            for (let k = lines.length - 1; k >= 0; k--) {
              let line = lines[k].trim();
              if (line.startsWith('data: ')) line = line.slice(6);
              if (!line || line === '[DONE]') continue;
              try {
                const obj = JSON.parse(line);
                if (obj && obj.mapping) {
                  collectConversationTurnTimes(obj);
                  break;
                }
              } catch {}
            }
          }
        } catch {}
      }, { once: true });
    } catch {}
    return originalSend.apply(this, arguments);
  };
})();
