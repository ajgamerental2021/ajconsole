const $ = (id) => document.getElementById(id);
const apiBase = document.querySelector('meta[name="aj-api-base"]')?.content || '';
const tokenKey = 'ajBroadcastToken';
const rememberedTokenKey = 'ajBroadcastRememberedToken';
const rememberedUsernameKey = 'ajBroadcastRememberedUsername';
const state = { token: sessionStorage.getItem(tokenKey) || localStorage.getItem(rememberedTokenKey) || '', campaigns: [], audience: null, editing: '', lang: localStorage.getItem('ajBroadcastLang') || 'th', testConfigured: false };
function clearSession() { state.token = ''; sessionStorage.removeItem(tokenKey); localStorage.removeItem(rememberedTokenKey); }
const sample = (title = 'AJ Game Rental', body = state.lang === 'en' ? 'Rent a game console for 3 days' : 'โปรเช่าเครื่องเกม 3 วัน', image = '', action = 'https://ajgamerental.com', aspectRatio = '1:1', buttonLabel = state.lang === 'en' ? 'View details' : 'ดูรายละเอียด') => ({
  type: 'bubble', hero: image ? { type: 'image', url: image, size: 'full', aspectRatio, aspectMode: 'cover' } : undefined,
  body: { type: 'box', layout: 'vertical', spacing: 'md', contents: [
    { type: 'text', text: title, weight: 'bold', size: 'xl', wrap: true },
    { type: 'text', text: body, size: 'md', wrap: true, color: '#536273' },
  ] },
  footer: { type: 'box', layout: 'vertical', contents: [{ type: 'button', style: 'primary', color: '#07a94d', action: { type: 'uri', label: buttonLabel, uri: action } }] },
});
const defaultMessage = () => ({ type: 'flex', altText: say('ข่าวสารจาก AJ Game Rental', 'News from AJ Game Rental'), contents: sample() });
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const say = (th, en) => state.lang === 'en' ? en : th;
const labelsEn = new Map(Object.entries({
  'สร้าง · ดูตัวอย่าง · ส่งทดสอบ · ตั้งเวลา': 'Create · preview · test · schedule',
  'ออกจากระบบ': 'Sign out', 'เข้าสู่ระบบแอดมิน': 'Admin sign in', 'ใช้บัญชีแอดมิน AJ เดิม': 'Use your existing AJ Admin account',
  'เข้าสู่ระบบ': 'Sign in', 'จดจำการเข้าสู่ระบบ 30 วัน': 'Remember me for 30 days', 'รายการส่ง': 'Campaigns', 'สร้างข้อความ': 'Message editor', 'ผู้รับและ Label': 'Recipients and labels', 'คู่มือ': 'Guide',
  'รายการ Broadcast': 'Broadcast campaigns', 'ติดตามร่าง กำหนดเวลา และผลการส่ง': 'Track drafts, schedules, and results', '+ สร้างใหม่': '+ New campaign',
  'ออกแบบข้อความ': 'Design message', 'ใช้ตัวช่วยสร้าง หรือแก้ Flex JSON เพื่อใช้ทุกองค์ประกอบที่ LINE รองรับ': 'Use the builder or edit Flex JSON for the full LINE Flex schema',
  'ข้อความใหม่': 'New message', 'ชื่อแคมเปญ': 'Campaign name', 'ข้อความแจ้งเตือน LINE (Alt text)': 'LINE notification text (Alt text)',
  'รูปแบบ': 'Format', 'จำนวน Bubble': 'Number of bubbles', 'สร้าง JSON จากฟอร์ม': 'Build JSON from form', 'จัดรูป JSON': 'Format JSON',
  'Flex Message JSON': 'Flex Message JSON', 'ตรวจและดู Preview': 'Validate and preview', 'ส่ง Test ให้แอดมิน': 'Send test to Admin',
  'LINE User ID สำหรับส่ง Test ให้แอดมิน': 'Admin LINE User ID for test sends', 'บันทึก': 'Save',
  'จำลองหน้าตาในแชท · ส่ง Test เพื่อดูการแสดงผลจริงใน LINE': 'Chat preview · send a test to see the actual LINE rendering',
  'ผู้รับและกำหนดเวลา': 'Audience and schedule', 'ผู้ติดตาม LINE OA ทั้งหมด (ไม่ต้องผูกบัญชี)': 'All LINE OA followers (no account link needed)', 'ลูกค้าที่ผูก LINE ทั้งหมด': 'All linked LINE customers', 'ภาษาไทย': 'Thai', 'ภาษาอังกฤษ': 'English',
  'มีวันเริ่มเช่าในอนาคต': 'Upcoming rental', 'Maximum ผู้รับ': 'Maximum recipients',
  'เลือกได้หลาย label; หากไม่เลือกจะใช้ทั้ง target': 'Choose multiple labels; leave blank for the entire target',
  'ตั้งเวลาส่ง': 'Schedule send', 'วันและเวลา (ไทย UTC+7)': 'Date and time (Thailand UTC+7)', 'ตรวจจำนวนผู้รับ': 'Check audience',
  'ส่งทันที': 'Send now', 'เว้น Maximum ว่างเพื่อส่งให้ทุกคนใน Target ที่เลือก ผู้ติดตาม OA ทั้งหมดส่งผ่าน LINE โดยไม่ทราบจำนวนล่วงหน้าและขึ้นอยู่กับโควตาที่เหลือ': 'Leave Maximum blank to reach everyone in the selected target. LINE sends to all OA followers without a known count in advance, subject to remaining quota.',
  'เฉพาะบัญชี LINE ที่เชื่อมกับ Booking หรือ VIP แล้ว': 'Only LINE accounts linked to a booking or VIP profile', 'รีเฟรช': 'Refresh',
  'ค้นหาชื่อหรือ LINE ID': 'Search by name or LINE ID', 'ใช้ AJ LINE Broadcast ทำอะไรได้บ้าง': 'What can AJ LINE Broadcast do?',
  'ข้อความ Flex': 'Flex messages', 'สร้าง Bubble หรือ Carousel ใส่รูป หัวข้อ ราคา ปุ่มเปิดเว็บ ปุ่มส่งข้อความ หรือ Postback ได้ แก้ JSON โดยตรงเพื่อใช้โครงสร้าง Flex ที่ LINE รองรับ': 'Create a Bubble or Carousel with images, headlines, prices, links, message actions, or postbacks. Edit JSON directly for the full LINE Flex schema.',
  'คัดผู้รับ': 'Target recipients', 'ส่ง Flex ให้ผู้ติดตาม LINE OA ทั้งหมดได้โดยไม่ต้องรู้ LINE Unique ID หรือเลือกกลุ่มลูกค้าที่ผูกบัญชีแล้ว, VIP, ภาษา และวันเริ่มเช่า พร้อมกรองด้วย Label ของ AJ': 'Send Flex to all LINE OA followers without their LINE User IDs, or choose linked customers, VIPs, language, and rental dates with AJ labels.',
  'ควบคุมการส่ง': 'Control delivery', 'ดูจำนวนผู้รับก่อนส่ง จำกัด Maximum ตั้งเวลาประเทศไทย ส่ง Test ให้แอดมิน บันทึกร่าง และติดตามจำนวนส่งสำเร็จ/ล้มเหลว': 'Count recipients, optionally cap them, schedule in Thailand time, send an Admin test, save drafts, and track success and failures.',
  'ไอเดียแคมเปญ': 'Campaign ideas', 'โปรรายเครื่อง, ชุดเครื่องพร้อมเกม, Flash Deal, คูปองกลับมาเช่า, แนะนำเครื่องใหม่ และการ์ด Carousel เปรียบเทียบราคา ใช้ลิงก์ UTM ในปุ่มเพื่อติดตามการคลิก': 'Try device deals, console and game bundles, flash deals, return offers, new arrivals, and price comparison carousels. Add UTM links to buttons for click tracking.',
  'Preview ในเว็บเป็นตัวอย่างใกล้เคียง LINE; ส่ง Test เพื่อดูหน้าตาบนอุปกรณ์จริง ก่อนส่งให้ลูกค้า': 'The web preview approximates LINE. Send a test to inspect the actual message on your device before broadcasting.',
  'Broadcast ไปยังผู้ติดตาม OA ทั้งหมดใช้ LINE Messaging API โดยไม่ต้องมี LINE Unique ID; ไม่สามารถใช้ Label ของ AJ หรือจำกัดจำนวนผู้รับได้ และขึ้นอยู่กับโควตา LINE': 'Broadcast to all OA followers uses the LINE Messaging API without LINE User IDs. AJ labels and recipient caps do not apply; LINE quota does.',
}));
const labelsTh = new Map([...labelsEn].map(([th, en]) => [en, th]));
function translateAll() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const value = node.textContent.trim();
    const next = state.lang === 'en' ? labelsEn.get(value) : labelsTh.get(value);
    if (next) node.textContent = node.textContent.replace(value, next);
  }
  $('searchRecipient').placeholder = say('ค้นหาผู้รับ', 'Search recipients');
  $('maximum').placeholder = say('เว้นว่าง = ทุกคน', 'Blank = everyone');
}
function status(message, error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
function actionDialog(title, message, { confirmLabel = say('ยืนยัน', 'Confirm'), success = false } = {}) {
  const dialog = $('actionDialog');
  $('dialogTitle').textContent = title; $('dialogMessage').textContent = message;
  $('dialogCancel').hidden = success; $('dialogConfirm').textContent = success ? say('ปิด', 'Close') : confirmLabel;
  if (!dialog.showModal) return Promise.resolve(success ? (alert(message), true) : confirm(message));
  return new Promise((resolve) => {
    const done = (answer) => { dialog.close(); resolve(answer); };
    $('dialogCancel').onclick = () => done(false);
    $('dialogConfirm').onclick = () => done(true);
    dialog.oncancel = (event) => { event.preventDefault(); done(false); };
    dialog.showModal();
  });
}
async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}/api/admin/broadcasts${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.token}` }, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) { clearSession(); showLogin(); throw new Error('admin_login_required'); }
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
  return result;
}
function showLogin() { $('loginPanel').hidden = false; $('app').hidden = true; $('logout').hidden = true; }
function showApp() { $('loginPanel').hidden = true; $('app').hidden = false; $('logout').hidden = false; }
function tab(name) { document.querySelectorAll('.panel').forEach((node) => { node.hidden = node.id !== name; }); document.querySelectorAll('[data-tab]').forEach((node) => node.classList.toggle('active', node.dataset.tab === name)); if (name === 'audience') void loadAudience(); }
const blankCard = () => ({ title: '', body: '', image: '', action: 'https://ajgamerental.com', buttonLanguage: state.lang, buttonText: '' });
function readCardFields() {
  return [...$('templateFields').querySelectorAll('.template-card')].map((card) => Object.fromEntries(
    ['title', 'body', 'image', 'action', 'buttonLanguage', 'buttonText'].map((field) => [field, card.querySelector(`[data-field="${field}"]`)?.value || ''])
  ));
}
function renderCardFields(cards) {
  $('bubbleCount').value = String(cards.length);
  $('bubbleCount').disabled = $('templateType').value !== 'carousel';
  $('templateFields').innerHTML = cards.map((card, i) => `<div class="template-card"><div class="template-card-head"><h3>${say('การ์ด', 'Card')} ${i + 1}</h3><button type="button" class="template-delete" data-delete="${i}" ${cards.length === 1 ? 'disabled' : ''}>${say('ลบการ์ด', 'Delete card')}</button></div><label>${say('หัวข้อ', 'Heading')}<textarea data-field="title" rows="2" placeholder="Steam Deck OLED">${esc(card.title)}</textarea></label><label>${say('รายละเอียด', 'Description')}<textarea data-field="body" rows="3" placeholder="เช่า 3 วัน ฿899">${esc(card.body)}</textarea></label><label>${say('รูปภาพ HTTPS', 'HTTPS image URL')}<input data-field="image" type="url" value="${esc(card.image)}" placeholder="https://..."></label><label>${say('ลิงก์ปุ่ม', 'Button URL')}<input data-field="action" type="url" value="${esc(card.action)}"></label><label>${say('ภาษาปุ่ม', 'Button language')}<select data-field="buttonLanguage"><option value="th" ${card.buttonLanguage !== 'en' ? 'selected' : ''}>${say('ไทย', 'Thai')}</option><option value="en" ${card.buttonLanguage === 'en' ? 'selected' : ''}>English</option></select></label><label>${say('ข้อความบนปุ่ม (เว้นว่างเพื่อใช้ค่าเริ่มต้น)', 'Button text (blank uses default)')}<input data-field="buttonText" maxlength="40" value="${esc(card.buttonText)}" placeholder="${card.buttonLanguage === 'en' ? 'View details' : 'ดูรายละเอียด'}"></label></div>`).join('');
  $('templateFields').querySelectorAll('[data-delete]').forEach((button) => { button.onclick = () => {
    const kept = readCardFields(); kept.splice(Number(button.dataset.delete), 1);
    if (kept.length === 1) $('templateType').value = 'bubble';
    renderCardFields(kept); syncTemplatePreview();
  }; });
  $('templateFields').querySelectorAll('input,textarea,select').forEach((input) => {
    if (input.dataset.field === 'buttonLanguage') input.onchange = () => { input.closest('.template-card').querySelector('[data-field="buttonText"]').placeholder = input.value === 'en' ? 'View details' : 'ดูรายละเอียด'; syncTemplatePreview(); };
    else
    if (['image', 'action'].includes(input.dataset.field)) input.onchange = syncTemplatePreview;
    else input.oninput = syncTemplatePreview;
  });
}
function cardFields() {
  const current = readCardFields();
  const count = $('templateType').value === 'carousel' ? Math.min(12, Math.max(2, Number($('bubbleCount').value) || 2)) : 1;
  renderCardFields(Array.from({ length: count }, (_, i) => current[i] || blankCard()));
  if ($('flexJson').value) syncTemplatePreview();
}
function bubbleCountChanged() {
  const count = Number($('bubbleCount').value);
  if (!Number.isInteger(count) || count < 1) return;
  if (count === 1) $('templateType').value = 'bubble';
  cardFields();
}
function cardFieldsFromMessage(message) {
  const bubbles = message.contents?.type === 'carousel' ? message.contents.contents : [message.contents];
  $('templateType').value = bubbles.length > 1 ? 'carousel' : 'bubble';
  renderCardFields(bubbles.map((bubble) => {
    const buttonLabel = bubble?.footer?.contents?.find((part) => part.type === 'button')?.action?.label || '';
    const buttonLanguage = /[ก-๙]/.test(buttonLabel) ? 'th' : 'en';
    return {
    title: bubble?.body?.contents?.find((part) => part.type === 'text')?.text || '',
    body: bubble?.body?.contents?.filter((part) => part.type === 'text')[1]?.text || '',
    image: bubble?.hero?.url || '',
    action: bubble?.footer?.contents?.find((part) => part.type === 'button')?.action?.uri || 'https://ajgamerental.com',
    buttonLanguage,
    buttonText: buttonLabel === (buttonLanguage === 'en' ? 'View details' : 'ดูรายละเอียด') ? '' : buttonLabel,
  }; }));
}
function templateMessage() {
  const cards = readCardFields().map((card) => sample(card.title.trim() || 'AJ Game Rental', card.body.trim() || say('ข่าวสารสำหรับคุณ', 'News for you'), card.image.trim(), card.action.trim() || 'https://ajgamerental.com', '1:1', card.buttonText.trim() || (card.buttonLanguage === 'en' ? 'View details' : 'ดูรายละเอียด')));
  return { type: 'flex', altText: $('altText').value.trim(), contents: cards.length === 1 ? cards[0] : { type: 'carousel', contents: cards } };
}
function syncTemplatePreview() {
  const message = templateMessage();
  $('flexJson').value = JSON.stringify(message, null, 2);
  renderPreview(message);
}
const imageRatios = new Map();
const imageColors = new Map();
function artworkColor(url) {
  if (!imageColors.has(url)) imageColors.set(url, api('/image-color', { method: 'POST', body: { url } })
    .then((result) => /^#[0-9a-f]{6}$/i.test(result.color || '') ? result.color : '#e5ebf1')
    .catch(() => '#e5ebf1'));
  return imageColors.get(url);
}
function naturalImageRatio(url) {
  if (imageRatios.has(url)) return imageRatios.get(url);
  const pending = new Promise((resolve) => {
    const img = new Image(); let finished = false;
    const finish = (ratio) => { if (finished) return; finished = true; clearTimeout(timer); resolve(ratio); };
    const timer = setTimeout(() => finish(''), 3500);
    img.onload = () => { const gcd = (a, b) => b ? gcd(b, a % b) : a; const divisor = gcd(img.naturalWidth, img.naturalHeight) || 1; finish(`${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`); };
    img.onerror = () => finish(''); img.src = url;
  });
  imageRatios.set(url, pending);
  return pending;
}
async function prepareMessageImages(message) {
  const images = [];
  const bubbles = message.contents?.type === 'carousel' ? message.contents.contents : [message.contents];
  const heroes = new Set((bubbles || []).map((bubble) => bubble?.hero).filter(Boolean));
  const walk = (part) => {
    if (!part || typeof part !== 'object') return;
    if (part.type === 'image' && /^https:\/\//i.test(part.url || '')) images.push(part);
    Object.values(part).forEach((value) => Array.isArray(value) ? value.forEach(walk) : walk(value));
  };
  walk(message.contents);
  await Promise.all(images.map(async (part) => {
    if (heroes.has(part)) part.aspectMode = 'cover';
    const [ratio, color] = await Promise.all([naturalImageRatio(part.url), artworkColor(part.url)]);
    if (heroes.has(part)) part.aspectRatio = ratio || part.aspectRatio || '1:1';
    part.backgroundColor = color;
  }));
  return message;
}
function flexNode(part) {
  if (!part || typeof part !== 'object') return document.createTextNode('');
  const node = document.createElement('div');
  if (part.type === 'box') {
    node.className = `flex-box ${['horizontal', 'baseline'].includes(part.layout) ? part.layout : 'vertical'}`;
    if (part.backgroundColor) node.style.backgroundColor = part.backgroundColor;
    if (part.paddingAll) node.style.padding = part.paddingAll;
    (part.contents || []).forEach((child) => node.append(flexNode(child)));
  } else if (part.type === 'text' || part.type === 'span') {
    node.className = 'flex-text';
    node.textContent = part.text || '';
    if (part.color) node.style.color = part.color;
    if (part.weight === 'bold') node.style.fontWeight = '700';
    if (part.size) node.style.fontSize = ({ xs: '11px', sm: '13px', md: '15px', lg: '17px', xl: '20px', xxl: '24px' })[part.size] || part.size;
    if (part.align) node.style.textAlign = part.align;
    if (Array.isArray(part.contents)) part.contents.forEach((child) => node.append(flexNode(child)));
  } else if (part.type === 'image' || part.type === 'icon') {
    const img = document.createElement('img'); img.className = 'flex-image'; img.alt = '';
    node.style.backgroundColor = part.backgroundColor || '#e5ebf1';
    img.style.backgroundColor = part.backgroundColor || '#e5ebf1';
    if (/^https:\/\//i.test(part.url || '')) img.src = part.url;
    if (part.aspectRatio) { const [w, h] = part.aspectRatio.split(':').map(Number); if (w && h) img.style.aspectRatio = `${w}/${h}`; }
    img.style.objectFit = part.aspectMode === 'fit' ? 'contain' : 'cover';
    node.append(img);
  } else if (part.type === 'button') {
    node.className = `flex-button ${part.style === 'primary' ? 'primary' : ''}`;
    node.textContent = part.action?.label || 'Button';
    if (part.color) node.style.backgroundColor = part.color;
  } else if (part.type === 'separator') node.className = 'flex-separator';
  else if (part.type === 'spacer' || part.type === 'filler') node.style.height = part.size === 'lg' ? '16px' : '8px';
  else { node.className = 'muted'; node.textContent = part.type || 'Unsupported element'; }
  return node;
}
function previewBubble(bubble) {
  if (bubble.type !== 'bubble') throw new Error('Carousel ต้องมี Bubble');
  const shell = document.createElement('div'); shell.className = 'line-bubble';
  for (const section of ['header', 'hero', 'body', 'footer']) {
    if (!bubble[section]) continue;
    if (section === 'hero') {
      const hero = flexNode(bubble.hero); hero.className = 'flex-hero'; shell.append(hero);
      if (bubble.hero.type === 'image' && bubble.hero.url) {
        const previewImage = hero.querySelector('img'); if (previewImage) previewImage.style.objectFit = 'cover';
        void naturalImageRatio(bubble.hero.url).then((ratio) => {
          if (!hero.isConnected || !ratio) return;
          const [w, h] = ratio.split(':').map(Number);
          const img = hero.querySelector('img'); if (img && w && h) img.style.aspectRatio = `${w}/${h}`;
        });
      }
      if (bubble.hero.type === 'image' && bubble.hero.url && !bubble.hero.backgroundColor) {
        void artworkColor(bubble.hero.url).then((color) => {
          if (!hero.isConnected) return;
          hero.style.backgroundColor = color;
          const img = hero.querySelector('img'); if (img) img.style.backgroundColor = color;
        });
      }
    }
    else { const wrap = document.createElement('div'); wrap.className = `line-section line-${section}`; wrap.append(flexNode(bubble[section])); shell.append(wrap); }
  }
  return shell;
}
function messageBubbles(message) {
  if (message?.type !== 'flex' || !message.contents) throw new Error('Flex JSON ไม่ถูกต้อง');
  return message.contents.type === 'carousel' ? message.contents.contents : [message.contents];
}
function renderPreview(message) {
  const area = $('preview'); area.replaceChildren();
  $('chatListPreview').innerHTML = `<strong>${say('ตัวอย่างในรายการแชท', 'Chat list preview')}</strong>${esc(message.altText || '')}`;
  messageBubbles(message).forEach((bubble) => area.append(previewBubble(bubble)));
}
function renderCampaignPreview(item, card) {
  const message = item.message;
  const bubbles = messageBubbles(message);
  const chatList = document.createElement('div'); chatList.className = 'chat-list-preview campaign-chat-list';
  const label = document.createElement('strong'); label.textContent = say('ข้อความในรายการแชท', 'Chat list message');
  const altText = document.createElement('span'); altText.textContent = message.altText || '';
  chatList.append(label, altText);
  const carousel = document.createElement('div'); carousel.className = 'chat-preview campaign-preview';
  carousel.tabIndex = 0;
  carousel.setAttribute('aria-label', say(`ตัวอย่างการ์ด ${bubbles.length} ใบ เลื่อนเพื่อดูทั้งหมด`, `Preview of ${bubbles.length} cards; scroll to view all`));
  bubbles.forEach((bubble) => carousel.append(previewBubble(bubble)));
  card.append(chatList, carousel);
  if (bubbles.length > 1) {
    const hint = document.createElement('small'); hint.className = 'muted campaign-scroll-hint';
    hint.textContent = say(`เลื่อนดูการ์ดทั้งหมด ${bubbles.length} ใบ →`, `Scroll to view all ${bubbles.length} cards →`);
    card.append(hint);
  }
}
function messageFromEditor() { const message = JSON.parse($('flexJson').value); message.altText = $('altText').value.trim(); return message; }
async function preview() {
  try { const message = await prepareMessageImages(messageFromEditor()); await api('/validate', { method: 'POST', body: { message } }); $('flexJson').value = JSON.stringify(message, null, 2); renderPreview(message); $('previewError').textContent = ''; status(say('ตรวจ Flex ผ่าน', 'Flex validation passed')); return message; }
  catch (error) { $('previewError').textContent = error.message; status(error.message, true); return null; }
}
function selectedLabels() { return [...document.querySelectorAll('#labelChoices .selected')].map((node) => node.dataset.label); }
const allFollowers = (segment) => segment === 'followers';
function updateTargetControls() {
  const followers = allFollowers($('segment').value);
  $('maximum').disabled = followers;
  if (followers) $('maximum').value = '';
  $('labelsField').hidden = followers;
  $('targetHelp').textContent = followers
    ? say('ส่งให้ผู้ติดตาม OA ทุกคนผ่าน LINE โดยไม่ต้องมี LINE Unique ID · ไม่รองรับ Label หรือ Maximum · จำนวนผู้รับจริงขึ้นอยู่กับ LINE และโควตาที่เหลือ', 'LINE sends to all OA followers without their LINE User IDs · Labels and Maximum are unavailable · actual delivery depends on LINE and remaining quota')
    : say('ส่งเฉพาะลูกค้าที่ผูก LINE กับ AJ แล้ว เลือก Label และจำกัดจำนวนผู้รับได้', 'Send only to customers linked to AJ; labels and recipient caps are available');
  $('audienceCount').textContent = '';
}
function updateLabelChoices() {
  const chosen = new Set(selectedLabels());
  $('labelChoices').replaceChildren();
  for (const label of state.audience?.labels || []) {
    const button = document.createElement('button'); button.type = 'button'; button.className = `chip ${chosen.has(label) ? 'selected' : ''}`; button.dataset.label = label; button.textContent = label;
    button.onclick = () => button.classList.toggle('selected'); $('labelChoices').append(button);
  }
}
function payload(schedule = $('scheduleEnabled').checked) {
  const segment = $('segment').value;
  return { title: $('campaignTitle').value.trim(), message: messageFromEditor(), target: { segment, labels: allFollowers(segment) ? [] : selectedLabels() }, maxRecipients: allFollowers(segment) || !$('maximum').value.trim() ? null : Number($('maximum').value), scheduledAt: schedule ? new Date(`${$('scheduleAt').value}+07:00`).toISOString() : '' };
}
async function save(schedule = $('scheduleEnabled').checked) {
  const data = payload(schedule);
  const result = await api(state.editing ? `/${state.editing}` : '', { method: state.editing ? 'PUT' : 'POST', body: data });
  state.editing = result.campaign.id;
  $('editingBadge').textContent = result.campaign.title;
  await loadCampaigns();
  status(say('บันทึกแล้ว', 'Saved'));
  return result.campaign;
}
function clearEditor() {
  state.editing = ''; $('editingBadge').textContent = say('ข้อความใหม่', 'New message');
  $('campaignTitle').value = ''; $('altText').value = defaultMessage().altText;
  $('templateType').value = 'bubble'; $('bubbleCount').value = '1'; renderCardFields([blankCard()]);
  $('flexJson').value = JSON.stringify(defaultMessage(), null, 2);
  $('segment').value = 'followers'; $('maximum').value = ''; $('scheduleEnabled').checked = false; $('scheduleAt').disabled = true; $('scheduleAt').value = '';
  $('labelChoices').querySelectorAll('.selected').forEach((node) => node.classList.remove('selected'));
  updateTargetControls(); renderPreview(defaultMessage()); tab('editor');
}
function editCampaign(campaign) {
  state.editing = campaign.id; $('editingBadge').textContent = campaign.title;
  $('campaignTitle').value = campaign.title; $('altText').value = campaign.message.altText;
  $('flexJson').value = JSON.stringify(campaign.message, null, 2);
  cardFieldsFromMessage(campaign.message);
  $('segment').value = campaign.target.segment; $('maximum').value = campaign.maxRecipients ?? '';
  updateTargetControls();
  $('scheduleEnabled').checked = Boolean(campaign.scheduledAt && campaign.status === 'scheduled');
  $('scheduleAt').disabled = !$('scheduleEnabled').checked;
  $('scheduleAt').value = campaign.scheduledAt ? new Date(Date.parse(campaign.scheduledAt) + 7 * 3600_000).toISOString().slice(0, 16) : '';
  $('labelChoices').querySelectorAll('button').forEach((node) => node.classList.toggle('selected', campaign.target.labels.includes(node.dataset.label)));
  renderPreview(campaign.message); tab('editor');
}
async function loadCampaigns() {
  const result = await api(''); state.campaigns = result.campaigns; state.testConfigured = Boolean(result.testRecipient);
  $('adminTestId').value = result.testRecipient || '';
  $('testButton').disabled = !state.testConfigured;
  const area = $('campaignList'); area.replaceChildren();
  if (!state.campaigns.length) area.textContent = say('ยังไม่มีแคมเปญ', 'No campaigns yet');
  for (const item of state.campaigns) {
    const card = document.createElement('article'); card.className = 'card campaign';
    const reach = allFollowers(item.target?.segment)
      ? item.status === 'completed'
        ? say('ผู้รับ: ผู้ติดตาม OA ทั้งหมด · LINE รับคำขอแล้ว ไม่ทราบจำนวนที่ส่งถึง', 'Audience: all OA followers · LINE accepted the request; delivery count is unavailable')
        : say('ผู้รับ: ผู้ติดตาม OA ทั้งหมด · ไม่ทราบจำนวนล่วงหน้า', 'Audience: all OA followers · count unavailable in advance')
      : `${say('ผู้รับสูงสุด', 'Maximum')}: ${item.maxRecipients ?? say('ทุกคนใน Target', 'Everyone in target')} · ${say('ส่งแล้ว', 'Sent')}: ${item.sent || 0} · ${say('ล้มเหลว', 'Failed')}: ${item.failed || 0}`;
    card.innerHTML = `<h2>${esc(item.title)}</h2><span class="pill">${esc(item.status)}</span><p>${esc(reach)}</p><p>${item.scheduledAt ? new Date(item.scheduledAt).toLocaleString(state.lang === 'en' ? 'en-GB' : 'th-TH', { timeZone: 'Asia/Bangkok' }) : say('ยังไม่ตั้งเวลา', 'Not scheduled')}</p>${item.lastError ? `<p class="error">${esc(item.lastError)}</p>` : ''}`;
    const actions = document.createElement('div'); actions.className = 'row';
    const button = (label, onClick, css = 'ghost') => { const node = document.createElement('button'); node.textContent = label; node.className = css; node.onclick = onClick; actions.append(node); };
    if (['draft', 'scheduled'].includes(item.status)) {
      button(say('แก้ไข', 'Edit'), () => editCampaign(item));
      if (item.status === 'draft') button(say('ส่งทันที', 'Send now'), () => void sendExisting(item), 'danger');
      if (item.status === 'scheduled') button(say('ยกเลิกเวลา', 'Cancel schedule'), async () => { if (!confirm(say('ยกเลิกการส่งตามเวลานี้?', 'Cancel this scheduled send?'))) return; await api(`/${item.id}/cancel`, { method: 'POST' }); await loadCampaigns(); });
      button(say('ลบ', 'Delete'), async () => { if (!confirm(say('ลบแคมเปญนี้?', 'Delete this campaign?'))) return; await api(`/${item.id}`, { method: 'DELETE' }); await loadCampaigns(); });
    } else button(say('ดูข้อความ', 'View'), () => editCampaign(item));
    renderCampaignPreview(item, card);
    card.append(actions); area.append(card);
  }
  void api('/quota').then(({ quota, usage }) => {
    $('lineQuota').textContent = quota?.type === 'limited'
      ? say(`โควตา LINE เดือนนี้: ใช้ ${usage?.totalUsage ?? '-'} จาก ${quota.value ?? '-'}`, `LINE quota this month: ${usage?.totalUsage ?? '-'} of ${quota.value ?? '-'}`)
      : say('โควตา LINE: ไม่จำกัดตามแผนปัจจุบัน', 'LINE quota: unlimited under the current plan');
  }).catch(() => { $('lineQuota').textContent = say('ตรวจโควตา LINE ไม่สำเร็จ', 'Could not read LINE quota'); });
}
async function sendExisting(item) {
  if (allFollowers(item.target?.segment)) {
    if (!await actionDialog(say('ยืนยันการส่ง Broadcast', 'Confirm broadcast'), say(`ส่ง “${item.title}” ให้ผู้ติดตาม LINE OA ทั้งหมดตอนนี้?`, `Send “${item.title}” to all LINE OA followers now?`), { confirmLabel: say('ส่งทันที', 'Send now') })) return;
  } else {
    const count = await api('/audience', { method: 'POST', body: { target: item.target, maxRecipients: item.maxRecipients } });
    if (!count.selected) { status(say('ไม่มีผู้รับในกลุ่มนี้', 'No matching recipients'), true); return; }
    if (!await actionDialog(say('ยืนยันการส่ง Broadcast', 'Confirm broadcast'), say(`ส่ง “${item.title}” ให้ ${count.selected} คนตอนนี้?`, `Send “${item.title}” to ${count.selected} people now?`), { confirmLabel: say('ส่งทันที', 'Send now') })) return;
  }
  await api(`/${item.id}/send`, { method: 'POST' }); await loadCampaigns(); status(say('เริ่มส่งแล้ว', 'Sending started'));
  await actionDialog(say('ส่ง Broadcast แล้ว', 'Broadcast started'), say('ระบบรับคำสั่งแล้วและกำลังส่งข้อความ ตรวจสถานะได้ในรายการ Broadcast', 'The send request was accepted. Check progress in Broadcast campaigns.'), { success: true });
}
async function loadAudience() {
  try { state.audience = await api('/audience', { method: 'POST', body: { target: { segment: 'all', labels: [] }, maxRecipients: 1000 } }); updateLabelChoices(); renderAudience(); }
  catch (error) { status(error.message, true); }
}
function renderAudience() {
  const data = state.audience; if (!data) return;
  $('audienceSummary').textContent = say(`บัญชี LINE ที่ผูกกับ AJ ${data.known} คน · รายการนี้ไม่รวมผู้ติดตาม OA ที่ยังไม่ผูก`, `${data.known} LINE accounts linked to AJ · this list excludes unlinked OA followers`);
  const query = $('searchRecipient').value.trim().toLowerCase();
  const area = $('recipientList'); area.replaceChildren();
  for (const row of data.recipients.filter((item) => !query || `${item.name} ${item.lineUserId}`.toLowerCase().includes(query)).slice(0, 200)) {
    const wrap = document.createElement('div'); wrap.className = 'recipient';
    const info = document.createElement('div'); info.textContent = `${row.name || 'LINE'} · ${row.vip ? 'VIP · ' : ''}${row.lang.toUpperCase()}`;
    const id = document.createElement('small'); id.textContent = `${row.lineUserId.slice(0, 6)}…${row.lineUserId.slice(-5)}`; info.append(id);
    const tags = document.createElement('div'); tags.className = 'chip-list';
    for (const label of row.labels) { const chip = document.createElement('button'); chip.className = 'chip selected'; chip.textContent = `× ${label}`; chip.title = say('ลบ Label', 'Remove label'); chip.onclick = async () => { await api('/labels', { method: 'POST', body: { lineUserId: row.lineUserId, label, enabled: false } }); await loadAudience(); }; tags.append(chip); }
    const input = document.createElement('input'); input.placeholder = say('เพิ่ม Label', 'Add label'); input.maxLength = 40;
    const add = document.createElement('button'); add.className = 'secondary'; add.textContent = '+'; add.onclick = async () => { if (!input.value.trim()) return; await api('/labels', { method: 'POST', body: { lineUserId: row.lineUserId, label: input.value.trim(), enabled: true } }); await loadAudience(); };
    tags.append(input, add); wrap.append(info, tags); area.append(wrap);
  }
}
function bind() {
  $('username').value = localStorage.getItem(rememberedUsernameKey) || '';
  $('rememberLogin').checked = Boolean(localStorage.getItem(rememberedTokenKey));
  $('loginForm').onsubmit = async (event) => {
    event.preventDefault();
    $('loginError').textContent = '';
    try {
      const username = $('username').value.trim();
      const remember = $('rememberLogin').checked;
      const response = await fetch(`${apiBase}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: $('password').value, remember }),
      });
      if (!response.ok) throw new Error('login_failed');
      const result = await response.json();
      clearSession();
      state.token = result.token;
      if (remember && result.remembered) {
        localStorage.setItem(rememberedTokenKey, state.token);
        localStorage.setItem(rememberedUsernameKey, username);
      } else {
        sessionStorage.setItem(tokenKey, state.token);
        localStorage.removeItem(rememberedUsernameKey);
      }
      $('password').value = '';
      showApp(); await loadCampaigns(); await loadAudience(); clearEditor();
    } catch {
      $('loginError').textContent = say('เข้าสู่ระบบไม่สำเร็จ', 'Sign in failed');
    }
  };
  $('logout').onclick = () => { clearSession(); showLogin(); };
  $('language').onclick = () => { const cards = readCardFields(); state.lang = state.lang === 'th' ? 'en' : 'th'; localStorage.setItem('ajBroadcastLang', state.lang); $('language').textContent = state.lang === 'th' ? 'EN' : 'ไทย'; translateAll(); renderCardFields(cards); try { renderPreview(messageFromEditor()); } catch { /* JSON may be mid-edit. */ } updateTargetControls(); if (state.token) void loadCampaigns(); if (state.audience) renderAudience(); };
  document.querySelectorAll('[data-tab]').forEach((node) => { node.onclick = () => tab(node.dataset.tab); });
  $('newCampaign').onclick = clearEditor; $('templateType').onchange = cardFields; $('bubbleCount').oninput = bubbleCountChanged;
  $('altText').oninput = () => {
    try { const message = messageFromEditor(); $('flexJson').value = JSON.stringify(message, null, 2); renderPreview(message); }
    catch { $('chatListPreview').innerHTML = `<strong>${say('ตัวอย่างในรายการแชท', 'Chat list preview')}</strong>${esc($('altText').value.trim())}`; }
  };
  $('applyTemplate').onclick = async () => { const message = await prepareMessageImages(templateMessage()); $('flexJson').value = JSON.stringify(message, null, 2); renderPreview(message); };
  $('formatJson').onclick = () => { try { $('flexJson').value = JSON.stringify(messageFromEditor(), null, 2); } catch (error) { status(error.message, true); } };
  $('previewButton').onclick = () => void preview();
  $('testButton').onclick = async () => { const message = await preview(); if (!message) return; if (!confirm(say('ส่งข้อความทดสอบไปยัง LINE แอดมิน?', 'Send test message to Admin LINE?'))) return; try { await api('/test', { method: 'POST', body: { message } }); status(say('ส่ง Test ให้แอดมินแล้ว', 'Test sent to Admin')); } catch (error) { status(error.message, true); } };
  $('saveTestId').onclick = async () => { try { await api('/test-recipient', { method: 'PUT', body: { lineUserId: $('adminTestId').value.trim() } }); await loadCampaigns(); status(say('บันทึกบัญชี Test แล้ว', 'Test recipient saved')); } catch (error) { status(error.message, true); } };
  $('scheduleEnabled').onchange = () => { $('scheduleAt').disabled = !$('scheduleEnabled').checked; };
  $('segment').onchange = updateTargetControls;
  $('countAudience').onclick = async () => { try {
    const segment = $('segment').value;
    if (allFollowers(segment)) {
      $('audienceCount').textContent = say('ผู้ติดตาม OA ทั้งหมด · ระบบไม่ทราบจำนวนผู้รับล่วงหน้า ตรวจโควตา LINE ด้านบน', 'All OA followers · exact recipient count is unavailable in advance. Check LINE quota above');
      return;
    }
    const result = await api('/audience', { method: 'POST', body: { target: { segment, labels: selectedLabels() }, maxRecipients: $('maximum').value.trim() ? Number($('maximum').value) : null } });
    $('audienceCount').textContent = $('maximum').value.trim()
      ? say(`ตรงเงื่อนไข ${result.matched} คน · จะส่งสูงสุด ${result.selected} คน`, `${result.matched} matched · up to ${result.selected} will receive`)
      : say(`ตรงเงื่อนไข ${result.matched} คน · จะส่งให้ทุกคน`, `${result.matched} matched · everyone will receive it`);
  } catch (error) { status(error.message, true); } };
  $('saveDraft').onclick = async () => { try {
    if (!await preview()) return;
    if ($('scheduleEnabled').checked) {
      const data = payload(true);
      const when = new Date(data.scheduledAt).toLocaleString(state.lang === 'en' ? 'en-GB' : 'th-TH', { timeZone: 'Asia/Bangkok' });
      if (allFollowers(data.target.segment)) {
        if (!await actionDialog(say('ยืนยันการบันทึก', 'Confirm save'), say(`ตั้งเวลาส่ง “${data.title}” ให้ผู้ติดตาม LINE OA ทั้งหมด วันที่ ${when}?`, `Schedule “${data.title}” for all LINE OA followers at ${when}?`))) return;
      } else {
        const audience = await api('/audience', { method: 'POST', body: { target: data.target, maxRecipients: data.maxRecipients } });
        if (!audience.selected) throw new Error(say('ไม่มีผู้รับในกลุ่มนี้', 'No matching recipients'));
        if (!await actionDialog(say('ยืนยันการบันทึก', 'Confirm save'), say(`ตั้งเวลาส่ง “${data.title}” ให้ ${audience.selected} คน วันที่ ${when}?`, `Schedule “${data.title}” for ${audience.selected} people at ${when}?`))) return;
      }
    } else if (!await actionDialog(say('ยืนยันการบันทึก', 'Confirm save'), say(`บันทึก “${$('campaignTitle').value.trim()}” เป็นร่าง?`, `Save “${$('campaignTitle').value.trim()}” as a draft?`))) return;
    const saved = await save();
    await actionDialog(say('บันทึกเสร็จแล้ว', 'Saved successfully'), saved.scheduledAt
      ? say('บันทึกและตั้งเวลาส่ง Broadcast แล้ว', 'Broadcast saved and scheduled.')
      : say('บันทึกข้อความ Broadcast เป็นร่างแล้ว', 'Broadcast saved as a draft.'), { success: true });
  } catch (error) { status(error.message, true); } };
  $('sendNow').onclick = async () => { try {
    if (!await preview()) return;
    const data = payload(false);
    if (allFollowers(data.target.segment)) {
      if (!await actionDialog(say('ยืนยันการส่ง Broadcast', 'Confirm broadcast'), say(`ส่ง “${data.title}” ให้ผู้ติดตาม LINE OA ทั้งหมดตอนนี้?`, `Send “${data.title}” to all LINE OA followers now?`), { confirmLabel: say('ส่งทันที', 'Send now') })) return;
    } else {
      const audience = await api('/audience', { method: 'POST', body: { target: data.target, maxRecipients: data.maxRecipients } });
      if (!audience.selected) throw new Error(say('ไม่มีผู้รับในกลุ่มนี้', 'No matching recipients'));
      if (!await actionDialog(say('ยืนยันการส่ง Broadcast', 'Confirm broadcast'), say(`ส่ง “${data.title}” ให้ ${audience.selected} คนตอนนี้?`, `Send “${data.title}” to ${audience.selected} people now?`), { confirmLabel: say('ส่งทันที', 'Send now') })) return;
    }
    const item = await save(false); await api(`/${item.id}/send`, { method: 'POST' }); await loadCampaigns(); tab('campaigns'); status(say('เริ่มส่งแล้ว', 'Sending started'));
    await actionDialog(say('ส่ง Broadcast แล้ว', 'Broadcast started'), say('ระบบรับคำสั่งแล้วและกำลังส่งข้อความ ตรวจสถานะได้ในรายการ Broadcast', 'The send request was accepted. Check progress in Broadcast campaigns.'), { success: true });
  } catch (error) { status(error.message, true); } };
  $('refreshAudience').onclick = () => void loadAudience(); $('searchRecipient').oninput = renderAudience;
}
bind(); $('altText').value = defaultMessage().altText; cardFields(); $('language').textContent = state.lang === 'th' ? 'EN' : 'ไทย'; $('flexJson').value = JSON.stringify(defaultMessage(), null, 2); renderPreview(defaultMessage()); translateAll(); updateTargetControls();
if (state.token) { showApp(); Promise.all([loadCampaigns(), loadAudience()]).catch(() => showLogin()); } else showLogin();
setInterval(() => { if (state.token && !$('campaigns').hidden) void loadCampaigns().catch((error) => status(error.message, true)); }, 30_000);
