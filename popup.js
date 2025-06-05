document.addEventListener('DOMContentLoaded', () => {
    const fetchBtn = document.getElementById('fetchBtn');
    const fillBtn = document.getElementById('fillBtn');
    const out     = document.getElementById('out');

    fetchBtn.addEventListener('click', () => {
        fetchBtn.disabled = true;
        out.textContent  = 'Authorizing…';

        chrome.runtime.sendMessage({ type: 'GET_CALENDAR_EVENTS' }, (resp) => {
            fetchBtn.disabled = false;

            if (resp?.error) {
                out.textContent = `Error: ${resp.error}`;
                return;
            }

            if (!resp.events?.length) {
                out.textContent = 'No upcoming events.';
                return;
            }

            out.textContent = resp.events.map(ev => {
                const start = ev.start.dateTime || ev.start.date;
                return `• ${ev.summary || '(untitled)'} — ${start}`;
            }).join('\n');

            fillBtn.style.display = 'inline-block';
        });
    });

    fillBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs.length) return;
            chrome.tabs.sendMessage(tabs[0].id, { type: 'AUTOFILL_W2M' }, (resp) => {
                if (resp?.done) out.textContent += '\n\ncells clicked!';
            });
        });
    });
});
