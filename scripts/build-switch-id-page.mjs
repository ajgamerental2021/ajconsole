// Builds ajgameid/switch/index.html, the Nintendo Switch ID list, from the PS5
// list at ajgameid/index.html.
//
// The two pages are the same app: search, queue, booking, LINE handoff, admin,
// Gist sync. Only the words, the help text and the data differ. Keeping one
// page and generating the other means a fix to the PS5 page reaches the Switch
// page by running this again:
//
//   node scripts/build-switch-id-page.mjs
//
// Every change below has to find its text exactly as many times as it says, or
// the build stops, so an edit to the PS5 page that moves one of these places
// fails loudly here instead of leaving PS5 wording on the Switch page.
// tests/ajgameid-switch.test.mjs checks the committed page is up to date.
//
// The Switch games themselves are edited in the page's admin and live in the
// Gist (file aj-switch-game-id-data.json). ajgameid/switch/source_data.json is
// only what a first visit shows before the Gist answers.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

export function buildSwitchPage(ps5Html = read('ajgameid/index.html'), sourceData = JSON.parse(read('ajgameid/switch/source_data.json'))) {
  let html = ps5Html;

  const replace = (from, to, times = 1) => {
    const found = html.split(from).length - 1;
    if (found !== times) {
      throw new Error(`Switch page build: expected ${times} of ${JSON.stringify(from.slice(0, 80))}, found ${found}`);
    }
    html = html.split(from).join(to);
  };
  const replaceBetween = (start, end, to) => {
    const a = html.indexOf(start);
    const b = html.indexOf(end, a + start.length);
    if (a < 0 || b < 0 || html.indexOf(start, a + 1) >= 0) {
      throw new Error(`Switch page build: cannot find the block from ${JSON.stringify(start.slice(0, 60))}`);
    }
    html = html.slice(0, a) + to + html.slice(b);
  };

  replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n  <!-- Built from ajgameid/index.html by scripts/build-switch-id-page.mjs.\n       Edit that page or the script, then run the script; edits made here\n       are lost on the next build. -->');

  // --- What a shared link and the browser tab show
  replace('<title>รายการไอดีเกม PS5</title>', '<title>รายการไอดีเกม Nintendo Switch</title>');
  replace('content="รายการไอดีเกม PS5 ของ AJ เช่าเครื่องเกม ค้นหาชื่อเกมและเช็คเกมที่เช่าเล่นได้ ทั้งภาษาไทยและอังกฤษ"',
    'content="รายการไอดีเกม Nintendo Switch ของ AJ เช่าเครื่องเกม ค้นหาชื่อเกมและเช็คเกมที่เช่าเล่นได้ ทั้งภาษาไทยและอังกฤษ"', 2);
  replace('content="รายการไอดีเกม PS5 · AJ เช่าเครื่องเกม"', 'content="รายการไอดีเกม Nintendo Switch · AJ เช่าเครื่องเกม"');
  replace('<meta property="og:url" content="https://ajgamerental.com/ajgameid" />',
    '<meta property="og:url" content="https://ajgamerental.com/ajgameid/switch/" />');

  // --- The page is one folder deeper
  replace('src="../assets/vendor/', 'src="../../assets/vendor/');
  replace('src="../assets/admin-passkey.js"', 'src="../../assets/admin-passkey.js"');
  replace("['assets/help/rent-step-", "['../assets/help/rent-step-", 10);

  // --- Which list this is
  replace("const ID_PLATFORM = 'ps5';", "const ID_PLATFORM = 'switch';");
  replace("const DEFAULT_GIST_FILE = 'aj-ps5-game-id-data.json';", "const DEFAULT_GIST_FILE = 'aj-switch-game-id-data.json';");
  replace('placeholder="aj-ps5-game-id-data.json"', 'placeholder="aj-switch-game-id-data.json"');
  replace("const STORAGE_KEY = CONFIG.storageKey || 'aj_ps5_game_id_rental_v2';", "const STORAGE_KEY = CONFIG.storageKey || 'aj_switch_game_id_rental_v1';");
  replace("app: 'aj-ps5-game-id-rental',", "app: 'aj-switch-game-id-rental',", 2);
  replace("description: 'AJ PS5 Game ID Rental Sync',", "description: 'AJ Nintendo Switch Game ID Rental Sync',");
  replace("a.download = 'ps5-game-id-data.json';", "a.download = 'switch-game-id-data.json';");
  const dataLine = html.match(/^ {4}const SOURCE_DATA = .*;$/m);
  if (!dataLine) throw new Error('Switch page build: SOURCE_DATA line not found');
  html = html.replace(dataLine[0], () => `    const SOURCE_DATA = ${JSON.stringify(sourceData)};`);

  // --- The PS5 / Switch switcher: Switch is the current page
  replace('<a class="platform-tab active" data-platform="ps5" href="/ajgameid/" aria-current="page">PS5</a>',
    '<a class="platform-tab" data-platform="ps5" href="/ajgameid/">PS5</a>');
  replace('<a class="platform-tab" data-platform="switch" href="/ajgameid/switch/">Nintendo Switch</a>',
    '<a class="platform-tab active" data-platform="switch" href="/ajgameid/switch/" aria-current="page">Nintendo Switch</a>');

  // --- Titles and wording
  replace('<h1 id="siteTitleText">รายการไอดีเกม PS5</h1>', '<h1 id="siteTitleText">รายการไอดีเกม Nintendo Switch</h1>');
  replace('<h2 id="heroTitleText">รายการไอดีเกม PS5</h2>', '<h2 id="heroTitleText">รายการไอดีเกม Nintendo Switch</h2>');
  replace("siteTitle: 'รายการไอดีเกม PS5',", "siteTitle: 'รายการไอดีเกม Nintendo Switch',");
  replace("heroTitle: 'รายการไอดีเกม PS5',", "heroTitle: 'รายการไอดีเกม Nintendo Switch',");
  replace("siteTitle: 'PS5 Game ID List',", "siteTitle: 'Nintendo Switch Game ID List',");
  replace("heroTitle: 'PS5 Game ID List',", "heroTitle: 'Nintendo Switch Game ID List',");
  replace("platformFallback: 'PS5',", "platformFallback: 'Nintendo Switch',", 2);
  replace("lineMessageRentIntro: '🎮 สวัสดีครับ สนใจเช่าไอดีเกม PS5',", "lineMessageRentIntro: '🎮 สวัสดีครับ สนใจเช่าไอดีเกม Nintendo Switch',");
  replace("lineMessageReserveIntro: '📅 สวัสดีครับ สนใจจองล่วงหน้าไอดีเกม PS5',", "lineMessageReserveIntro: '📅 สวัสดีครับ สนใจจองล่วงหน้าไอดีเกม Nintendo Switch',");
  replace("lineMessageRentIntro: '🎮 Hello, I would like to rent a PS5 game ID.',", "lineMessageRentIntro: '🎮 Hello, I would like to rent a Nintendo Switch game ID.',");
  replace("lineMessageReserveIntro: '📅 Hello, I would like to reserve a PS5 game ID in advance.',", "lineMessageReserveIntro: '📅 Hello, I would like to reserve a Nintendo Switch game ID in advance.',");
  replace('placeholder="พิมพ์ชื่อเกม เช่น Saros, Spider-Man 2, Ghost of Yotei..."', 'placeholder="พิมพ์ชื่อเกม เช่น Mario Kart, Zelda, Pokémon..."');
  replace("searchPlaceholder: 'พิมพ์ชื่อเกม เช่น Saros, Spider-Man 2, Ghost of Yotei...',", "searchPlaceholder: 'พิมพ์ชื่อเกม เช่น Mario Kart, Zelda, Pokémon...',");
  replace("searchPlaceholder: 'Search a game title, e.g. Saros, Spider-Man 2, Ghost of Yotei...',", "searchPlaceholder: 'Search a game title, e.g. Mario Kart, Zelda, Pokémon...',");
  replace("notFoundDesc: 'ลองพิมพ์ชื่อเกมสั้นลง หรือใช้คำใกล้เคียง เช่น Spider-Man, Ghost, Resident Evil',", "notFoundDesc: 'ลองพิมพ์ชื่อเกมสั้นลง หรือใช้คำใกล้เคียง เช่น Mario, Zelda, Pokémon',");
  replace("notFoundDesc: 'Try a shorter keyword or a close title like Spider-Man, Ghost, or Resident Evil.',", "notFoundDesc: 'Try a shorter keyword or a close title like Mario, Zelda, or Pokémon.',");
  replace("phSearchTerms: 'เช่น Spider-Man 2, Ghost of Tsushima, Hogwarts Legacy',", "phSearchTerms: 'เช่น Mario Kart 8, Zelda Tears of the Kingdom, Pokémon',");
  replace("phSearchTerms: 'e.g. Spider-Man 2, Ghost of Tsushima, Hogwarts Legacy',", "phSearchTerms: 'e.g. Mario Kart 8, Zelda Tears of the Kingdom, Pokémon',");

  // --- Admin defaults for a new ID
  replace('placeholder="เช่น PS5"', 'placeholder="เช่น Nintendo Switch"');
  replace("platform: 'PS5',", "platform: 'Nintendo Switch',");
  replace("draft.platform = el.fPlatform.value.trim() || 'PS5';", "draft.platform = el.fPlatform.value.trim() || 'Nintendo Switch';");
  replace("el.fPlatform.placeholder = currentLang === 'th' ? 'เช่น PS5' : 'e.g. PS5';", "el.fPlatform.placeholder = currentLang === 'th' ? 'เช่น Nintendo Switch' : 'e.g. Nintendo Switch';");

  // --- Help: how the two ID types work on a Switch
  replaceBetween('    function getIdTypesContent(lang) {', '    function getRentGuideContent(lang) {', SWITCH_ID_TYPES);

  // --- Help: the last step. The PS5 video shows the PS5 QR sign-in; on a
  // Switch the shop walks the customer through it in the chat.
  replaceBetween('            <div class="guide-step">\n              <div class="video-frame">', '          </div>\n        `\n      };\n    }\n\n    function getInfoContent', SWITCH_LAST_STEP);
  replaceBetween('      const videoCaption = lang === \'en\'', '      return {\n        title: lang === \'en\' ? \'How to request an ID rental\'', SWITCH_LAST_STEP_TEXT);

  // Anything that still says PS5 to a customer is a place this script missed.
  // Allowed: the switcher's PS5 tab, code comments, storage keys, the PS5
  // list's Gist token key, and base64 images.
  const left = html.replace(/data:[a-z/+]+;base64,[A-Za-z0-9+/=]+/g, '').split('\n').filter((line) =>
    /\bPS5\b|PSN|PlayStation/.test(line) && !/data-platform="ps5"|^\s*\/\/|'aj_ps5_[a-z0-9_]+'/.test(line));
  if (left.length) throw new Error(`Switch page build: PS5 wording left over:\n${left.map((l) => l.trim().slice(0, 140)).join('\n')}`);
  return html;
}

const SWITCH_ID_TYPES = `    function getIdTypesContent(lang) {
      if (lang === 'en') {
        return {
          title: 'Store ID vs Customer ID',
          body: \`
            <div class="info-lead">
              <div class="info-alert">⚠️ Store ID = Play through the shop's Nintendo Account. Saves do not go to your own user.</div>
              <div class="info-ok">✅ Customer ID = Play through your own user. Your saves stay with you.</div>
            </div>
            <p><strong>Read more details below 👇</strong></p>
            <div class="info-section">
              <h4>🎮 Store ID — play through the shop account</h4>
              <p>Customers play the game through the shop's <strong>Nintendo Account</strong>, signed in as a user on your Switch.</p>
              <p><strong>📌 What you get</strong></p>
              <ul>
                <li>Play the listed game throughout the rental period.</li>
                <li>Play story mode and other game modes normally.</li>
                <li>Download game updates.</li>
              </ul>
              <p><strong>⚠️ Limitations</strong></p>
              <ul>
                <li>Game saves stay on the shop's user, not your own user.</li>
                <li>After the rental ends, you cannot continue playing or use the same save.</li>
                <li>An internet connection is required while playing because usage rights are checked.</li>
              </ul>
              <p><strong>✨ Best for:</strong> customers who want to finish a game in a short time and do not need the save on their own user.</p>
            </div>
            <div class="info-section">
              <h4>👤 Customer ID — play through your own user</h4>
              <p>The shop enables the game on your Nintendo Switch, then you play it from your own <strong>user and Nintendo Account</strong> on that console.</p>
              <p><strong>📌 What you get</strong></p>
              <ul>
                <li>Play with your own user name and profile.</li>
                <li>Saves stay on your own user.</li>
                <li>Use your own friends list and settings.</li>
                <li>After the rental ends, your saves remain. If you buy or rent the game again, you can continue from your save.</li>
              </ul>
              <p><strong>⚠️ Limitations</strong></p>
              <ul>
                <li>You receive temporary play access only. You do not own the game.</li>
                <li>After the rental ends, the game will be locked or cannot be opened.</li>
                <li>Access works only on the Switch where the shop sets it up. It cannot be moved to another console.</li>
                <li>The shop's account can enable a game on one console at a time. When the rental ends, the shop will contact you / ask you to remove the shop's account yourself.</li>
              </ul>
              <p><strong>✨ Best for:</strong> customers who want to play on their own user, keep their saves, and continue playing longer term.</p>
            </div>
          \`
        };
      }

      return {
        title: 'ไอดีร้านกับไอดีลูกค้า ต่างกันยังไง ?',
        body: \`
          <div class="info-lead">
            <div class="info-alert">⚠️ ไอดีร้าน = เล่นผ่าน Nintendo Account ของร้าน เซฟไม่เข้าผู้ใช้ของตัวเอง</div>
            <div class="info-ok">✅ ไอดีลูกค้า = เล่นผ่านผู้ใช้ของตัวเอง เซฟอยู่กับลูกค้า</div>
          </div>
          <p><strong>สามารถอ่านรายละเอียดเพิ่มเติมทางด้านล่าง 👇</strong></p>
          <div class="info-section">
            <h4>🎮 ไอดีร้าน — เล่นผ่านบัญชีของร้าน</h4>
            <p>ลูกค้าจะเข้าเล่นเกมผ่าน <strong>Nintendo Account ของทางร้าน</strong> ที่เพิ่มเป็นผู้ใช้ไว้ในเครื่อง Switch ของลูกค้า</p>
            <p><strong>📌 ได้รับสิทธิ์</strong></p>
            <ul>
              <li>เล่นเกมที่ระบุไว้ในไอดีนั้นได้ตลอดระยะเวลาเช่า</li>
              <li>เล่นเนื้อเรื่องและโหมดต่าง ๆ ของตัวเกมได้ตามปกติ</li>
              <li>ดาวน์โหลดอัปเดตเกมได้</li>
            </ul>
            <p><strong>⚠️ ข้อจำกัด</strong></p>
            <ul>
              <li>เซฟเกมจะอยู่ในผู้ใช้ของร้าน ไม่เข้าผู้ใช้ส่วนตัวของลูกค้า</li>
              <li>เมื่อหมดระยะเวลาเช่า จะไม่สามารถเข้าเล่นหรือใช้เซฟเดิมต่อได้</li>
              <li>ต้องเชื่อมต่ออินเทอร์เน็ตตลอดเวลาในการเล่น เพราะระบบมีการตรวจสอบสิทธิ์การใช้งานเกม</li>
            </ul>
            <p><strong>✨ เหมาะกับ:</strong> ลูกค้าที่ต้องการเล่นให้จบภายในระยะสั้น และไม่เน้นเก็บเซฟไว้ในผู้ใช้ของตัวเอง</p>
          </div>
          <div class="info-section">
            <h4>👤 ไอดีลูกค้า — เล่นผ่านผู้ใช้ของลูกค้าเอง</h4>
            <p>ทางร้านจะเปิดสิทธิ์เกมให้เครื่อง Nintendo Switch ของลูกค้า จากนั้นลูกค้าสามารถเล่นผ่าน <strong>ผู้ใช้และ Nintendo Account ของตัวเอง</strong> บนเครื่องนั้นได้</p>
            <p><strong>📌 ได้รับสิทธิ์</strong></p>
            <ul>
              <li>เล่นผ่านชื่อและโปรไฟล์ผู้ใช้ของตัวเอง</li>
              <li>เซฟเกมอยู่ในผู้ใช้ของลูกค้า</li>
              <li>ใช้รายชื่อเพื่อนและการตั้งค่าของตัวเองได้</li>
              <li>เมื่อหมดเวลาเช่า เซฟยังอยู่ หากซื้อเกมหรือเช่าใหม่ก็สามารถเล่นต่อจากเดิมได้</li>
            </ul>
            <p><strong>⚠️ ข้อจำกัด</strong></p>
            <ul>
              <li>ลูกค้าได้รับเพียงสิทธิ์เล่นชั่วคราว ไม่ได้เป็นเจ้าของเกม</li>
              <li>เมื่อหมดระยะเวลาเช่า เกมจะถูกล็อกหรือไม่สามารถเปิดเล่นได้</li>
              <li>ใช้สิทธิ์ได้เฉพาะเครื่อง Switch ที่ร้านตั้งค่าให้ ไม่สามารถนำไปเปิดในเครื่องอื่น</li>
              <li>บัญชีของร้านเปิดสิทธิ์เกมได้ครั้งละหนึ่งเครื่อง ดังนั้นเมื่อหมดเวลาเช่า ทางร้านจะทักหา/ให้ลูกค้าลบบัญชีของร้านออกด้วยตัวเอง</li>
            </ul>
            <p><strong>✨ เหมาะกับ:</strong> ลูกค้าที่ต้องการเล่นผ่านผู้ใช้ของตัวเอง เก็บเซฟ และต้องการเล่นต่อเนื่องระยะยาว</p>
          </div>
        \`
      };
    }

`;

const SWITCH_LAST_STEP = `            <div class="guide-step">
              <p>6. \${escapeHtml(lastStep)}</p>
            </div>
`;

const SWITCH_LAST_STEP_TEXT = `      const lastStep = lang === 'en'
        ? 'After payment and sending the slip, the shop will guide you in the chat through signing the ID in on your Nintendo Switch.'
        : 'เมื่อชำระเงินและแจ้งสลิปแล้ว ทางร้านจะแนะนำขั้นตอนการเข้าไอดีบนเครื่อง Nintendo Switch ให้ทางแชท';

`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('ajgameid/switch/index.html', root), buildSwitchPage());
  console.log('Wrote ajgameid/switch/index.html');
}
