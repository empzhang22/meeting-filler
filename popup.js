// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const btn  = document.getElementById('fetchBtn');
    const out  = document.getElementById('out');

    btn.addEventListener('click', () => {
        btn.disabled = true;
        out.textContent = 'Authorizing…';

        chrome.runtime.sendMessage({ type: 'FETCH_EVENTS' }, (resp) => {
            btn.disabled = false;

            if (resp?.error) {
                out.textContent = `Error: ${resp.error}`;
                return;
            }

            const events = resp.events;
            if (!events.length) {
                out.textContent = 'No upcoming events.';
                return;
            }

            out.textContent = events.map(ev => {
                const start = ev.start.dateTime || ev.start.date;
                return `• ${ev.summary || '(untitled)'} — ${start}`;
            }).join('\n');
        });
    });
});
