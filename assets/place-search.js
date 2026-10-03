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
(function () {
  'use strict';

  var TEXT = {
    th: {
      searching: 'กำลังค้นหาสถานที่…',
      choose: 'เลือกสถานที่ที่ถูกต้อง',
      none: 'ไม่พบสถานที่นี้ ลองพิมพ์ให้ละเอียดขึ้น เช่น ชื่อคอนโด / หมู่บ้าน + เขต หรือวางลิงก์ Google Maps',
      linkNone: 'ลิงก์นี้ไม่มีตำแหน่งที่อ่านได้ ลองพิมพ์ชื่อสถานที่แทน หรือกด 📍 ใช้ตำแหน่งปัจจุบัน',
      failed: 'ค้นหาสถานที่ไม่สำเร็จ ลองอีกครั้ง',
      tooMany: 'ค้นหาถี่เกินไป รอสักครู่แล้วลองใหม่'
    },
    en: {
      searching: 'Looking for the place…',
      choose: 'Choose the right place',
      none: 'No place found. Type it in more detail, such as the building or village name and district, or paste a Google Maps link.',
      linkNone: 'This link has no location we can read. Type the place name instead, or use 📍 your current location.',
      failed: 'The place search did not work. Please try again.',
      tooMany: 'Too many searches. Please wait a moment and try again.'
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
    '.ajps-status.warn{color:#b91c1c}'
  ].join('');

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
    var state = { timer: 0, composing: false, seq: 0, lastText: '', choices: [], active: 0, panel: null };
    var t = function (key) { var lang = options.lang && options.lang() === 'en' ? 'en' : 'th'; return TEXT[lang][key]; };
    var input = function () { return document.querySelector(options.input); };
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
      var box = input();
      close();
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
        if (response.status === 429) { state.lastText = ''; return opts.quiet ? close() : miss('too_many'); }
        if (!response.ok || !data.ok) { state.lastText = ''; return opts.quiet ? close() : miss('failed'); }
        var places = (Array.isArray(data.places) ? data.places : []).filter(function (p) { return p && isFinite(Number(p.lat)) && isFinite(Number(p.lng)); });
        if (!places.length) return opts.quiet ? close() : miss(link ? 'link_none' : 'none');
        if (link) return choose(places[0], 'link');
        if (places.length === 1) return choose(places[0], 'auto');
        state.choices = places;
        state.active = 0;
        renderChoices();
      } catch (error) {
        if (seq !== state.seq) return;
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

  window.AJPlaceSearch = { create: create, label: label, isLink: isLink };
})();
