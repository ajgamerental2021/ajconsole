(function () {
  'use strict';

  function endpoint(apiBase, path) {
    return `${String(apiBase || '').replace(/\/$/, '')}${path}`;
  }

  async function readJson(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(body.error || 'passkey_request_failed'));
    return body;
  }

  function supported() {
    return Boolean(window.PublicKeyCredential && window.SimpleWebAuthnBrowser?.browserSupportsWebAuthn?.());
  }

  // The sign-in challenge is asked for as soon as the login window opens, so a
  // tap on "Passkey" goes straight to Face ID / fingerprint instead of waiting
  // on the server (and Safari still counts the tap as the user's own). The
  // server keeps a challenge for 5 minutes; one older than 4 is asked again.
  const PREPARED_MAX_AGE_MS = 4 * 60 * 1000;
  let prepared = null;

  function fetchOptions(apiBase) {
    return fetch(endpoint(apiBase, '/api/admin/passkeys/authentication/options'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: window.location.origin }),
    }).then(readJson);
  }

  function prepare(apiBase) {
    if (!supported()) return;
    if (prepared && Date.now() - prepared.at < PREPARED_MAX_AGE_MS) return;
    const entry = { at: Date.now(), apiBase, promise: fetchOptions(apiBase) };
    entry.promise.catch(() => { if (prepared === entry) prepared = null; });
    prepared = entry;
  }

  async function login(apiBase) {
    if (!supported()) throw new Error('passkey_not_supported');
    const ready = prepared && prepared.apiBase === apiBase && Date.now() - prepared.at < PREPARED_MAX_AGE_MS ? prepared : null;
    // A challenge is good for one sign-in only.
    prepared = null;
    const begin = ready ? await ready.promise.catch(() => fetchOptions(apiBase)) : await fetchOptions(apiBase);
    const response = await window.SimpleWebAuthnBrowser.startAuthentication({ optionsJSON: begin.options });
    return fetch(endpoint(apiBase, '/api/admin/passkeys/authentication/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ceremonyId: begin.ceremonyId, response }),
    }).then(readJson);
  }

  async function register(apiBase, adminToken, label) {
    if (!supported()) throw new Error('passkey_not_supported');
    if (!adminToken) throw new Error('admin_login_required');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    const begin = await fetch(endpoint(apiBase, '/api/admin/passkeys/registration/options'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ origin: window.location.origin }),
    }).then(readJson);
    const response = await window.SimpleWebAuthnBrowser.startRegistration({ optionsJSON: begin.options });
    return fetch(endpoint(apiBase, '/api/admin/passkeys/registration/verify'), {
      method: 'POST',
      headers,
      body: JSON.stringify({ ceremonyId: begin.ceremonyId, response, label: String(label || '') }),
    }).then(readJson);
  }

  window.AJAdminPasskey = Object.freeze({ supported, prepare, login, register });
})();
