/* Shared settings for the wall display (index.html) and the phone view (phone.html). */
window.FLAT_SETTINGS = {
  // Flat to-do list. Add or remove lines here.
  todos: [
    'Set up water in new flat',
    'Buy communal items',
    'Follow up with prop. mgmt.'
  ],
  // Weather location (central London by default).
  latitude: 51.5074,
  longitude: -0.1278,
  // Optional free TfL key from api-portal.tfl.gov.uk ('' works too).
  tflKey: '',
  // Address of the FT headlines relay (Cloudflare Worker). '' = not connected.
  newsUrl: 'https://ft-headlines.kamranprashar.workers.dev/',
  newsCount: 6,
  newsRefreshMinutes: 15,
  tubeRefreshMinutes: 2,
  weatherRefreshMinutes: 30
};
