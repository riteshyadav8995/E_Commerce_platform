// Public base URLs. These end up in customer-facing links (emails, WhatsApp)
// and in image URLs, so they must be configurable per environment rather
// than hard-coded to localhost.
const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

const frontendUrl = () =>
  stripTrailingSlash(process.env.FRONTEND_URL || 'http://localhost:5173');

const backendUrl = () =>
  stripTrailingSlash(
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
  );

module.exports = { frontendUrl, backendUrl };
