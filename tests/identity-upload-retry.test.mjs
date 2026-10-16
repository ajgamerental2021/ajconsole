import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// A slow Bot used to make every "Send again" start a fresh identity upload,
// so the renter never reached payment. The page now names each pair of photos
// and asks how an upload it lost track of ended.

const source = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.search(new RegExp(`\\n  (?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} exists`);
  const from = start + 1;
  return source.slice(from, source.indexOf('\n  }\n', from) + 4);
}

function page(server) {
  const requests = [];
  const busy = [];
  const idDocument = { name: 'id.jpg' };
  const selfieWithId = { name: 'selfie.jpg' };
  const context = vm.createContext({
    state: { lang: 'en', calc: { rentalCode: 'AJ-20261016-R0029' } },
    demoProfile: { idDocument, selfieWithId, identityUploaded: false },
    CONFIG: { apiBase: 'https://bot.example' },
    URL, JSON, Error, Promise, Date, Uint8Array, String, btoa, crypto,
    console: { warn() {} },
    setTimeout: (resolve) => resolve(),
    saveLocal() {}, saveDemoProfile() {},
    showDemoBusy: (message) => busy.push(message),
    demoImageDataUrl: async (file) => `data:image/jpeg;base64,${file.name}`,
    bookingFetch: async (url, options = {}) => {
      const request = { url: String(url), method: options.method || 'GET', body: options.body ? JSON.parse(options.body) : null };
      requests.push(request);
      return server(request, requests);
    },
  });
  vm.runInContext(['let demoIdentityUpload = null;', fn('demoIdentityUploadId'), fn('demoIdentityUploadState'), fn('markDemoIdentityUploaded'), fn('uploadDemoIdentity'),
    'globalThis.api = { uploadDemoIdentity, demoIdentityUploadId };'].join('\n'), context);
  return { api: context.api, requests, busy, context };
}

const json = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('a lost answer waits for the upload already running instead of sending the photos again', async () => {
  let checks = 0;
  const { api, requests, busy, context } = page((request) => {
    if (request.method === 'POST') throw new DOMException('aborted', 'AbortError');
    checks += 1;
    if (checks === 1) return json(200, { ok: true, state: 'unknown' });
    return json(200, { ok: true, state: checks < 4 ? 'pending' : 'ok' });
  });
  await api.uploadDemoIdentity('ctx-1', 'AJ-20261016-R0029');
  assert.equal(requests.filter((r) => r.method === 'POST').length, 1);
  assert.match(requests[1].body.uploadId, /^[A-Za-z0-9_-]{16,64}$/);
  assert.ok(requests.slice(2).every((r) => r.url.endsWith(`/identity/${requests[1].body.uploadId}`)));
  assert.equal(context.demoProfile.identityUploaded, true);
  assert.equal(context.demoProfile.idDocument, null);
  assert.match(busy.at(-1), /Still saving your identity photos/);
});

test('Send again on photos the Bot already stored goes straight on, with no second upload', async () => {
  const { api, requests, context } = page(() => json(200, { ok: true, state: 'ok' }));
  await api.uploadDemoIdentity('ctx-2', 'AJ-20261016-R0029');
  assert.deepEqual(requests.map((r) => r.method), ['GET']);
  assert.equal(context.demoProfile.identityUploaded, true);
});

test('the same photos keep one upload id; new photos get a new one', () => {
  const { api, context } = page(() => json(200, {}));
  const first = api.demoIdentityUploadId();
  assert.equal(api.demoIdentityUploadId(), first);
  context.demoProfile.selfieWithId = { name: 'retake.jpg' };
  assert.notEqual(api.demoIdentityUploadId(), first);
});

test('a refused upload still shows the error, and an upload the Bot never got can be sent again', async () => {
  const refused = page((request) => request.method === 'POST' ? json(503, { error: 'identity_storage_unavailable' }) : json(200, { ok: true, state: 'unknown' }));
  await assert.rejects(refused.api.uploadDemoIdentity('ctx-3'), /identity_storage_unavailable/);
  assert.equal(refused.context.demoProfile.identityUploaded, false);
  assert.ok(refused.context.demoProfile.idDocument, 'photos stay selected');

  const lost = page((request) => {
    if (request.method === 'POST') throw new TypeError('Load failed');
    return json(200, { ok: true, state: 'unknown' });
  });
  await assert.rejects(lost.api.uploadDemoIdentity('ctx-4'), /identity_upload_not_received/);
  assert.ok(lost.context.demoProfile.idDocument, 'photos stay selected');
});
