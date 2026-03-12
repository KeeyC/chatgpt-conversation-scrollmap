// Injected at document_start to patch fetch/XHR BEFORE the page makes any API calls.
// This ensures conversation timestamps are captured when ChatGPT first loads.
try {
    if (!document.getElementById('chatgpt-scrollmap-bridge')) {
        const script = document.createElement('script');
        script.id = 'chatgpt-scrollmap-bridge';
        script.src = chrome.runtime.getURL('page-bridge-chatgpt.js');
        script.async = false;
        (document.head || document.documentElement).appendChild(script);
    }
} catch (e) {}
