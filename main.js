import { CONFIG } from './config.js';

const { CLIENT_ID, API_KEY } = CONFIG;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Google Authentication Setup

/**
 * Loads the Google API client library and initializes it using the API key and discovery doc.
 * 
 * Called automatically once the `gapi` script finishes loading.
 * 
 * Side effects:
 * - Sets `gapiInited = true`
 * - Calls `maybeStart()` to continue auth flow if GIS is also ready
 */
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

/**
 * Initializes the Google Identity Services (GIS) token client using the configured OAuth client ID and scopes.
 * 
 * Called automatically once the `google.accounts` script finishes loading.
 * 
 * Side effects:
 * - Sets up `tokenClient` with callback that fetches calendar events
 * - Sets `gisInited = true`
 * - Calls `maybeStart()` to continue auth flow if gapi is also ready
 */
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

/**
 * Begins the authentication flow if both `gapiInited` and `gisInited` are true.
 * 
 * Behavior:
 * - If no token is present, requests access token with prompt ("consent")
 * - If a token is already cached, refreshes silently
 * 
 * Side effects:
 * - Triggers Google's OAuth popup if necessary
 */
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

/**
 * Fetches upcoming events from the user's primary Google Calendar.
 * 
 * Parameters:
 * @param {number} results - Maximum number of events to retrieve. If 0, retrieves all available events.
 *                           Must be >= 0, or throws `InvalidResultsError`.
 * @param {string|null} minTime - (Optional) RFC3339 timestamp string representing the start time filter.
 *                                If null, defaults to the current time (now).
 * 
 * Behavior:
 * - Queries the Calendar API using the provided constraints
 * - Logs all matching events to the console
 * 
 * Errors:
 * - If `results < 0`, throws a custom `InvalidResultsError`
 * - If API call fails, logs the error to console
 */
async function listEvents(results = 0, minTime = null) {
    // TODO: Build in functionality to let users specify which calendars they'd like to pull from before getting events
    try {
        if (minTime == null) {
            // TODO: Refactor for missing minTime to maybe use either current date or earliest date?
            minTime = new Date().toISOString();
        }

        let res = null;

        if (results > 0) {
            res = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: minTime,
                showDeleted: false,
                singleEvents: true,
                maxResults: results,
                orderBy: 'startTime'
            });
        } else if (results == 0) {
            res = await gapi.client.calendar.events.list({
                calendarId: 'primary',
                timeMin: minTime,
                showDeleted: false,
                singleEvents: true,
                orderBy: 'startTime'
            });
        } else {
            throw {name : "InvalidResultsError", message : "Invalid number of max results specified; must be >= 0"}; 
        }

        console.log("Upcoming events:");
        for (const event of res.result.items) {
            console.log(`- ${event.summary} (${event.start.dateTime || event.start.date})`);
        }
    } catch (err) {
        console.error("Failed to fetch events: ", err);
    }
}

// These attach the functions to the global `window` object so they can be called by the
// `onload` attributes in <script> tags that load Google's libraries.
window.gapiLoaded = gapiLoaded;
window.gisLoaded = gisLoaded;