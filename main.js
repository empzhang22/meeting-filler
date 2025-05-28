import { CONFIG } from './config.js';

const { CLIENT_ID, API_KEY } = CONFIG;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    console.log('gapi script loaded');
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC]
        });
        gapiInited = true;
        maybeStart();
    });
}

function gisLoaded() {
    console.log('Google Identity Services loaded');
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse) => {
            if (tokenResponse.error) {
                console.error("❌ Auth error:", tokenResponse);
                return;
            }
            console.log('Access token received');
            await listEvents();
        }
    });
    gisInited = true;
    maybeStart();
}

function maybeStart() {
    if (gapiInited && gisInited) {
        console.log("Starting auth flow...");
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }
}

async function listEvents() {
    try {
        const now = new Date().toISOString();
        const res = await gapi.client.calendar.events.list({
            calendarId: 'primary',
            timeMin: now,
            showDeleted: false,
            singleEvents: true,
            maxResults: 5,
            orderBy: 'startTime'
        });

        console.log("Upcoming events:");
        for (const event of res.result.items) {
            console.log(`- ${event.summary} (${event.start.dateTime || event.start.date})`);
        }
    } catch (err) {
        console.error("Failed to fetch events:", err);
    }
}

window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;
