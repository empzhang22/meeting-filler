// background.js
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type !== 'FETCH_EVENTS') return;

    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (chrome.runtime.lastError || !token) {
            sendResponse({ error: chrome.runtime.lastError?.message || 'No token' });
            return;
        }

        try {
            const now = new Date().toISOString();
            const url =
                `https://www.googleapis.com/calendar/v3/calendars/primary/events` +
                `?timeMin=${encodeURIComponent(now)}` +
                `&singleEvents=true&orderBy=startTime`;

            const res  = await fetch(url, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            sendResponse({ events: data.items || [] });
        } catch (err) {
            sendResponse({ error: err.message || String(err) });
        }
    });

    return true; // keep the message channel open for async sendResponse
});
