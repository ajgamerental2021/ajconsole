// AJ place search: the delivery-place boxes on the rental calculator (/quote/)
// and on booking step 2 both use this one file, so they behave the same.
//
// A customer types a place (a condo, a village, an address) or pastes a map
// link. Once they stop typing, the Bot looks it up:
//   - one place, or a pasted link: it is taken at once;
//   - several places: a list opens under the box, each with its name and full
//     address; picking one closes the list;
//   - nothing found: the box says so, and how to type it better.
// The page decides what a chosen place means (a price, a link for the
// booking) through onPlace, and shows the green "found" line itself.
//
// Never per keystroke: 1.5 s after the last key, at least 4 characters, not
// in the middle of composing a Thai character; at once on paste, Enter or
// leaving the box. The same text is never looked up twice, and an answer
// overtaken by newer typing is dropped.
//
// Where the customer cannot or will not type, the same box takes a pin:
// "📍 use my current location", and "🗺️ pin it on a map", a map the customer
// moves under a fixed pin. The map needs no permission from the browser, so it
// works where location is refused: the Facebook and Instagram in-app
// browsers never let a web page have it. A refused location opens the map by
// itself. The map is assets/pin-map.html in a frame: Google Maps when the
// Bot's /api/config hands out a browser key (GOOGLE_MAPS_BROWSER_KEY on
// Render); without one, or if Google refuses the key, OpenStreetMap drawn with
// Leaflet, kept on this site (assets/vendor/leaflet-1.9.4). The sheet has its
// own TH / EN button, which switches its words and the map's labels.
(function () {
  'use strict';

  // Where this file was loaded from, so the map page is found next to it from any page.
  var SELF = (document.currentScript && document.currentScript.src) || '';

  var TEXT = {
    th: {
      searching: 'กำลังค้นหาสถานที่…',
      choose: 'เลือกสถานที่ที่ถูกต้อง',
      none: 'ไม่พบสถานที่นี้ ลองพิมพ์ให้ละเอียดขึ้น เช่น ชื่อคอนโด / หมู่บ้าน + เขต หรือวางลิงก์ Google Maps',
      linkNone: 'ลิงก์นี้ไม่มีตำแหน่งที่อ่านได้ ลองพิมพ์ชื่อสถานที่แทน หรือกด 📍 ใช้ตำแหน่งปัจจุบัน',
      failed: 'ค้นหาสถานที่ไม่สำเร็จ ลองอีกครั้ง',
      tooMany: 'ค้นหาถี่เกินไป รอสักครู่แล้วลองใหม่',
      mapTitle: 'ปักหมุดที่ส่ง',
      mapHelp: 'เลื่อนแผนที่ให้หมุดสีแดงตรงกับที่ส่ง ซูมเข้าเพื่อความแม่นยำ แล้วกด "ใช้ตำแหน่งนี้"',
      mapUse: 'ใช้ตำแหน่งนี้',
      mapCancel: 'ยกเลิก',
      mapFail: 'โหลดแผนที่ไม่สำเร็จ ลองอีกครั้ง หรือพิมพ์ชื่อสถานที่ในช่องแทน',
      mapOutside: 'หมุดอยู่นอกประเทศไทย เลื่อนแผนที่ให้หมุดตรงกับที่ส่ง',
      blockedApp: 'แอป Facebook / Instagram ไม่ให้เว็บใช้ตำแหน่งปัจจุบัน ปักหมุดบนแผนที่นี้แทนได้เลย',
      blocked: 'เบราว์เซอร์นี้ไม่ให้ตำแหน่งปัจจุบัน ปักหมุดบนแผนที่นี้แทนได้เลย',
      pinned: 'ตำแหน่งที่ปักหมุด',
      mapLang: '🇬🇧 EN',
      mapLangLabel: 'Switch to English',
      mapLoading: 'แผนที่กำลังโหลด รอสักครู่แล้วกดอีกครั้ง'
    },
    en: {
      searching: 'Looking for the place…',
      choose: 'Choose the right place',
      none: 'No place found. Type it in more detail, such as the building or village name and district, or paste a Google Maps link.',
      linkNone: 'This link has no location we can read. Type the place name instead, or use 📍 your current location.',
      failed: 'The place search did not work. Please try again.',
      tooMany: 'Too many searches. Please wait a moment and try again.',
      mapTitle: 'Pin the delivery place',
      mapHelp: 'Move the map until the red pin is on the delivery place, zoom in to be exact, then tap "Use this spot".',
      mapUse: 'Use this spot',
      mapCancel: 'Cancel',
      mapFail: 'The map did not load. Try again, or type the place in the box instead.',
      mapOutside: 'The pin is outside Thailand. Move the map until the pin is on the delivery place.',
      blockedApp: 'The Facebook / Instagram app does not let web pages use your location. Pin it on this map instead.',
      blocked: 'This browser did not share your location. Pin it on this map instead.',
      pinned: 'Pinned location',
      mapLang: '🇹🇭 TH',
      mapLangLabel: 'เปลี่ยนเป็นภาษาไทย',
      mapLoading: 'The map is still loading. Wait a moment and tap again.'
    }
  };
  var TYPING_PAUSE_MS = 1500;
  var MIN_CHARS = 4;

  var STYLE = [
    '.ajps-panel{margin-top:6px;border:1px solid #d7dbe3;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(17,24,39,.12);overflow:hidden;text-align:left}',
    '.ajps-head{padding:8px 12px;font-size:12.5px;font-weight:800;color:#6b7280;background:#f8fafc;border-bottom:1px solid #eef0f4}',
    '.ajps-item{display:flex;gap:10px;align-items:flex-start;width:100%;margin:0;padding:10px 12px;border:0;border-bottom:1px solid #f0f2f5;border-radius:0;background:#fff;color:#14181f;font:inherit;text-align:left;cursor:pointer}',
    '.ajps-item:last-child{border-bottom:0}',
    '.ajps-item:hover,.ajps-item.active{background:#fff5f5}',
    '.ajps-item .ajps-pin{flex:none;line-height:1.4}',
    '.ajps-item b{display:block;font-size:14.5px;font-weight:800;line-height:1.4}',
    '.ajps-item small{display:block;margin-top:2px;color:#6b7280;font-size:12.5px;font-weight:500;line-height:1.45}',
    '.ajps-status{padding:10px 12px;font-size:13px;color:#6b7280;line-height:1.5}',
    '.ajps-status.warn{color:#b91c1c}',
    '.ajps-map-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(17,24,39,.55)}',
    '.ajps-map-sheet{display:flex;flex-direction:column;width:min(560px,100%);height:min(720px,100%);background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.3);font-family:inherit;color:#14181f}',
    '@media (max-width:600px){.ajps-map-sheet{width:100%;height:100%;border-radius:0}}',
    '.ajps-map-head{padding:14px 16px 10px;border-bottom:1px solid #eef0f4}',
    '.ajps-map-title{display:flex;align-items:center;justify-content:space-between;gap:12px}',
    '.ajps-map-head b{display:block;font-size:17px;font-weight:800}',
    '.ajps-map-lang{flex:none;padding:7px 14px;border:0;border-radius:999px;background:#c90012;color:#fff;font:inherit;font-size:14px;font-weight:800;cursor:pointer}',
    '.ajps-map-head p{margin:4px 0 0;font-size:13px;line-height:1.5;color:#4b515c}',
    '.ajps-map-head p.note{margin-top:8px;padding:8px 10px;border-radius:10px;background:#fff7e6;color:#8a5200;font-weight:700}',
    '.ajps-map-head p.warn{color:#b91c1c;font-weight:700}',
    '.ajps-map-box{position:relative;flex:1;min-height:240px;background:#e5e7eb}',
    '.ajps-map{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}',
    '.ajps-map-pin{position:absolute;left:50%;top:50%;width:36px;height:48px;margin:-48px 0 0 -18px;z-index:500;pointer-events:none;filter:drop-shadow(0 3px 3px rgba(0,0,0,.35))}',
    '.ajps-map-actions{display:flex;gap:10px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #eef0f4}',
    '.ajps-map-actions button{flex:1;padding:13px;border-radius:12px;font:inherit;font-size:16px;font-weight:800;cursor:pointer}',
    '.ajps-map-cancel{border:1px solid #d7dbe3;background:#fff;color:#14181f}',
    '.ajps-map-use{border:0;background:#c90012;color:#fff}'
  ].join('');
  var PIN_SVG = '<svg class="ajps-map-pin" viewBox="0 0 36 48" aria-hidden="true"><path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="#c90012"/><circle cx="18" cy="18" r="7" fill="#fff"/></svg>';
  var BANGKOK = { lat: 13.7563, lng: 100.5018 };

  function inThailand(lat, lng) { return lat >= 5 && lat <= 21 && lng >= 96 && lng <= 106; }
  /** A Google Maps link carrying the pin itself. */
  function pinLink(lat, lng) { return 'https://maps.google.com/?q=' + Number(lat).toFixed(6) + ',' + Number(lng).toFixed(6); }
  // The Facebook and Instagram in-app browsers, which never share a location.
  function blockingApp() { return /FBAN|FBAV|FB_IAB|FBIOS|Instagram/i.test(navigator.userAgent || ''); }

  function pinPlace(at) { return { name: '', address: '', lat: at.lat, lng: at.lng, link: at.link, pin: at.link }; }

  // While the map sheet is open, its own TH / EN button is the only one: the
  // page hides its language buttons (html.ajps-map-open) and, inside the
  // booking page's calculator pop-up, tells the booking page to hide the
  // pop-up's (AJ_PIN_MAP). Cancel or "use this spot" brings them back.
  var mapsOpen = 0;
  function announceMap(open) {
    mapsOpen = Math.max(0, mapsOpen + (open ? 1 : -1));
    var anyOpen = mapsOpen > 0;
    document.documentElement.classList.toggle('ajps-map-open', anyOpen);
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'AJ_PIN_MAP', open: anyOpen }, '*'); } catch (e) {}
    }
  }

  // The map: the customer moves it under a fixed pin. The map itself is
  // assets/pin-map.html in a frame, because Google Maps takes its language
  // once, when it loads: the language button reloads the frame in the other
  // language at the same spot and zoom. Resolves with { lat, lng }, or null
  // when cancelled. opts: center, noteKey, api, lang, onLang(lang).
  function openMap(opts) {
    opts = opts || {};
    var lang = opts.lang === 'en' ? 'en' : 'th';
    var t = function (key) { return TEXT[lang][key]; };
    var view = opts.center && isFinite(Number(opts.center.lat)) && isFinite(Number(opts.center.lng)) && inThailand(Number(opts.center.lat), Number(opts.center.lng))
      ? { lat: Number(opts.center.lat), lng: Number(opts.center.lng), zoom: 17 }
      : { lat: BANGKOK.lat, lng: BANGKOK.lng, zoom: 11 };
    var returnFocus = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'ajps-map-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = '<div class="ajps-map-sheet">'
      + '<div class="ajps-map-head"><div class="ajps-map-title"><b></b><button type="button" class="ajps-map-lang"></button></div><p class="help"></p>'
      + (opts.noteKey ? '<p class="note"></p>' : '') + '<p class="warn" hidden></p></div>'
      + '<div class="ajps-map-box"><iframe class="ajps-map" title=""></iframe>' + PIN_SVG + '</div>'
      + '<div class="ajps-map-actions"><button type="button" class="ajps-map-cancel"></button>'
      + '<button type="button" class="ajps-map-use"></button></div></div>';
    document.body.appendChild(overlay);
    var $ = function (selector) { return overlay.querySelector(selector); };
    var frame = $('.ajps-map');
    var say = function (text) { $('.warn').textContent = text || ''; $('.warn').hidden = !text; };
    // The map frame's own report of the spot under the pin (same site).
    var spot = function () {
      try { var map = frame.contentWindow && frame.contentWindow.ajPinMap; return map ? map.center() : null; } catch (e) { return null; }
    };
    var load = function () {
      frame.src = new URL('pin-map.html', SELF || location.href).href + '?v=20261003-4&lang=' + lang
        + '&lat=' + view.lat.toFixed(6) + '&lng=' + view.lng.toFixed(6) + '&zoom=' + Math.round(view.zoom)
        + '&api=' + encodeURIComponent(String(opts.api || ''));
    };
    var words = function () {
      overlay.setAttribute('aria-label', t('mapTitle'));
      overlay.setAttribute('lang', lang);
      $('.ajps-map-title b').textContent = t('mapTitle');
      $('.ajps-map-lang').textContent = t('mapLang');
      $('.ajps-map-lang').setAttribute('aria-label', t('mapLangLabel'));
      $('.help').textContent = t('mapHelp');
      if (opts.noteKey) $('.note').textContent = t(opts.noteKey);
      frame.title = t('mapTitle');
      $('.ajps-map-cancel').textContent = t('mapCancel');
      $('.ajps-map-use').textContent = t('mapUse');
      say('');
    };
    words();
    load();
    announceMap(true);
    return new Promise(function (resolve) {
      var done = function (value) {
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        announceMap(false);
        if (returnFocus && returnFocus.focus) { try { returnFocus.focus({ preventScroll: true }); } catch (e) {} }
        resolve(value);
      };
      var onKey = function (event) { if (event.key === 'Escape') { event.preventDefault(); done(null); } };
      document.addEventListener('keydown', onKey, true);
      $('.ajps-map-cancel').addEventListener('click', function () { done(null); });
      // The sheet's words and the map's labels switch together; the map
      // reopens where the customer had moved it.
      $('.ajps-map-lang').addEventListener('click', function () {
        var at = spot();
        if (at) view = { lat: at.lat, lng: at.lng, zoom: at.zoom || view.zoom };
        lang = lang === 'en' ? 'th' : 'en';
        words();
        load();
        if (opts.onLang) opts.onLang(lang);
      });
      $('.ajps-map-use').addEventListener('click', function () {
        var at = spot();
        if (!at) return say(t('mapLoading'));
        if (!inThailand(at.lat, at.lng)) return say(t('mapOutside'));
        done({ lat: at.lat, lng: at.lng });
      });
      $('.ajps-map-use').focus({ preventScroll: true });
    });
  }

  function addStyle() {
    if (document.getElementById('ajps-style')) return;
    var style = document.createElement('style');
    style.id = 'ajps-style';
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function isLink(text) { return /^https?:\/\/\S+$/i.test(String(text || '').trim()); }

  /** "Name · full address", without saying the name twice. */
  function label(place) {
    var name = String(place && place.name || '').trim();
    var address = String(place && place.address || '').trim();
    if (!name) return address;
    if (!address || address.toLowerCase().indexOf(name.toLowerCase()) === 0) return address || name;
    return name + ' · ' + address;
  }

  /**
   * options:
   *   input     CSS selector of the box (looked up each time, so a page that
   *             re-renders its form keeps working)
   *   api       the Bot's address, or a function returning it
   *   lang      function returning 'th' or 'en'
   *   onInput   (text) the customer changed the text: an earlier place no
   *             longer stands
   *   onPlace   (place, how) a place was chosen: { name, address, lat, lng,
   *             link, pin }; how is 'auto' (the only match), 'picked' or 'link'
   *   onMiss    (reason) nothing usable: 'none', 'link_none', 'failed', 'too_many'
   */
  function create(options) {
    addStyle();
    var state = { timer: 0, composing: false, seq: 0, lastText: '', choices: [], active: 0, panel: null, lastPlace: null, mapLang: '' };
    var t = function (key) { var lang = options.lang && options.lang() === 'en' ? 'en' : 'th'; return TEXT[lang][key]; };
    var input = function () { return document.querySelector(options.input); };
    // The map opens in the page's language, or in the one the customer last
    // switched it to on this page.
    var mapOptions = function (extra) {
      return Object.assign({
        api: apiBase(),
        lang: state.mapLang || (options.lang && options.lang() === 'en' ? 'en' : 'th'),
        onLang: function (lang) { state.mapLang = lang; }
      }, extra);
    };
    var apiBase = function () { return String(typeof options.api === 'function' ? options.api() : options.api || '').replace(/\/$/, ''); };

    function panel() {
      var box = input();
      if (!box) return null;
      if (state.panel && state.panel.isConnected && state.panel.previousElementSibling === box) return state.panel;
      var el = document.createElement('div');
      el.className = 'ajps-panel';
      el.id = (box.id || 'ajps') + 'Places';
      el.setAttribute('role', 'listbox');
      el.setAttribute('aria-live', 'polite');
      el.hidden = true;
      // Keep the box focused while a place is tapped, so leaving the box does
      // not start another search before the pick lands.
      el.addEventListener('mousedown', function (event) { event.preventDefault(); });
      el.addEventListener('click', function (event) {
        var item = event.target.closest('[data-ajps-i]');
        if (item) choose(state.choices[Number(item.getAttribute('data-ajps-i'))], 'picked');
      });
      box.insertAdjacentElement('afterend', el);
      box.setAttribute('role', 'combobox');
      box.setAttribute('aria-autocomplete', 'list');
      box.setAttribute('aria-controls', el.id);
      box.setAttribute('aria-expanded', 'false');
      state.panel = el;
      return el;
    }

    function show(html) {
      var el = panel();
      if (!el) return;
      el.innerHTML = html;
      el.hidden = !html;
      var box = input();
      if (box) box.setAttribute('aria-expanded', state.choices.length && html ? 'true' : 'false');
    }

    function close() {
      state.choices = [];
      if (state.panel) { state.panel.hidden = true; state.panel.innerHTML = ''; }
      var box = input();
      if (box) { box.setAttribute('aria-expanded', 'false'); box.removeAttribute('aria-activedescendant'); }
    }

    function status(key, warn) { show('<div class="ajps-status' + (warn ? ' warn' : '') + '" role="status">' + esc(t(key)) + '</div>'); }

    function renderChoices() {
      var id = (input() && input().id) || 'ajps';
      show('<div class="ajps-head">' + esc(t('choose')) + '</div>' + state.choices.map(function (place, i) {
        var address = place.address && place.address !== place.name ? '<small>' + esc(place.address) + '</small>' : '';
        return '<button type="button" class="ajps-item' + (i === state.active ? ' active' : '') + '" role="option" id="' + id + 'Place' + i + '" aria-selected="' + (i === state.active) + '" data-ajps-i="' + i + '">'
          + '<span class="ajps-pin" aria-hidden="true">📍</span><span><b>' + esc(place.name || place.address) + '</b>' + address + '</span></button>';
      }).join(''));
      var box = input();
      if (box) box.setAttribute('aria-activedescendant', id + 'Place' + state.active);
    }

    function choose(place, how) {
      if (!place) return;
      // A pin with no address known still reads as something.
      if (!place.name && !place.address) place = Object.assign({}, place, { name: t('pinned') + ' ' + Number(place.lat).toFixed(6) + ', ' + Number(place.lng).toFixed(6) });
      var box = input();
      close();
      state.lastPlace = place;
      // A pasted link stays as the customer gave it; a name or a pin reads as
      // the place.
      if (box && how !== 'link') box.value = place.name || place.address || box.value;
      state.lastText = box ? box.value.trim() : '';
      if (options.onPlace) options.onPlace(place, how);
    }

    function miss(reason) {
      status(reason === 'link_none' ? 'linkNone' : reason === 'too_many' ? 'tooMany' : reason === 'failed' ? 'failed' : 'none', true);
      if (options.onMiss) options.onMiss(reason);
    }

    async function lookup(opts) {
      opts = opts || {};
      clearTimeout(state.timer);
      var box = input();
      var text = box ? box.value.trim() : '';
      if (!text) { close(); return; }
      if (state.choices.length && text === state.lastText) { renderChoices(); return; }
      if (text === state.lastText && !opts.force) return;
      var link = isLink(text);
      if (!link && text.length < (opts.auto ? MIN_CHARS : 3)) return;
      var seq = ++state.seq;
      state.lastText = text;
      if (!opts.quiet) status('searching');
      try {
        var response = await fetch(apiBase() + '/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, lang: options.lang && options.lang() === 'en' ? 'en' : 'th' })
        });
        var data = await response.json().catch(function () { return {}; });
        // More typing since: this answer is for old text.
        if (seq !== state.seq) return;
        var places = response.ok && data.ok && Array.isArray(data.places) ? data.places.filter(function (p) { return p && isFinite(Number(p.lat)) && isFinite(Number(p.lng)); }) : [];
        // A pin is a place even when its address cannot be found.
        if (!places.length && opts.pinAt) return choose(pinPlace(opts.pinAt), 'pin');
        if (response.status === 429) { state.lastText = ''; return opts.quiet ? close() : miss('too_many'); }
        if (!response.ok || !data.ok) { state.lastText = ''; return opts.quiet ? close() : miss('failed'); }
        if (!places.length) return opts.quiet ? close() : miss(link ? 'link_none' : 'none');
        if (link) return choose(places[0], opts.pin ? 'pin' : 'link');
        if (places.length === 1) return choose(places[0], 'auto');
        state.choices = places;
        state.active = 0;
        renderChoices();
      } catch (error) {
        if (seq !== state.seq) return;
        if (opts.pinAt) return choose(pinPlace(opts.pinAt), 'pin');
        state.lastText = '';
        if (opts.quiet) close(); else miss('failed');
      }
    }

    function schedule(delay) {
      clearTimeout(state.timer);
      state.timer = setTimeout(function () {
        var box = input();
        if (state.composing || !box) return;
        lookup({ auto: true });
      }, delay);
    }
    function typingDelay() { var box = input(); return box && isLink(box.value) ? 300 : TYPING_PAUSE_MS; }
    var mine = function (event) { var box = input(); return !!box && event.target === box; };

    document.addEventListener('input', function (event) {
      if (!mine(event)) return;
      state.seq += 1;
      state.lastText = '';
      close();
      if (options.onInput) options.onInput(event.target.value);
      schedule(typingDelay());
    });
    document.addEventListener('paste', function (event) { if (mine(event)) setTimeout(function () { schedule(0); }, 0); });
    document.addEventListener('compositionstart', function (event) { if (mine(event)) { state.composing = true; clearTimeout(state.timer); } });
    document.addEventListener('compositionend', function (event) { if (mine(event)) { state.composing = false; schedule(typingDelay()); } });
    document.addEventListener('change', function (event) { if (mine(event)) schedule(0); });
    document.addEventListener('keydown', function (event) {
      if (!mine(event) || state.composing || event.isComposing) return;
      var count = state.choices.length;
      if (count && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault();
        state.active = (state.active + (event.key === 'ArrowDown' ? 1 : count - 1)) % count;
        renderChoices();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (count) choose(state.choices[state.active], 'picked');
        else lookup({ force: !state.lastText });
      } else if (event.key === 'Escape' && count) {
        close();
      }
    });

    return {
      /** Look the box's text up now (Enter, a button, a filled-in link). */
      lookup: lookup,
      close: close,
      /** Text the page put in the box itself, already settled: no lookup. */
      remember: function (text) { state.lastText = String(text || '').trim(); },
      /**
       * The map under a fixed pin. Resolves { lat, lng }, or null when
       * cancelled. Starts at the place chosen last, else Bangkok.
       */
      pickOnMap: function (opts) {
        opts = opts || {};
        return openMap(mapOptions({ center: opts.center || state.lastPlace, noteKey: opts.noteKey }));
      },
      /**
       * The phone's location. Where the browser refuses it (always, in the
       * Facebook and Instagram apps), the map opens instead, saying why.
       * Resolves { lat, lng }, or null when the customer gives up.
       */
      locate: function () {
        var fallback = function () { return openMap(mapOptions({ center: state.lastPlace, noteKey: blockingApp() ? 'blockedApp' : 'blocked' })); };
        if (!navigator.geolocation) return fallback();
        return new Promise(function (resolve) {
          navigator.geolocation.getCurrentPosition(function (position) {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          }, function () { resolve(null); }, { enableHighAccuracy: true, timeout: blockingApp() ? 6000 : 12000, maximumAge: 60000 });
        }).then(function (at) { return at || fallback(); });
      },
      /** Put a pin in the box as a link, and find the address there. */
      usePin: function (at) {
        var box = input();
        if (!box || !at) return;
        var link = pinLink(at.lat, at.lng);
        box.value = link;
        state.seq += 1;
        state.lastText = '';
        close();
        if (options.onInput) options.onInput(link);
        lookup({ force: true, pin: true, pinAt: { lat: Number(at.lat), lng: Number(at.lng), link: link } });
      },
      /** The page redrew its form: put an open list back under the new box. */
      refresh: function () { if (state.choices.length) renderChoices(); },
      /** A list is open and waiting for a pick. */
      choosing: function () { return state.choices.length > 0; },
      /** Take the highlighted place in the open list. */
      pickActive: function () {
        if (!state.choices.length) return false;
        choose(state.choices[state.active], 'picked');
        return true;
      }
    };
  }

  window.AJPlaceSearch = { create: create, label: label, isLink: isLink, pinLink: pinLink, blockingApp: blockingApp };
})();
