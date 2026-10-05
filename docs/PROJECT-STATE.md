# Project state

## 2026-10-05 — Compact Contact popup and in-page identity upgrade

- **Changes for Claude:** `ajconsole/index.html` and `tests/identity-choice-buttons.test.mjs`; Bot `public/verify-identity/index.html`, `src/server.js`, `src/services/payment-resume.js`, `test/identity-upgrade.test.js`. No new secrets or theme implementation.
- Contact popup auto-sizes on desktop/mobile; adds Facebook and WhatsApp links, with a WhatsApp footer icon beside LINE.
- Payment resume opens the signed identity-upgrade form inside a same-page modal. Successful submission closes it and reloads the rental, including masked document number, address/Maps link, verification state, normal deposit, new delivery quote and payment total. The Bot sends the existing `🪪 AJ Game Rental received identity images` shop notification after durable booking persistence.
- Summary-page verification now puts customer/address fields, document photos, refund account/Wise and signature in one popup. The deposit choice is restored on cancel. Its map-change button opens the same place search/current location/map-pin flow; it previews a fresh delivery quote without updating Console Pending until verification is submitted.
- Bot verification form has a bilingual map-change popup and address edits. Changed Maps links are repriced on the server before photos and contract are saved. New quote and payment plan are persisted; a write failure returns an error instead of success.
- Validation: syntax checks; site relevant tests 20/20; Bot identity/payment tests 15/15; Chromium 375px/1280px in TH/EN for Contact and payment modal, plus TH/EN summary map and Bot map smoke; mocked completion confirmed modal close, rental reload and updated total. Bot `/healthz` and `/liff/` responded locally. Browser/API smoke used mock bookings; no live customer payment or identity document was submitted.
- Dark-theme request is advice only. A persisted light/dark switch across `index`, `ajgameid` and `game_index` is feasible after a shared design-token and embedded-picker audit; do not claim zero regression risk or start implementation without a separate request.

## 2026-10-05 — ปุ่มยืนยันตัวตนในลิงก์ชำระเงินต่อ และช่องทางติดต่อ

- **แจ้ง Claude — สิ่งที่แก้:** `ajconsole/index.html` และ `aj-line-oa-bot/src/server.js`; ไม่มีไฟล์ใหม่หรือลบ ไม่แตะ `aj-cm` และไม่เพิ่ม secret.
- ลิงก์ชำระเงินต่อของรายการที่ยังไม่จ่ายและเลือกไม่ยืนยันตัวตน รับ signed identity-upgrade URL กับยอดค่าประกันปกติจาก Bot แล้วแสดงปุ่ม “ยืนยันตัวตนเพื่อลดค่าประกันเป็น ฿…” ทั้งไทย/อังกฤษ. หลังกลับจากหน้าพิสูจน์ตัวตน เว็บไซต์โหลดรายการใหม่เพื่อแสดงยอดล่าสุด; endpoint พิสูจน์ตัวตนเดิมเป็นผู้แก้ประวัติและ Console Pending จริง.
- ท้ายเว็บเพิ่มโลโก้ LINE ข้าง TikTok ไป `https://lin.ee/5rDwplO`; เมนูและ footer เพิ่ม “ติดต่อเรา / Contact Us” พร้อมไอคอนและ Popup เบอร์โทร `tel:+66816244715`, LINE `https://lin.ee/w4TFyCV`, อีเมล `mailto:contact@ajgamerental.com`.
- ตรวจ syntax ทั้งสองไฟล์, bot identity-upgrade/payment-resume tests 14/14, เว็บ pay-later/info-popup tests 17/17 และ Chromium smoke ที่ 375px กับ 1280px ภาษาไทย/อังกฤษผ่าน. Browser ใช้รายการจำลอง ไม่ได้ทำรายการชำระเงินจริง.

## 2026-10-05 — ตรวจ N2-1 วันที่ 12/10 หลังยกเลิก Booking 539

- ตรวจ production `delivery-app` commit `1d10d1d`: รายการ public range 12–15/10 ยังมี **Booking 553**, N2-1, สถานะ `Booked`, เช่า 06–13/10/2026 และไม่มี `cancelledAt`; จึงทับวันที่ 12/10 จริง. Booking 539 ที่ยกเลิกไม่ใช่ตัวกันคิวนี้. ห้ามปล่อย N2-1 หรือแก้สถานะ Booking 553 โดยไม่มีการยืนยันยกเลิก/เปลี่ยนเครื่อง เพราะจะสร้าง double booking. ไม่มี application code หรือ production data ที่แก้ในรอบตรวจนี้.

## 2026-10-05 — เงินคืนโอน, ยกเลิก/Finance และ Flex รีวิวก่อนคืน (`delivery-app` `1d10d1d`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/bookingService.ts`, `financeService.ts`, `rentalChangeFlex.ts`, `reminderFlex.ts`, `reminderRunner.ts`, `reminderScheduleService.ts`, tests `testCancellationAndReview.ts`, `testSheetWriteRace.ts`, `backend/package.json` และ `frontend/src/screens/BookingLogScreen.tsx`; handover นี้ใน `ajconsole`. ไม่แก้ application code ใน `ajconsole`/`aj-line-oa-bot`, ไม่แตะ `aj-cm`, ไม่ย้าย LINE webhook และไม่มี secret ใหม่.
- **Booking/extension:** Booking ใหม่ตั้ง `คืนเงินโอน` เท่ากับค่าประกันที่คิดจริงจาก Bundle/VIP/no-contract และเติมหลังสูตร Sheet คำนวณเสร็จถ้าตอนสร้างยังไม่รู้ยอด. ทางเช่าต่อเดิมเขียนยอดคงเหลือเฉพาะ `settlementMethod=deposit`; ชำระปกติไม่เปลี่ยนยอดคืน.
- **Cancellation:** Flex แสดงวันที่และเวลาที่ยกเลิกจาก `Cancelled At` ตามเวลา Bangkok ทั้งไทย/อังกฤษ. แถว Booking Log ที่ยกเลิกลงพื้นหลังแดงตลอด A:CZ. Finance เลิกกำหนดยอดยกเลิก 200 ตายตัว; คอลัมน์ H/N เท่ากับ `ชำระแล้ว` ของ Booking และแถว Finance เป็นสีแดง. การยกเลิกใหม่ sync Finance ก่อนส่ง Flex. เปิด Booking Log หลัง deploy จะซ่อมแถวเก่าอย่าง Booking 539 พร้อมสีและยอด Finance โดยไม่ลบประวัติ.
- **Device picker:** ข้าม Booking ที่มี `Cancelled At` แม้ Status cache ค้าง และคำนวณสถานะเครื่องจากวันที่เริ่มที่เลือกได้ทันทีแม้ยังไม่ได้เลือกวันคืนใหม่ จึงไม่แสดง `Rented` จาก Inventory วันนี้กับคิวอนาคตที่ถูกยกเลิก; การตรวจช่วงวันเต็มตอน Save ยังอยู่.
- **Review Flex:** Reminder Log kind `return:review_noon` ส่งครั้งเดียวในช่วง 12:00–12:59 Bangkok ของวันก่อนคืน หลังมีสถานะส่งการ์ด `return:day_before` สำเร็จในรอบก่อนหน้าเท่านั้น. ใช้ยอด `คืนเงินโอน` ปัจจุบัน (+100), เลือกภาษาจากตัวอักษรในชื่อลูกค้า, ปุ่ม Facebook Reviews/Google Reviews มีภาพโลโก้และลิงก์ตรงตาม owner. หากการ์ดเตือนหลักเพิ่งส่งตอนเที่ยง รอบนั้นจะไม่ส่งการ์ดรีวิวพร้อมกัน.
- **Validation/deploy:** push Delivery App `main` ที่ `1d10d1d` แล้ว และ `/api/version` บน Render ตอบ commit `1d10d1d` พร้อม `/health` ปกติ. backend TypeScript build, frontend TypeScript, booking-form check, Expo web export, cancellation/review test, sheet-write-race, rental-change, extension-deposit, reminder-followup/dedupe/language และ bundle-partner ผ่าน. Cloud นี้ไม่มี Google Sheets/LINE credential ที่ app ใช้ จึงยังตรวจหรือแก้ live Booking 539 และ push LINE จริงไม่ได้; โลโก้ URL ถูก proxy ของ cloud ปฏิเสธ 403 จึงยังไม่ยืนยันการโหลดภาพจากเครือข่ายนี้. เปิด Booking Log เพื่อ backfill และตรวจแถว 539 ใน Finance/Inventory picker. ต้องให้ `REMINDERS_ENABLED=true` ตาม scheduler ที่มีอยู่เพื่อส่งรีวิวจริง.

## Request — 2026-10-05 — Codex → Claude Code: เงินคืนโอน, ยกเลิก/ปล่อยคิว และ Flex รีวิวก่อนคืน

- **Deposit refund source of truth:** Booking ใหม่ทุกช่องทางต้องตั้ง `คืนเงินโอน / Return transfer refund` จากยอดค่าประกันจริง; ถ้าเช่าต่อโดยหักค่าประกันให้ลบยอดเช่าต่อและบันทึกยอดคงเหลือใหม่ แต่การเช่าต่อที่ลูกค้าชำระปกติห้ามลดช่องนี้.
- **Cancellation:** เก็บ Booking เป็น `Cancelled`, เพิ่มเวลาในข้อมูลวันที่ยกเลิกของ Flex ทั้งไทย/อังกฤษ, ทำแถว Booking ใน Google Sheet เป็นสีแดง, ปรับ Finance Sheet คอลัมน์ H/N ให้เหลือรายรับที่ลูกค้าโอนจริง และปล่อยสถานะเครื่อง/Bundle ให้เลือกเช่าใหม่ได้ทันที (เคสยืนยัน: Booking 539, N2-1).
- **Review reminder:** เพิ่ม Flex รีวิวแยกจากการ์ด `พรุ่งนี้มีคิวคืนเครื่อง` ส่งช่วงเที่ยงของวันก่อนคืนและส่งได้ต่อเมื่อการ์ดเตือนคืนถูกส่งก่อนแล้ว; เลือกภาษาโดยตัวอักษรในชื่อลูกค้า, แสดงเงินคืนใหม่เท่ากับยอดค่าประกันคงเหลือ + 100 เทียบกับยอดเดิม และมีปุ่มโลโก้ Facebook Reviews / Google Reviews ตามลิงก์ที่ owner ระบุ.
- **Planned scope:** แก้ source of truth ใน `delivery-app` พร้อม regression tests และบันทึกผลใน handover นี้; ไม่แตะ `aj-cm`, ไม่ย้าย LINE webhook และไม่เพิ่ม secret.

## 2026-10-05 — เก็บ Booking ที่ยกเลิก, แสดง Cancelled และปล่อยคิว (`delivery-app` `85d6072`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/rentalChangeService.ts`, `bookingService.ts`, `bundlePartnerService.ts`, `repositories/pgBookingRepo.ts`, regression scripts `testRentalChange.ts`, `testMyRentalLink.ts`, `testBundlePartner.ts` และ `frontend/src/screens/BookingLogScreen.tsx`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ application code ใน `ajconsole`/`aj-line-oa-bot`, ไม่แตะ `aj-cm`, ไม่เปลี่ยน LINE webhook และไม่มี secret ใหม่.
- **Decision/data policy:** ไม่ลบ Booking ที่ลูกค้ายกเลิก เพราะต้องเก็บ audit, สัญญาและยอดชำระเดิม. การยกเลิกเขียนทั้ง `Cancelled At` และ `Status = Cancelled`; Flex ยืนยันจะยังส่งหลัง write สำเร็จเหมือนเดิม.
- **แก้รายการเก่าอย่าง Booking 539:** ถ้าแถวมี `Cancelled At` แต่สูตร Status ยังเป็น `Booked`, Delivery App อ่านเป็น `Cancelled` ทันทีและซ่อม Status ใน Sheet แบบ idempotent เมื่อเปิด Booking Log. จึงแก้ทั้งการแสดงผลและ consumer เก่าที่อ่านเฉพาะ Status โดยไม่ต้องลบแถว.
- **ปล่อยคิวครบ:** delivery/return task, availability/extras/extension ใช้ cancellation timestamp เดิม; Postgres task queries เพิ่มเงื่อนไข `cancelled_at IS NULL`; Bundle partner mirror ทั้ง timestamp และ Status จึงปล่อยเครื่องเสริมพร้อมเครื่องหลัก.
- **หน้า Booking Log:** การ์ดถูกยกเลิกแสดง `Cancelled / ยกเลิก` สีแดง, ซ่อนคำเตือนยอดไม่ตรงและปุ่มลูกค้า/ชำระเงิน/ส่ง Booking Confirm แล้วแสดงว่าเก็บไว้เป็นประวัติและไม่ใช้คิวเครื่อง. ปุ่มดูรายละเอียด/งาน admin ยังคงอยู่.
- **ทดสอบแล้ว:** backend TypeScript build; rental change; My Rental link `110/110`; Bundle partner `22/22`; extension queue `11/11`; game extras `16/16`; return check `8/8`; frontend TypeScript, booking-form check และ Expo web export ผ่าน; `git diff --check` ผ่าน. `db:test-booking-repos` ไม่ได้รัน integration จริงเพราะ cloud ไม่มี `DATABASE_URL`; TypeScript ของ repository ผ่าน build.
- **Deploy/repair:** push backend + web/OTA staff app แล้วเปิด/รีเฟรช Booking Log หนึ่งครั้งเพื่อให้ legacy repair แก้ Booking 539 และรายการเก่าที่มี `Cancelled At` แต่ Status ค้าง. หลังนั้น availability upstream ที่อ่าน Status จะเห็น `Cancelled` ด้วย.

## Request — 2026-10-05 — Codex → Claude Code: ลูกค้ายกเลิกแล้ว Delivery App ต้องเก็บประวัติและปล่อยคิว

- **Owner evidence:** Booking `539` ส่ง Flex `ยกเลิกการเช่าสำเร็จ` ให้ลูกค้าแล้ว แต่หน้า Booking Log ยังแสดง `Status: Booked` จึงดูเหมือนไม่มีการเปลี่ยนแปลงและเสี่ยงทำให้คิวเครื่อง `N2-1` ยังถูกนับว่าไม่ว่าง.
- **Decision:** ห้ามลบ Booking; เก็บแถวไว้เป็น audit/payment/contract history และแสดงสถานะ `Cancelled / ยกเลิก`. การยกเลิกต้องบันทึก timestamp เดิมและตัดทั้ง Booking หลัก/แถว Bundle ออกจาก availability, delivery/return queue, extension และ active-rental views ทันที.
- **Planned scope:** ตรวจ customer-cancel write, Booking Log status projection, Sheets/Postgres queue filters และ Bundle propagation ใน `delivery-app`; เพิ่ม regression tests สำหรับรายการเก่าและใหม่. ไม่แตะ `aj-cm`, ไม่ย้าย LINE webhook และไม่เพิ่ม secret.

## 2026-10-05 — เช่าไอดีผ่าน LIFF ส่งข้อความเข้าแชทร้านอัตโนมัติ (`d3f06e0`)

- **แจ้ง Claude — สิ่งที่แก้:** `ajconsole/ajgameid/index.html`, หน้า Switch ที่ generate คือ `ajgameid/switch/index.html`, `tests/ajgameid-liff-booking.test.mjs` และไฟล์สถานะนี้. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ application code ใน `aj-line-oa-bot`/`delivery-app`, ไม่แตะ `aj-cm`, ไม่เปลี่ยน LINE webhook และไม่เพิ่ม secret ใน repo.
- **พฤติกรรมใหม่:** เมื่อคำขอเช่า/จองไอดีมี verified LINE identity และ Bot ตอบกลับว่าส่ง Flex สำเร็จ หน้า LIFF จะเรียก `liff.sendMessages()` ส่งข้อความสั้นในนามลูกค้าเข้าแชทร้านทันที พร้อมชื่อเกมและ ID. ข้อความตามภาษาหน้า (`ติดต่อแอดมิน — ส่งคำขอเช่าไอดีเกมแล้ว…` / `Contact admin — ID rental request sent…`) ทำให้ห้องแชทปรากฏใน LINE OA Manager โดยลูกค้าไม่ต้องพิมพ์หรือส่ง sticker เอง.
- **เงื่อนไขความปลอดภัย:** ส่ง inbound message เฉพาะใน LINE client หลัง profile/token ผ่าน LIFF และ server ยืนยันทั้ง `lineLinked` + `flexSent`; browser ภายนอกยังใช้ copy/เปิด LINE fallback เดิม. Flex ถูกส่งก่อน จึงเข้ากฎ greeting suppression ของ Bot และไม่ปลุก chatbot ซ้ำ.
- **ทดสอบแล้ว:** generate หน้า Switch ใหม่; `node --test tests/*.test.mjs` ผ่าน `274/274`; inline JavaScript syntax ผ่านทั้ง PS5/Switch; static HTTP smoke test ตอบ `200`; `git diff --check` ผ่าน.
- **LINE test runtime:** cloud runtime ปัจจุบันไม่มี `LINE_CHANNEL_ACCESS_TOKEN`/`LINE_TEST_USER_ID` จึงยัง push ทดสอบจริงไม่ได้โดยไม่ขอหรือฝัง secret. บันทึก cloud environment draft ให้รับสองค่านี้อย่างปลอดภัยและเปิด egress เฉพาะ `api.line.me`; หลัง owner review/save/publish environment ให้ส่ง Messaging API test ได้. การพิสูจน์ scope `chat_message.write` จริงยังต้องให้ recipient เปิด LIFF ในแอป LINE แล้วกดเช่า เพราะ server push ไม่สามารถปลอม inbound message ของผู้ใช้ได้.

## Request — 2026-10-05 — Codex → Claude Code: เช่าไอดีเกมผ่าน LIFF ต้องทำให้แชทร้านเด้ง และส่ง LINE test

- **Owner request:** หลังเปิด LIFF scope `chat_message.write` แล้ว ให้ทดสอบส่งไปยัง LINE test recipient ที่ owner ระบุ และรายงานผลจริง.
- **ID rental flow:** เมื่อลูกค้ากด `เช่าเลย / Rent now` จากหน้าเช่าไอดีเกมโดยมี LINE Unique ID ผูกอยู่แล้ว หลังระบบส่ง Flex สำเร็จต้องใช้ LIFF ส่ง inbound confirmation อัตโนมัติเหมือน booking เครื่อง เพื่อให้ห้องแชทแสดงใน LINE OA Manager โดยลูกค้าไม่ต้องพิมพ์ `ติดต่อแอดมิน` หรือส่ง sticker เอง.
- **Language/safety:** ข้อความต้องมีไทย/อังกฤษตามภาษาหน้า, ทำงานเฉพาะใน LINE client ที่มี verified LIFF profile, ไม่เปิดเผย LINE ID, ไม่เปลี่ยน webhook ของ Bot และไม่แตะ `aj-cm`.
- **Planned scope:** ตรวจ `ajconsole/ajgameid` และ Bot ID-rental endpoint/test sender; reuse sender เดิมและเพิ่ม regression tests โดยไม่เพิ่ม secret.

## 2026-10-05 — Console Pending คำนวณยอดก่อนส่งใหม่ และ Flex แสดง Grand total/ชำระแล้วครบ (Delivery App `517b6fc`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/consolePendingQuote.ts`, `consolePendingService.ts`, `bookingConfirmFlex.ts`, `scripts/testConsolePendingReservation.ts`, `testConfirmTotals.ts` และ `frontend/src/components/ConsolePendingModal.tsx`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ `aj-line-oa-bot`/website application code, ไม่ได้แตะ `aj-cm`, ไม่เปลี่ยน LINE webhook และไม่มี secret ใหม่.
- **Root cause:** Console Pending ขอ quote ล่าสุดตอนเปิดจริง แต่เดิมตั้งใจไม่แทนช่อง `ยอดโอนก่อนส่ง` ครั้งแรก จึงค้างยอดจาก Email เก่า; backend ยังเชื่อยอด override นั้นเมื่อวันที่/Bundle ไม่เปลี่ยน. Flex จึงพบยอดไม่ reconcile และซ่อนแถว Total แม้ paid-booking flow แบบ `force` ยังส่งการ์ดออก.
- **แก้ยอดก่อนส่ง:** เมื่อรายการมีราคาจาก catalogue ได้ หน้า Console Pending จะเติมและล็อกยอดอัตโนมัติเป็น `grand total ล่าสุด − ชำระแล้ว − ค่าจอง`; กด Confirm จะ quote ซ้ำทันที และ backend คำนวณซ้ำอีกชั้นก่อนเขียน Booking ไม่เชื่อยอดเก่าจาก Email. รายการเก่าที่ระบบตีราคาไม่ได้เท่านั้นยังกรอกยอดเองได้.
- **Regression Booking 554:** ค่าเช่าโปร `999` + ค่าประกัน `2,000` + ค่าส่งสุทธิ `246` = Grand total `3,245`; ชำระแล้ว `200`; Booking เขียน `ยอดโอนก่อนส่ง 3,045` แม้ payload เดิมส่ง `3,088`. ส่วนลดค่าส่ง `100` ยังคงถูกบันทึกและแสดงแยกจากค่าส่งเต็ม `346`.
- **Flex ไทย/อังกฤษ:** แสดง `ยอดรวมทั้งหมด / Grand total` ทุกครั้งที่คำนวณยอดได้ แล้วตามด้วย `ชำระแล้ว / Already paid`, ค่าจอง (ถ้ามี) และ `ยอดชำระก่อนส่ง / Due on delivery`. กรณีจ่ายครบก็ใช้ชื่อ `ชำระแล้ว / Already paid` เหมือนกัน ไม่ใช้ข้อความคนละแบบ.
- **ทดสอบแล้ว:** backend build; Console Pending reservation/quote `73/73`; confirmation totals `30/30`; overrides `27/27`; confirmation extras `8/8`; delivery card `55/55`; bundle partner `22/22`; booking language `15/15`; paid-booking LINE ผ่าน. Frontend TypeScript, booking-form check และ Expo web export ผ่าน; `git diff --check` ผ่าน.
- **Deploy:** push `delivery-app/main` commit `517b6fc` แล้ว; ต้อง deploy backend และ web/OTA staff app ตามขั้นตอนเดิม.

## Request — 2026-10-05 — Codex → Claude Code: ยอดก่อนส่งต้องตาม quote ล่าสุด และ Flex ต้องแสดงยอดรวม/ชำระแล้ว

- **Owner evidence:** Email เดิมแสดงยอดรวม `3,288` จากค่าส่งไป-กลับ `389` และส่วนลดค่าส่ง `100`; ก่อน Confirm ใน Delivery App quote ล่าสุดลดค่าส่งเป็น `346` จึงมียอดรวม `3,245`, ลูกค้าชำระแล้ว `200` และยอดคงเหลือที่ถูกต้อง `3,045`. แต่ช่อง `ยอดโอนก่อนส่ง` ยังค้าง `3,088` จาก Email เดิม ทำให้ Booking/Flex ส่งยอดผิด.
- **Owner request:** เมื่อ staff ปรับค่าส่ง/ส่วนลดหรือ quote เปลี่ยน ต้องคำนวณ `ยอดโอนก่อนส่ง / Due on delivery` ใหม่จากยอดรวมล่าสุดลบยอดชำระแล้ว ไม่ใช้ยอดจาก Email ที่ stale; ข้อมูล Booking และ Flex ที่ส่งทันทีต้องใช้ชุดยอดเดียวกัน.
- **Flex card:** การ์ดยืนยันไทย/อังกฤษต้องแสดง `ยอดรวมทั้งหมด / Grand total`, `ชำระแล้ว / Already paid` และยอดคงเหลืออย่างชัดเจน แม้ชำระแล้วบางส่วน; ห้ามละแถว Grand total เหมือนหลักฐาน Booking 554.
- **Planned scope:** ตรวจ Console Pending quote/confirm, Booking fields และ confirmation Flex ใน `delivery-app`; แก้ source of truth พร้อม regression tests. ไม่แตะ `aj-cm`, ไม่เปลี่ยน LINE webhook และไม่เพิ่ม secret.

## 2026-10-05 — Maps กดเปิดได้ + My Rental เชื่อถือ LINE ของ Booking + เปิดแชทร้านอัตโนมัติ + Legal Name ตามภาษา

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app` commit `94d666e` แก้ `backend/src/services/lineIdentityService.ts`, `backend/src/scripts/testTestBinding.ts`, `frontend/src/components/ConsolePendingModal.tsx`; `ajconsole` แก้ `index.html`, `tests/agreement-error-recovery.test.mjs`, `tests/line-launch-guide.test.mjs` และไฟล์สถานะนี้. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ application code ใน `aj-line-oa-bot`, ไม่ได้แตะ `aj-cm`, ไม่เปลี่ยน LINE webhook และไม่มี secret ใหม่.
- **Console Pending Maps:** ลิงก์สถานที่ส่งและรับคืนเป็นลิงก์สีน้ำเงินกดเปิดได้ ตรวจเฉพาะ `http/https` และแจ้งข้อผิดพลาดไทย/อังกฤษเมื่อ URL ใช้ไม่ได้.
- **My Rental ที่ผูก LINE แล้ว:** `resolveBoundCustomer()` ใช้ LINE Unique ID ที่ LIFF ส่งมาเทียบตรงกับ `Booking.lineUserId`; ถ้าตรง เปิดคิวเช่าได้ทันทีโดยไม่ถามเบอร์/เลขท้ายเอกสารซ้ำ แม้ Customers row ยังไม่มี LINE ID. ถ้า Customers row ผูก LINE ID อื่นอยู่ ระบบปฏิเสธเพื่อไม่ให้ Booking เก่าข้ามเจ้าของบัญชีปัจจุบัน และไม่มีการเขียนทับ binding.
- **ร้านเห็นห้องแชททันที:** หลัง server ยืนยันว่า Flex ถูกส่งแล้ว LIFF เรียก `liff.sendMessages()` ส่งข้อความยืนยันสั้น ๆ ในนามลูกค้าอัตโนมัติ (ไทย/อังกฤษ). นี่สร้าง inbound LINE event ที่ LINE OA Manager ต้องใช้เพื่อแสดงห้องแชท โดยลูกค้าไม่ต้องพิมพ์หรือส่ง sticker เอง. Flow บังคับให้เปิดในแอป LINE; ถ้าส่งข้อความนี้ไม่ได้จะแจ้ง fallback สองภาษาโดยไม่อ้างว่าการ์ดล้มเหลว.
- **ข้อกำหนด deploy ของ LINE:** LIFF app ที่ใช้ `CONFIG.lineLiffId` ต้องมี scope `chat_message.write`; ถ้ายังไม่ได้เปิด ให้ owner เปิดใน LINE Developers. ไม่ต้องเปลี่ยน webhook และ webhook ยังคงเป็นของ Bot.
- **Legal Name ตามภาษาหน้า:** หน้าไทยรับเฉพาะอักษรไทยและช่องว่าง; หน้าอังกฤษรับเฉพาะ `A-Z/a-z` และช่องว่าง พร้อม hint/validation สองภาษา. กฎนี้ใช้เฉพาะชื่อจริงลูกค้า ไม่กระทบชื่อบัญชีธนาคารเดิมที่รองรับ punctuation.
- **ทดสอบแล้ว:** `delivery-app/backend` — `npm run build`, `test:test-binding` (17/17), `test:booking-recipient` (5/5), `test:paid-booking-line`, `test:my-rental-link` (110/110); `delivery-app/frontend` — `npx tsc --noEmit`, Expo web export; `ajconsole` — inline-script syntax และ `node --test tests/*.test.mjs` (273/273). `git diff --check` ผ่านทั้งสอง repo.

## Request — 2026-10-05 — Codex → Claude Code: Maps link, trusted LINE My Rental, chat visibility และ Legal Name ตามภาษา

- **Owner request — Delivery App:** ใน Console Pending ให้ Google Maps URL กดเปิดแผนที่ได้ ไม่ใช่ข้อความล้วน.
- **Owner request — LINE/My Rental:** ถ้า Booking ผูก LINE Unique ID ของลูกค้าคนนั้นในระบบแล้ว ปุ่ม `คิวเช่าของฉัน / My rental` จาก Flex/reminder ต้องเปิดรายการได้ทันทีโดยไม่ถามเบอร์โทรและเลขท้ายเอกสารซ้ำ; ต้องไม่ทำให้ผู้เปิดผิดบัญชีข้ามการยืนยันได้ และข้อความลูกค้าต้องครบไทย/อังกฤษ.
- **Owner request — chat visibility:** หลังลูกค้าส่งรายการผ่าน LINE/LIFF และได้รับ Flex แล้ว ร้านต้องเห็นบทสนทนาในรายการแชทโดยไม่ต้องโทรขอให้ลูกค้าพิมพ์หรือส่งสติกเกอร์ก่อน. ตรวจข้อจำกัด LINE OA และใช้ flow ที่รองรับอย่างเป็นทางการ; ไม่ย้าย webhook ออกจาก Bot และไม่แตะ `aj-cm`.
- **Owner request — website identity:** หน้าไทยช่อง `ชื่อ-นามสกุลจริง` รับเฉพาะตัวอักษรไทยและตัวคั่นชื่อที่ถูกต้อง; หน้าอังกฤษ `LEGAL NAME` รับเฉพาะตัวอักษรอังกฤษ พร้อม validation/คำเตือนตรงภาษา.
- **Planned scope:** ตรวจ `delivery-app`, `aj-line-oa-bot` และ `ajconsole` ตั้งแต่การสร้างลิงก์/LINE binding/Flex action/LIFF send ไปจนถึง form validation; reuse source of truth เดิม, เพิ่ม regression tests และไม่เพิ่ม secret.

## 2026-10-04 — Bundle/อุปกรณ์เสริมจากเว็บลง Booking และเลือกกลับใน Edit (Delivery App `9117f05`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/bookingExtrasCatalog.ts`, `consolePendingService.ts`, `consolePendingQuote.ts`, `scripts/testBundleFromPayment.ts`, `testConsolePendingReservation.ts` และ `frontend/src/screens/BookingLogScreen.tsx`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- Console Pending เก็บ `accessoryIds` ที่หน้าเว็บส่งมาทั้งจาก request ปกติและ request ที่สร้างจาก payment แล้วเขียนลง Booking พร้อม `accessoryNames` และ `extrasFee`; Bundle ยังคงเขียน `bundleId`/ชื่อ/ราคา/ค่าประกันและสร้างแถวเครื่องคู่ตาม flow เดิม.
- ตัวแก้ไข Booking รอให้ catalogue โหลดก่อนจึงตรวจค่า ทำให้ค่า Bundle/อุปกรณ์เสริมไม่ถูกล้างระหว่างเปิด Popup และ radio/checkbox เดิมถูกเลือกอัตโนมัติ.
- รองรับข้อมูลเก่าที่ไม่มี ID โดย map ชื่ออุปกรณ์และ Bundle กลับเข้ารายการจากทั้งชื่อไทยและอังกฤษ; รองรับ website alias `joy` ของ Nintendo Switch ให้ตรงกับ `joy2` ใน Delivery App. ถ้าพนักงานกดบันทึกรายการเก่า ID ที่กู้กลับมาจะถูกเก็บตามปกติ.
- **Tests:** backend `npm run build`; Bundle/payment 20/20; Console Pending reservation 69/69; overrides 27/27; web discounts 17/17; confirmation extras 8/8; bundle partner 22/22; payment pending 35/35; game extras 16/16. Frontend `npx tsc --noEmit`, booking-form check และ Expo web export ผ่าน (ใช้ Expo home ชั่วคราวใน `/tmp` ตามข้อจำกัด cloud; ไม่แก้ config). `ajconsole` tests ผ่าน 272/272 สำหรับการตรวจ handover log.
- **Deploy:** push Delivery App `main` แล้ว; ต้อง deploy backend commit `9117f05` และทำ web build/OTA ของ staff app ตามขั้นตอนเดิม. ไม่มี env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: ส่ง Bundle/อุปกรณ์เสริมจากเว็บลง Booking และติ๊กกลับใน Edit

- **Owner request:** ถ้าคำขอเช่าจากหน้าเว็บมี Bundle หรืออุปกรณ์เสริม ต้องบันทึกรายการนั้นลง Delivery App Booking และเมื่อเปิด Edit Booking ต้องเลือก radio/checkbox เดิมไว้แล้ว ไม่กลับเป็น `ไม่เพิ่ม Bundle` หรือ `ไม่เพิ่มอุปกรณ์เสริม`.
- **Language/data:** รองรับทั้ง request ภาษาไทยและอังกฤษ รวมทั้ง request ที่ส่ง id และ request เก่าที่มีเฉพาะชื่อ; ต้อง map กลับเข้า catalogue id เดิมเพื่อให้ราคา, รายการ และสถานะติ๊กตรงกัน.
- **Planned scope:** ตรวจและแก้ Website request → Console Pending → Confirm Booking → Edit Booking ใน Delivery App พร้อม regression tests; ไม่เปลี่ยนเจ้าของ catalogue, ไม่แตะ Bot/website application code หรือ `aj-cm` เว้นแต่ contract เดิมไม่มีข้อมูลที่จำเป็น.

## 2026-10-04 — รวม Bundle ใน My Rental และ Extension ให้ยอดตรงกัน (Delivery App `e979f20`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/routes/myRental.ts`, `routes/customerExtension.ts`, `services/rentalExtensionService.ts`, `extensionPendingService.ts`, `rentalExtensionPaymentService.ts`, `scripts/testExtensionPricing.ts` และ `testMyRentalLink.ts`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- My Rental ตรวจคู่ Bundle จาก Booking หลักและแถวถัดไปที่อ้างเลขหลักตรงกัน แล้วรวมข้อมูลเป็นหนึ่งรายการลูกค้า: เครื่อง `PS5-2 + G29`, Booking `545 + 546` และ Rental ID `AJ-... + Booking Bundle #546` (อังกฤษใช้ `Bundle Booking #546`).
- กรณี parent row เก่าอย่าง `545` ขาด `bundleId`, `extrasFee` หรือ `extrasDeposit` แต่แถว `546` ยังยืนยัน Bundle ระบบสร้างเฉพาะ customer-view fields ที่ขาดจาก catalogue เดิม; ยอดที่บันทึกไว้เดิมมีสิทธิ์ก่อนเสมอ จึงไม่ reprice ประวัติและไม่เขียนทับ Booking.
- Regression กรณีจริง 545/546: ค่าเช่า PS5 3 วัน `1,200` + Bundle `450` = ค่าเช่ารวม `1,650`; ค่าประกัน Bundle `3,000`; ค่าส่ง `321`; ชำระแล้ว `-200`; ยอดก่อนส่ง `4,771` ทั้งไทยและอังกฤษ.
- หน้า Extension แสดง `PS5 + Logitech G29`, อ้าง `Booking Bundle #546`, ใช้ Rental ID พร้อม reference และคำนวณจาก pair rate `550/วัน, 3,500/สัปดาห์`; ต่อ 1 วันหลังเช่าเดิม 3 วัน = `550 - 55 (10%) = 495` บาท. Extension Pending และ Flex Card ใช้ชื่อ/reference เดียวกัน.
- กฎนี้ไม่ผูกเลข 545/546 และใช้กับ Bundle Booking ในอนาคตทุกคู่ที่ผ่าน relation check; อุปกรณ์เสริมยังรวมตามกฎใน `ebda1a1`.
- **Tests:** backend build ผ่าน; extension-pricing 60/60, extension-queue 11/11, extension-deposit/Flex 15/15, bundle-partner 22/22, confirm-totals 24/24, master-agreement 104/104, My Rental link 110/110, booking-language 15/15 และ paid-booking LINE ผ่าน. คำเตือน Sheets ใน My Rental test มาจาก mock ที่ไม่มี `batchUpdate` และเป็น non-fatal ตามที่ test ตั้งใจ.
- **Deploy:** push Delivery App `main` แล้ว; deploy backend commit `e979f20`. ไม่มี migration, env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: My Rental และ Extension ต้องรวมข้อมูล Bundle จริง

- **Owner evidence:** My Rental ของ Booking `545` แสดงเพียง `PS5-2`, ค่าเช่า `1,200` และค่าประกัน `2,000` แต่ยอดก่อนส่ง `4,771` รวม Bundle แล้ว จึงมีรายละเอียดหาย `1,450` บาท (ค่าเช่า Bundle เพิ่ม 450 + ค่าประกันเพิ่ม 1,000). หน้า Extension จึงตามไปแสดง PS5 `400/2,500` และยอดต่อ 360 ผิด.
- **Bundle reference:** Booking `546` เป็นแถว G29 ของ Bundle ที่อ้าง Booking หลัก `545`. ต้องรวมชื่อเครื่อง, Booking reference, Rental ID display, ค่าเช่ารวม, ค่าประกันรวม และ quote เช่าต่อจากคู่ Booking เดียวกัน.
- **Future rule:** ใช้กฎเดียวกันกับ Bundle Booking ในอนาคต โดยตรวจแถว Bundle ที่สัมพันธ์กับ Booking หลัก ไม่ผูกกับเลข 545/546; หน้า My Rental, Extension, Extension Pending และ Flex Card ต้องตรงกันทั้งไทย/อังกฤษ.
- **Planned scope:** แก้ source of truth ใน Delivery App และ regression tests โดยอ่าน Booking fields/catalogue เดิม; ไม่แตะ Bot, website application code หรือ `aj-cm` เว้นแต่ contract เดิมมีข้อมูลไม่พอ.

## 2026-10-04 — เช่าต่อตรวจ Bundle แถวถัดไปและรวมอุปกรณ์เสริม (Delivery App `ebda1a1`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/rentalExtensionService.ts`, `extensionPendingService.ts`, `rentalExtensionPaymentService.ts`, `routes/customerExtension.ts` และ `scripts/testExtensionPricing.ts`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- รายการหลักจะเป็น Bundle เฉพาะเมื่อ Booking **แถวถัดไปทันที** มี `bundleParentId` ตรงกับเลข Booking หลัก ซึ่งเป็นข้อมูลเดียวกับที่หน้า Booking ใช้แสดง `📦 Bundle ของ #545 · ยอดเงินทั้งหมดอยู่ที่ #545`; ไม่ resolve จากแถวลูกย้อนกลับไปหาแถวหลักอีก. แถวไม่ติดกัน, เลขไม่ตรง, ถูกยกเลิก หรือไม่มีข้อความสัมพันธ์นี้ จะคิดเป็นเครื่องเดี่ยว.
- เมื่อยืนยันเช่าต่อ Bundle ระบบอัปเดตวันคืนทั้ง Booking หลักและแถวอุปกรณ์ Bundle; retry จะตามอัปเดตแถวอุปกรณ์ให้ครบหากการเขียนครั้งแรกสะดุด.
- ราคาเช่าต่อใช้เรตเครื่องหลัก แล้วแทนด้วย pair rate เมื่อ Bundle ผ่านการตรวจ และบวกเรตรายวัน/สัปดาห์ของอุปกรณ์เสริมที่เลือกไว้ใน `accessoryIds`/`accessoryNames`. รองรับ PS5, PS5 Pro, Nintendo Switch 1/2, Viture Beast และ Viture Pro 2 จาก catalogue เดิม. อุปกรณ์แบบเหมาจ่ายครั้งเดียว เช่น Viture Mobile Dock แสดงในรายการแต่ไม่ถูกเรียกเก็บซ้ำ.
- ส่วนลดลูกค้าเก่า 10% คิดต่อจากยอดรวมเครื่อง + Bundle + อุปกรณ์เสริม. ตัวอย่าง PS5 Bundle 550 + จอยเพิ่ม 120 = 670 บาท ก่อนลด, 603 บาทหลังลด. กฎ VIP เดิมยังคงใช้ VIP rate แทนส่วนลด 10%.
- หน้าลูกค้าและ Flex Card เลือกชื่ออุปกรณ์ไทย/อังกฤษตามภาษาคำขอ ไม่เอาชื่อไทยไปปนหน้าอังกฤษ; Extension Pending ใช้รายการและยอดจาก source เดียวกัน.
- งานนี้ **แทนที่พฤติกรรมใน `60d3395`** ตามคำแก้ของ owner; ไม่มี migration, env var หรือ secret ใหม่.
- **Tests:** backend build ผ่าน; extension-pricing 51/51, extension-queue 11/11, extension-deposit/Flex 15/15, bundle-partner 22/22, console-pending-reservation 67/67, vip-charges 38/38, booking-language 15/15 และ paid-booking LINE ผ่าน.
- **Deploy:** push Delivery App `main` แล้ว; deploy backend commit `ebda1a1`.

## Request — 2026-10-04 — Codex → Claude Code: เช่าต่อต้องตรวจแถว Bundle และรวมอุปกรณ์เสริม

- **Owner correction:** ห้ามตัดสิน Bundle จากการย้อน `bundleParentId` อย่างเดียว. ต้องตรวจ Booking ถัดไปว่ามีข้อความ `📦 Bundle ของ #<เลขหลัก> · ยอดเงินทั้งหมดอยู่ที่ #<เลขหลัก>` และเลขทั้งสองจุดตรงกับ Booking หลัก จึงรวมเป็น Bundle.
- **Pricing scope:** ยอดเช่าต่อต้องคิดจากราคาเครื่องปกติ รวมราคา Bundle และ/หรืออุปกรณ์เสริมที่บันทึกกับ Booking แล้วลดลูกค้าเก่า 10% สำหรับ PS5, PS5 Pro, Nintendo Switch 1, Nintendo Switch 2, Viture Beast และ Viture Pro 2 ทั้งกรณีมี/ไม่มี Bundle.
- **Surfaces:** หน้าเช่าต่อ, Extension Pending และ Flex Card ต้องใช้ quote เดียวกันและแสดงถูกต้องทั้งภาษาไทย/อังกฤษ.
- **Planned scope:** แก้ source of truth และ regression tests ใน Delivery App โดยอ่าน catalogue/ข้อมูล Booking เดิม ไม่สร้างราคาซ้ำ; ไม่แตะ Bot, website application code หรือ `aj-cm` เว้นแต่พบว่า contract เดิมมีข้อมูลไม่พอ.

## 2026-10-04 — เช่าต่อ PS5 Bundle ใช้ราคา Bundle (Delivery App `60d3395`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/rentalExtensionService.ts`, `extensionPendingService.ts` และ `testExtensionPricing.ts`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- Booking พวงจะ resolve กลับไปที่ Booking หลักที่ถือยอดเงินก่อนคำนวณ: กรณี `546` (G29) จึงใช้ `545` (PS5-2) เป็น source of truth และไม่เกิดคำขอ/ยอดซ้ำจากเครื่องลูก.
- การเช่าต่ออ่าน pair rate จาก Bundle catalogue เดิมของ Delivery App: PS5 Bundle `550 บาท/วัน` และ `3,500 บาท/สัปดาห์` แทนเรต PS5 เครื่องเดียว `400/2,500`; ยังคงลดลูกค้าเก่า 10%. ตัวอย่างต่ออีก 1 วันหลังเช่าเดิม 3 วัน = 550 − 55 = **495 บาท**.
- หน้าเช่าต่อไทย/อังกฤษ, Extension Pending และ Flex Card ใช้ extension request/quote ชุดเดียวกัน จึงแสดงยอดที่แก้แล้วตรงกัน; Extension Pending แสดงชื่อคู่เครื่อง เช่น `PS5 + Logitech G29`.
- **Tests:** backend build ผ่าน; extension-pricing 34/34, extension-queue 11/11, extension-deposit/Flex ไทย–อังกฤษ 15/15, bundle-partner 22/22, console-pending-reservation 67/67 และ vip-charges 38/38 ผ่าน.
- **Deploy:** push Delivery App `main` แล้ว; deploy backend commit `60d3395`. ไม่มี migration, env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: เช่าต่อ PS5 Bundle ต้องใช้เรต Bundle

- **Owner report:** Booking `545` (PS5-2) และ `546` (G29) เป็น Booking พวงของ PS5 Bundle เดียวกัน แต่หน้าเช่าต่อคิดเฉพาะเรต PS5 `400/วัน, 2,500/สัปดาห์` ทำให้ 1 วันหลังส่วนลดเหลือ 360 บาท.
- **Expected:** คำขอเช่าต่อของ PS5 Bundle ต้องใช้ราคาของ Bundle นั้น `550/วัน, 3,500/สัปดาห์` แล้วใช้ส่วนลดลูกค้าเก่า 10% ตามเดิม; วัน/สัปดาห์และยอดทุกหน้ากับ Flex Card ต้องตรงกันทั้งไทยและอังกฤษ.
- **Planned scope:** แก้ source of truth ใน Delivery App extension context/pricing ให้รู้จัก parent + partner Booking และอ่านราคา Bundle จาก catalogue/offer เดิม ไม่ hardcode ราคาใหม่; เพิ่ม regression tests และไม่แตะ Bot, website application code หรือ `aj-cm` เว้นแต่ contract เดิมส่งข้อมูลไม่พอ.

## 2026-10-04 — ป้ายค่าประกันก่อนหัก/หัก/คงเหลือ (Delivery App `16fb75f`)

- **แจ้ง Claude — สิ่งที่แก้:** `frontend/src/components/ExtensionPendingModal.tsx`, `backend/src/services/rentalExtensionFlex.ts` และ `backend/src/scripts/testExtensionDeposit.ts`. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- Extension Pending card และ Popup ยืนยันเรียงยอดเป็น **ค่าประกันก่อนหัก / Deposit before deduction**, **หัก / Deduct**, **ค่าประกันคงเหลือ / Deposit remaining**; เพิ่มยอดก่อนหักไว้เหนือแถวหักตามคำขอ.
- Customer Flex Card ใช้ป้ายสามรายการเดียวกันทั้งภาษาไทยและอังกฤษ โดยไม่เปลี่ยนยอดคำนวณหรือขั้นตอน settle.
- **Tests:** backend build และ extension-deposit 15/15 ผ่าน; frontend TypeScript, booking-form field check และ Expo web export ผ่าน.
- **Deploy:** push Delivery App `main` แล้ว; deploy backend และทำ web build/OTA ที่ commit `16fb75f`. ไม่มี migration, env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: ปรับป้ายยอดค่าประกันก่อนหัก/คงเหลือ

- **Owner request:** ใน Delivery App และ Flex Card ยืนยันการหักค่าเช่าต่อ ต้องเรียงและระบุยอดเป็น **ค่าประกันก่อนหัก / Deposit before deduction**, **หัก / Deduct**, และ **ค่าประกันคงเหลือ / Deposit remaining** อย่างชัดเจน.
- **Planned scope:** แก้ข้อความไทย/อังกฤษใน Extension Pending card, confirmation popup และ customer Flex Card พร้อม regression test; ไม่เปลี่ยนการคำนวณหรือ API และไม่แตะ Bot, website application code หรือ `aj-cm`.

## 2026-10-04 — Popup ยืนยันก่อนหักค่าประกันและส่ง Flex (Delivery App `0b455e0`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/frontend/src/components/ExtensionPendingModal.tsx` เท่านั้น. **ไม่มีไฟล์สร้างใหม่หรือลบ**, ไม่ได้แก้ backend/Bot/website application code และไม่ได้แตะ `aj-cm`.
- ปุ่ม **หักจากค่าประกัน / Deduct from deposit** ไม่ใช้ browser `window.confirm` หรือ native alert แล้ว; เปิด in-app modal แบบเดียวกันบน web/iOS/Android ก่อนเรียก API จริง.
- Popup แสดง Booking/ลูกค้า, จำนวนวันที่เช่าต่อ, วันคืนใหม่, ยอดที่จะหัก และค่าประกันคงเหลือ พร้อมแจ้งว่าจะอัปเดต Booking และส่ง Flex Card.
- มีปุ่ม **ยืนยันและส่ง / Confirm & Send** และ **ยกเลิก / Cancel** ชัดเจนทั้งไทยและอังกฤษ. กดยกเลิกไม่เปลี่ยนข้อมูล; API หักค่าประกันจะถูกเรียกเฉพาะเมื่อกดยืนยันและส่ง.
- **Tests:** frontend `npx tsc --noEmit`, `npm run check:booking-form` และ `EXPO_NO_TELEMETRY=1 npm run build:web` ผ่าน.
- **Deploy:** push Delivery App `main` แล้ว; ทำ web build/OTA ของ staff app ที่ commit `0b455e0`. ไม่มี migration, env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: Popup ยืนยันก่อนหักค่าประกันและส่ง Flex

- **Owner request:** เมื่อกด **หักจากค่าประกัน / Deduct from deposit** ใน Extension Pending ต้องเปิด Popup ยืนยันก่อนทำรายการ พร้อมสรุปว่าจะหักยอด อัปเดต Booking/วันคืน และส่ง Flex Card ให้ลูกค้า.
- **Buttons/language:** Popup ต้องมีปุ่ม **ยืนยันและส่ง / Confirm & Send** และ **ยกเลิก / Cancel** ที่เห็นชัดเจน พร้อมข้อความไทยและอังกฤษ.
- **Planned scope:** แก้เฉพาะ Delivery App staff UI ให้ใช้ in-app modal ที่เหมือนกันบน web/iOS/Android แทน browser/native confirm สำหรับ action นี้; backend, ราคา,ยอดค่าประกันและ LINE sender เดิมไม่เปลี่ยน. ไม่แตะ Bot, website application code หรือ `aj-cm`.

## 2026-10-04 — Booking: คิวเช่าต่อและหักค่าเช่าจากค่าประกัน (Delivery App `452ebb4`)

- **แจ้ง Claude — สิ่งที่สร้างใหม่:** `backend/src/routes/extensionPending.ts`, `backend/src/services/extensionPendingService.ts`, `backend/src/scripts/testExtensionDeposit.ts`, migration `010_extension_deposit_settlement.sql` และ `frontend/src/components/ExtensionPendingModal.tsx`.
- **แจ้ง Claude — สิ่งที่แก้:** `backend/package.json`, `rentalExtensionRepo.ts`, `routes/line.ts` (test card fixture), `server.ts`, `rentalExtensionService.ts`, `rentalExtensionPaymentService.ts`, `rentalExtensionFlex.ts`, `frontend/src/services/api.ts`, `BookingLogScreen.tsx` และ handover `docs/AJ-SYSTEM-HANDOVER-FOR-AJ-CHAT.md`. **ไม่มีไฟล์ที่ลบ**, ไม่ได้แก้ Bot/website application code และไม่ได้แตะ `aj-cm`.
- หน้า Booking มีปุ่ม **เช่าต่อ / Extension (N)** แถวเดียวกับ Console Pending และ ID Pending. Popup แสดง Booking/Rental ID, ลูกค้า, เครื่อง, จำนวนวัน, ยอดค่าเช่าต่อ, ส่วนลด, วันคืนเดิม/ใหม่ และค่าประกันก่อน/หลังหัก เป็นไทยและอังกฤษ.
- ปุ่ม **หักจากค่าประกัน / Deduct from deposit** ใช้ยอดค่าเช่าต่อหลังส่วนลด (`netAmount`, ไม่คิดค่าธรรมเนียมบัตร), เลื่อนวันคืนด้วย extension request/queue rule เดิม และเขียนค่าประกันคงเหลือเข้า Booking ช่อง `คืนเงินโอน` (`returnTransferRefund`). ครั้งถัดไปหักต่อจาก `คืนเงินโอน`; ยอด 0 หรือไม่พอจะกดไม่ได้.
- Extension request เก็บ `settlementMethod`, `depositBefore`, `depositRemaining` เพื่อให้ retry idempotent ไม่หักซ้ำ. Payment webhook กับปุ่มหักค่าประกันถูก serialize ต่อ request เพื่อกันลูกค้าโอนพร้อมกับพนักงานกด. Google Sheet `Rental Extensions` อัปเกรด header ถึง AC อัตโนมัติ และ Postgres มี migration รองรับ.
- หลังสำเร็จ Delivery App ส่ง Flex Card ด้วยภาษาเดิมของคำขอ แจ้งว่าหักจากค่าประกันแล้ว, ยอดที่หัก, ค่าประกันคงเหลือ, จำนวนวัน และวันคืนใหม่. LINE ล้มไม่ย้อน Booking/ยอดเงิน และ staff popup แจ้งให้ติดต่อเอง.
- **Tests:** backend build; extension-deposit 13/13; extension-pricing 26/26; extension-queue 11/11; auto-booking-payment, paid-booking-line, return-window 23/23, date-change 51/51 และ booking-language 15/15 ผ่าน. Frontend TypeScript, booking-form field check และ Expo web export ผ่าน. DB migration execution test ไม่ได้รันใน workspace เพราะไม่มี `DATABASE_URL`; production มี `DB_AUTO_MIGRATE` (default true) ใช้ migration ตอน deploy.
- **Deploy:** push Delivery App `main` แล้ว. Deploy backend `452ebb4` (migration 010 จะทำงานตอน boot เมื่อมี Postgres) และทำ web build/OTA ของ staff app. ไม่มี env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: คิวคำขอเช่าต่อและหักค่าเช่าจากค่าประกัน

- **Owner request:** เพิ่มปุ่ม **เช่าต่อ / Extension Pending** ในหน้า Booking แถวเดียวกับ Console Pending และ ID Pending; เปิด popup แสดงคำขอเช่าต่อของลูกค้า ได้แก่ Booking ID, จำนวนวัน, ค่าเช่าต่อ, วันคืนเดิม และวันคืนใหม่.
- **Staff action:** มีปุ่มยืนยันให้หักค่าเช่าต่อจากค่าประกันแทนการโอน เช่น ค่าเช่าต่อ 360 บาทจากค่าประกัน 2,000 บาท เหลือ 1,640 บาท; อัปเดตวันคืนและยอดคงเหลือใน Booking โดยใส่ยอดค่าประกันคงเหลือที่ช่อง **คืนเงินโอน**.
- **Customer result:** หลังสำเร็จให้ระบบเจ้าของ LINE Flex card ส่งการ์ดภาษาไทยหรืออังกฤษตามภาษาลูกค้า แจ้งว่าหักค่าเช่าจากค่าประกันแล้ว, ค่าประกันคงเหลือ, จำนวนวันที่เช่าต่อ และวันคืนใหม่.
- **Planned scope:** ใช้ extension request, pricing, booking update และ LINE sender ที่มีอยู่ใน `delivery-app`; เพิ่ม staff queue/API/action และ regression tests โดยไม่สร้างกฎราคา/การ์ดซ้ำในเว็บไซต์หรือ Bot. ตรวจ contract กับ Bot ก่อน และแก้ Bot เฉพาะเมื่อ endpoint เดิมส่งข้อมูลไม่พอ. ไม่แตะ `aj-cm`; ไม่มี secret ใหม่.

## 2026-10-04 — เวลาเช่าล่วงหน้าเป็น 10:00 ทั้งส่งและรับคืน (Delivery App `3d43d5f`)

- **แจ้ง Claude — สิ่งที่แก้:** `delivery-app/backend/src/services/deliveryTiming.ts`, `consolePendingService.ts`, `bookingService.ts`, `testDeliveryTiming.ts`, `testConsolePendingOverrides.ts` และ `frontend/src/components/ConsolePendingModal.tsx`. **ไม่มีไฟล์ที่สร้างใหม่หรือลบ**, ไม่ได้แก้ Bot และไม่ได้แตะ `aj-cm`.
- ถ้าวันเริ่มเช่าอยู่หลังจากวันนี้ตามเขตเวลา `Asia/Bangkok` ระบบถือเป็นการเช่าล่วงหน้าและบันทึก `Delivery Time = 10:00` กับ `Return Time = 10:00` เสมอ ไม่ว่าลูกค้าจะส่งคำขอเวลาใดหรือ caller จะส่งเวลาอื่นมา.
- บังคับกฎทั้งตอน Confirm จาก Console Pending และที่จุดสร้าง Booking กลาง จึงครอบคลุมการเพิ่ม Booking โดยตรงใน Delivery App และ agent action ด้วย; รายการวันเดียวกันยังคงกฎเวลาเตรียมเครื่องเดิม.
- การ์ดยืนยันอ่านข้อความจาก Booking อยู่แล้ว จึงแสดง `10:00` ทั้งวันส่งและวันคืนจาก source of truth เดียวกันโดยไม่สร้าง logic ซ้ำในตัวการ์ด. หน้า Console Pending แสดงและล็อกสองช่องเป็น `10:00` เมื่อเลือกวันในอนาคต เพื่อให้พนักงานเห็นค่าที่ server จะบันทึก.
- รองรับวันที่ `DD/MM/YYYY`, `YYYY-MM-DD` และปี พ.ศ.; ตรวจ “วันนี้” ตามเวลาไทย ไม่อิง timezone ของ server.
- **Tests:** backend `npm run build`; frontend `npx tsc --noEmit`; delivery timing 50/50; Console Pending overrides 27/27 และ reservation 67/67; delivery card 55/55; booking language 15/15; paid-booking LINE ผ่าน. คำเตือน Google credentials ใน overrides เป็น lookup เสริมที่ test ตั้งใจรันแบบ offline และไม่ทำให้ test ล้ม.
- **Deploy:** push Delivery App `main` แล้ว; ต้อง deploy backend commit `3d43d5f` และ web build/OTA ของ staff app ตามขั้นตอนเดิม. ไม่มี env var หรือ secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: เวลาเช่าล่วงหน้าต้องเป็น 10:00 ทั้งส่งและรับคืน

- **Owner request:** ถ้าวันเริ่มเช่าเป็นวันอื่นหลังจากวันนี้ ให้ถือเป็นรายการเช่าล่วงหน้า ไม่ว่าลูกค้าจะทำรายการเวลาใด และกำหนดเวลาจัดส่งกับเวลารับคืนเป็น `10:00` ทั้งคู่ทุกครั้ง.
- **Surfaces:** เวลาเดียวกันต้องปรากฏในการ์ดยืนยันที่ส่งให้ลูกค้า และถูกบันทึกใน Booking ของ Delivery App; รายการที่เริ่มเช่าวันนี้ยังใช้กฎเวลาเดิม.
- **Planned scope:** ตรวจและแก้ source of truth ใน `delivery-app` ที่สร้าง Booking/confirmation card จาก Console Pending และ Bot เฉพาะจุดที่มีการ์ดยืนยันอีกเส้นทางหนึ่งถ้าพบ; เพิ่ม regression tests ตามเขตเวลา `Asia/Bangkok`. ไม่แตะ `aj-cm` และไม่เปลี่ยนกฎราคาหรือเวลาจัดส่งของรายการวันเดียวกัน.

## 2026-10-04 — แก้รายการเดิมจากหน้าทำรายการชำระเงินต่อ (website `48724df`, Bot `ba85ead`, Delivery App `4707d33`)

- **แจ้ง Claude — สิ่งที่แก้:** `ajconsole/index.html`, `game_index.html`, handover และ tests; `aj-line-oa-bot/src/server.js`, `test/pay-later.test.js`; `delivery-app/backend/src/services/consolePendingService.ts` และ `testConsolePendingIdentity.ts`.
- **แจ้ง Claude — สิ่งที่สร้างใหม่:** Bot `src/services/payment-resume-edit.js` และ `test/payment-resume-edit.test.js`. **ไม่มีไฟล์ที่ลบ** และ **ไม่ได้แตะ `aj-cm`**.
- หน้า “ทำรายการชำระเงินต่อ / Continue to payment” ที่มาจากอีเมลมีปุ่มแก้ไข 3 ส่วน: เครื่อง/อุปกรณ์/เกมใช้ Step 1 เดิมใน Popup, ลูกค้า/ที่อยู่/Google Maps ใช้ Step 2 เดิมใน Popup และช่วงเวลาเช่าเปิดปฏิทินเดิม. ทุกข้อความใหม่มีไทยและอังกฤษ.
- ทุกการบันทึกใช้ Rental ID เดิม, เช็ค availability และ booking hold ใหม่, ขอราคาค่าส่งใหม่ แล้วเรียก private-token endpoint `POST /api/rentals/payment-page/update`; ไม่สร้างรายการเช่าใหม่. ถ้าบันทึกไม่สำเร็จ หน้าเว็บคืนค่ารายการล่าสุดแทนการค้างค่าที่ยังไม่ลง server.
- Bot allowlist เฉพาะข้อมูลรายการที่ลูกค้าแก้ได้, เก็บ identity/agreement/PDF/payment status เดิม, ล้าง unpaid Beam link ที่ใช้ยอดเก่า และเขียนทั้งแถว Console Pending เดิมกับ rental-history mirror. รายการที่ชำระแล้วแก้ไม่ได้.
- Delivery App Console Pending อ่านเครื่อง วัน ยอด ที่อยู่ Maps เกม และข้อมูลลูกค้าจาก JSON/แถวเดิมอยู่แล้ว; ปรับลำดับข้อมูลให้ contact และ Maps ที่ลูกค้าเพิ่งแก้มีสิทธิ์เหนือ snapshot เก่าในสัญญา โดยสัญญาเป็น fallback. กด refresh แล้วเห็นค่าล่าสุดและ Confirm จะใช้ค่าล่าสุด.
- **Tests:** website inline JS syntax ผ่าน; `node --test tests/*.test.mjs` ผ่าน 274/274; Chromium ผ่าน desktop 1280px ภาษาไทยและ mobile 375px ภาษาอังกฤษ (popup ทั้ง 3 ส่วน). Bot `npm test` ผ่าน 537/537. Delivery backend `npm run build`, identity, delivery-pending 11/11, overrides 25/25 และ reservation 67/67 ผ่าน.
- **Deploy:** push `main` ครบทั้ง 3 repo แล้ว. GitHub Pages รับ website; Render ต้อง deploy Bot `ba85ead` และ Delivery backend `4707d33` ตาม auto-deploy. ไม่มี env var/secret ใหม่.

## Request — 2026-10-04 — Codex → Claude Code: แก้รายการเดิมจากหน้าทำรายการชำระเงินต่อ

- **Owner request:** ลูกค้าที่เปิดลิงก์ “ทำรายการชำระเงินต่อ / Continue to payment” จากอีเมลต้องแก้เครื่องและเกม ข้อมูลลูกค้า ที่อยู่/Google Maps และช่วงเวลาเช่าได้ โดยใช้ Popup และกฎจาก Step เดิมของ `index.html`; เปลี่ยนวันที่ต้องเปิดปฏิทินเดิมและเช็คคิวใหม่ เปลี่ยนสถานที่ต้องขอค่าส่งใหม่.
- **Identity:** ใช้ Rental ID เดิมเสมอและอัปเดตแถว Console Pending เดิม เพื่อให้ Delivery App เห็นรายละเอียดล่าสุด; ห้ามเริ่มรายการใหม่หรือสร้าง Rental ID ใหม่.
- **Security/integrity:** Bot ต้องตรวจ private payment token ก่อนรับการแก้ไข และเก็บสถานะยืนยันตัวตน สัญญา เอกสาร และสถานะชำระเงินที่ server ถือไว้ ไม่ให้ browser เขียนทับ.
- **Planned scope:** `ajconsole` สำหรับ Popup เดิม/hydration/reprice/queue/delivery UX, `aj-line-oa-bot` สำหรับ payment-resume update API ที่เขียนทั้ง booking history กับ Console Pending และ `delivery-app` ให้ Console Pending เลือกข้อมูลลูกค้า/แผนที่ล่าสุดจากแถวที่แก้แทนค่าก่อนแก้ในสัญญา; ไม่แตะ `aj-cm`.
- **Language:** ข้อความและ validation ที่ลูกค้าเห็นต้องครบทั้งไทยและอังกฤษ.

## 2026-10-04 — หน้าสรุปการเช่าแยกอุปกรณ์ซ้ายและเกมขวาเสมอ (website `08c5578`)

- **แจ้ง Claude:** Codex แก้เฉพาะ `ajconsole`; ไม่ได้แตะ `aj-cm`, Bot หรือ Delivery App.
- การ์ด “สินค้าที่เช่า / Rental item” ในหน้าสรุป Rental ID และหน้า “ทำรายการชำระเงินต่อ / Continue to payment” ใช้ renderer เดียวกันและแยกข้อมูลเป็นสองลิสต์จริง: **รายละเอียดอุปกรณ์ / Equipment details** อยู่ซ้าย และ **เกมที่เลือก / Selected games** อยู่ขวา.
- เอา CSS `columns: 2` เดิมออก เพราะเคยแบ่งรายการตามความสูงจนเกมแรกไหลไปฝั่งอุปกรณ์; layout ใหม่คงสองฝั่งทั้ง desktop และมือถือ และตัดบรรทัดข้อความยาวภายในฝั่งของตัวเอง.
- เพิ่มข้อความกรณีไม่มีเกมทั้งไทยและอังกฤษ และย้ายบอร์ดเกมที่เลือกไปอยู่ฝั่งรายการเกมในหน้าสรุปด้วย โดยยังใช้ข้อมูล `games` / `later` และ catalogue เดิม.
- **Tests:** inline JavaScript syntax ผ่าน; `node --test tests/*.test.mjs` ผ่าน 271/271; Chromium visual check ผ่านที่ 585px ภาษาไทยและ 375px ภาษาอังกฤษ โดยเกมอยู่ขวาทั้งหมดและไม่มี horizontal overflow.
- **Deploy:** GitHub Pages จะรับการเปลี่ยนแปลงหลัง push `main`; ไม่ต้องตั้งค่า environment variable หรือ deploy ระบบอื่น.

## Request — 2026-10-04 — Codex → Claude Code: แยกอุปกรณ์ซ้ายและรายชื่อเกมขวาในหน้าสรุปการเช่า

- **Owner request:** ในการ์ด “สินค้าที่เช่า / Rental item” ของหน้าสรุปและหน้าทำรายการชำระเงินต่อ ให้แสดงรายละเอียดเครื่องและอุปกรณ์ทางซ้าย และรายชื่อเกมที่ลูกค้าเลือกทางขวาเสมอ ทั้งภาษาไทยและอังกฤษ.
- **สาเหตุ:** ลิสต์เดิมใช้ CSS `columns: 2` กับอุปกรณ์และเกมรวมกัน เบราว์เซอร์จึงแบ่งตามความสูงและอาจย้ายเกมรายการแรกไปอยู่ฝั่งอุปกรณ์.
- **Planned scope:** แก้เฉพาะ `ajconsole/index.html` และการทดสอบของเว็บไซต์ โดยแยกข้อมูลเป็นสองลิสต์อย่างชัดเจนและใช้ renderer เดียวกันทั้งสองหน้า; ไม่แตะ `aj-cm`, Bot หรือ Delivery App.
- **Source of truth:** ใช้รายละเอียดอุปกรณ์และ `games` / `later` ที่ flow การจองมีอยู่แล้ว ไม่สร้างหรือคัดลอก catalogue ใหม่.

## 2026-10-04 — Console Pending: ปุ่มดูรายชื่อเกมที่ลูกค้าเลือก (Delivery App `ac6d8ea`)

- **แจ้ง Claude:** Codex แก้ Delivery App ตามคำขอของเจ้าของ โดยไม่ได้แตะ `aj-cm`, เว็บไซต์ หรือ Bot application code.
- **กฎถาวรจากเจ้าของ:** บันทึกไว้ใน `docs/SHARED-WORKSPACE.md` แล้วว่า ทุกครั้งที่ Codex สร้าง แก้ไข หรือลบสิ่งใดในสาม repo ต้องแจ้ง Claude Code ที่บนสุดของไฟล์นี้ พร้อมเหตุผล commit tests และสิ่งที่ต้อง deploy/ทำต่อ.
- ใน Booking Log → Console Pending แต่ละรายการที่มีเกม จะมีปุ่ม **“ดูรายชื่อเกมที่เลือก (N)”** กดแล้วเปิดรายชื่อแบบลำดับเลข พร้อม Rental ID และชื่อเครื่องของรายการนั้น.
- ถ้าลูกค้าเลือก **“แจ้งรายชื่อเกมภายหลัง”** ปุ่มจะแสดงสถานะนี้ และหน้าต่างจะบอกว่ายังไม่มีเกมที่เลือก.
- Backend ส่ง `games` และ `gamesLater` มากับ Console Pending item โดยอ่านจากข้อมูลเดิมที่เว็บไซต์และ Bot เก็บอยู่แล้ว:
  - `ข้อมูลจอง.games` เป็นรายการแรกจากหน้าเว็บ;
  - `รายการเสริม / เกม` ชนะเมื่อมีรายการใหม่จาก game picker ภายหลัง;
  - ใช้ตัวแยกเดิมของ Delivery App กรองอุปกรณ์เสริม และตัดบอร์ดเกมออก จึงไม่เอา “เพิ่มจอย” หรือ Catan มานับเป็นเกมเครื่อง.
- **Tests:** backend build, frontend TypeScript, Expo web export; delivery-pending 11, game-list-parsing 14, console-pending-reservation 67, resubmissions 20, game-extras 16, console-pending identity, console-pending-overrides 25, game-selection-card 45 และ request-check 8 ผ่านทั้งหมด.
- **Deploy:** backend ต้อง deploy commit นี้เพื่อให้ API ส่งสอง field ใหม่ และ staff app ต้อง web build/OTA ตามขั้นตอนเดิมเพื่อเห็นปุ่ม.

## Request — 2026-10-04 — Codex → Claude Code: show selected games on each Console Pending item

- **Owner request:** In Delivery App → Booking Log → Console Pending, add a button on each request that opens the exact game list the customer selected for that rental.
- **Source of truth:** use the existing `games` / `later` values already carried by the website inside the Console Pending row's structured `ข้อมูลจอง`; do not create another game list or copy catalogue rules.
- **Planned scope:** Delivery App only for the API field, button, popup and tests. The website and Bot already carry and persist the required data, so they should remain unchanged unless testing finds a missing handoff.
- **Why:** staff need to see the requested games before confirming the pending request and preparing the console, without searching inside the raw booking message or JSON.

## 2026-10-04 — "รวมก่อนส่วนลด" line removed (Delivery App `854c93a`)

- **Why:** after a promotion this line showed a figure that was already discounted, under a "before discount" name, and it repeated the rental total just below. Booking 536: 1,200 + 210 − 201 printed "รวมก่อนส่วนลด 1,209".
- **Removed from:**
  - the booking confirmation card (`bookingConfirmFlex.ts`, TH "รวมก่อนส่วนลด" / EN "Subtotal");
  - the booking edit summary in the app (`BookingLogScreen.tsx`);
  - the text summary (`lineService.ts`).
- **Kept:** "ค่าเช่าก่อนส่วนลด" on the extension card. It is the rental itself before the single 10% discount, not a sum of lines.
- The Bot, the website and email have no such line.
- **Tests:** confirm-totals 24 (3 new), vip-charges, confirm-extras, bundle-from-payment, console-pending-reservation and master-agreement all pass. `test:flex-ledger` has 1 failure ("blacklist-check is past the version gate") that already failed before this change.
- **To see it:** the staff app needs its usual web build or OTA update. The cards change once the backend deploys on Render.

## 2026-10-03 — The chosen place follows a language switch (website + Bot)

- **The problem:** a place chosen in Thai kept its Thai green line ("📍 ส่งไปที่: …") and its Thai address after the page switched to English.
- **The fix:**
  - The green line's own words switch at once.
  - The place's name and address are asked for again in the new language, through the widget's `relabel()`.
  - The Bot's `/api/places/search` answers a link carrying `query_place_id` with Google Place Details in that language (`placeDetails`); other links get the address at the pin in that language.
  - The box text follows when it was the place's name.
- **Where:** the calculator (its own TH/EN button, and the pop-up's) and step 2. `mapsPlace` now keeps `lang` and `link`.
- `place-search.js` and `QUOTE_PAGE_VERSION` are now `20261003-6`.
- Place Details needs Places API (New) on `GOOGLE_MAPS_API_KEY`'s project, the same as the suggestion list. Without it, a link's address at the pin is used.
- **Tests:** website 270, Bot 534. A headless run of TH → EN → TH on the calculator.

## 2026-10-03 — Analytics page in a narrow PC window (Bot)

- **The problem:** in a narrow window the four tabs were squeezed into tall ovals of wrapped text, and the buttons were oversized.
- **Tabs and buttons:** they now stay compact and on one line at any width; the tab row scrolls sideways if it must. They use 14 px text, or 13 px under 600 px.
- **One-column board** (under 760 px): the boxes become a plain list in the board's own order (top to bottom, then left to right), each as tall as its content, so nothing scrolls inside a box. Moving and resizing wait for the 12-column board; adding, removing and text size still work.
- The default headline-numbers box is now 4 rows tall, so it does not scroll at full width.
- **Tests:** Bot 533. Headless checks at 490 px and 1366 px.

## 2026-10-03 — Analytics "🧩 หน้ารวม": a board the admin arranges (Bot `b059fca`)

- **New first tab** on the analytics page (`/analytics/`). Press "✏️ จัดหน้ารวม", then:
  - "➕ เพิ่ม / เอากรอบออก" picks any panel from the three tabs. There are 33 today, grouped by tab, and a panel added to a tab later appears in the list by itself.
  - Drag a box's header to move it anywhere; the grid floats, so gaps are allowed.
  - Drag a side or corner to resize; on a touch screen the handles are always shown.
  - A− / A+ sets the text size inside a box, 60–160%. ✕ removes a box.
  - "↺ คืนค่าเริ่มต้น" brings back the default board.
  - "✓ เสร็จ" locks the board again.
- **What is in a box:** live copies of the tabs' own panels (`public/analytics/board.js`). The numbers are the same, they refresh with the minute's reload and with the date filter, and their buttons and lists ("ดูทั้งหมด", the game device list) act on the originals. Ids are stripped from the copies, so no id is duplicated. A box whose content is too long scrolls inside itself.
- **Saving:** automatic, through `GET/PUT /api/admin/analytics-layout` (admin only). It is stored as site content `admin-analytics-layout`, so it is the same on every device, with this browser as a fallback.
  - `normalizeAnalyticsLayout` cleans the layout: at most 80 boxes, keys checked, boxes kept within the 12 columns, scale 0.6–1.6.
  - The public `/api/site-content/:key` now refuses `admin-` keys.
  - Nothing is written when nothing moved.
- **On a phone** the board is one column. That re-flow is never saved over the desktop arrangement; adding, removing and text size still save.
- **Library:** gridstack 14.0.0 (MIT), kept in `public/analytics/vendor/gridstack-14.0.0`.
- **Tests:** Bot 532. Headless run with mock data:
  - the default board;
  - no duplicate ids;
  - resize (6×6 → 4×8);
  - a drag moves a box;
  - A− (0.8);
  - adding and removing from the picker;
  - a copied button working;
  - one save, and the same board after a reload;
  - one column at 390 px with no extra save.

## 2026-10-03 — Order page: switch identity choice with the deposit shown; the details dialog checks required fields (website)

- **"ไม่ยืนยันตัวตน — ใช้ค่าประกันสูงขึ้น":** a green button reads "ยืนยันตัวตนเพื่อลดค่าประกันเป็น ฿X" ("Verify your identity to lower the deposit to ฿X"), where X is the device's normal deposit (VIP included).
  - It opens the "ข้อมูลลูกค้าและที่อยู่จัดส่ง" dialog with the ID-type field at its top, ready to fill.
  - Cancel restores the no-verification choice.
- **"ยังไม่สำเร็จ — ยืนยันภายหลัง":** a red-outlined button "ไม่ต้องการยืนยันตัวตน · ค่าประกันปรับเป็น ฿Y" ("No verification · deposit becomes ฿Y") sits next to "ยืนยันตอนนี้", which is now green.
  - Y is `noContractDeposit` (฿10,000 / ฿15,000; any PS5 bundle ฿15,000).
  - The change is immediate, with a toast, and the green button above brings the normal deposit back.
  - The colours mean the same thing everywhere: green verifies (lower deposit), red outline skips (higher deposit).
- `setDemoNoContract()` is now the one switch for the step 2 checkbox and both buttons. It drops any payment link made for the old deposit.
- **Details dialog:** "ยืนยันการแก้ไข" no longer saves an incomplete step 2.
  - While anything is missing the button is grey, and the footer says "⚠️ ยังกรอกไม่ครบ: <first problem> (อีก N รายการ)".
  - Tapping it marks the fields and scrolls to the first one.
  - The note updates as the customer types.
- **Tests:** website 269. Headless checks in TH and EN:
  - the button amounts and colours;
  - the dialog opens at the ID type;
  - an empty save is blocked with field errors, and save unlocks once complete;
  - Cancel restores the choice;
  - skip then verify round-trips.

## 2026-10-03 — One language button while the pin map is open (website)

- With the map sheet open, the page's language buttons are hidden; the sheet's own TH / EN button is the only one. Cancel, Escape or "ใช้ตำแหน่งนี้" brings them back. This works in Thai and English.
  - **Calculator pop-up on the booking page:** the calculator posts `AJ_PIN_MAP {open}` to the booking page, which toggles `#quoteModal.pin-map-open` to hide `#quoteLangBtn`. A pop-up closed with the sheet still open reopens with the button still hidden, matching the sheet.
  - **Calculator page on its own:** `html.ajps-map-open #lang`.
  - **Step 2:** `html.ajps-map-open #langBtn`.
- `place-search.js` and `QUOTE_PAGE_VERSION` are now `20261003-5`.
- **Tests:** website 266. A headless run of the pop-up (TH and EN) and the standalone page: the button is hidden while the map is open, and shown again after Cancel, "use this spot" and Escape.

## 2026-10-03 — Pin map: its own TH / EN button, which switches Google Maps' labels too (website)

- The map sheet has a red "🇬🇧 EN" / "🇹🇭 TH" button by its title. It switches the sheet's words and the map's labels together, and the map reopens where the customer had moved it, at the same zoom.
- Google Maps takes its language once, when its script loads, and cannot load twice on one page. So the map now lives in its own page, `assets/pin-map.html`, which the sheet shows in a frame.
  - The button reloads that page with `?lang=en|th&lat=&lng=&zoom=`.
  - The sheet reads the spot under its pin through `window.ajPinMap.center()`. It is the same site, so no messaging is needed.
  - Google, or OpenStreetMap when there is no key or Google refuses it, is now decided inside that page.
  - The referrer Google checks is still ajgamerental.com.
- The sheet opens in the page's language. Once the customer switches it, the next map on that page opens in the language they chose. The rest of the page keeps its own language button.
- `place-search.js` and `QUOTE_PAGE_VERSION` are now `20261003-4`; `pin-map.html` is `?v=20261003-4`.
- **Tests:** website 265. Headless checks:
  - a fake Google script loaded `language=th`, then `language=en` after the button, at the moved spot and zoom 16;
  - a refused key gives OpenStreetMap, and the button still works;
  - the Facebook "location refused" flow works on the calculator and in step 2.

## 2026-10-03 — No game changes during the rental (Rental Terms 2026-10-03); Google Maps on the pin map (Bot `4afaa66`, Delivery App `24f9544`, website)

- **Rental Terms 2026-10-03** (effective 13:30 Bangkok time) adds Rental Operation item 9, in TH and EN:
  - TH: "ไม่สามารถเพิ่มหรือเปลี่ยนเกมได้ระหว่างระยะเวลาเช่า เกมในเครื่องเป็นไปตามรายชื่อเกมล่าสุดที่ผู้เช่ายืนยันก่อนร้านเตรียมเครื่อง และจำนวนเกมที่ติดตั้งได้ขึ้นอยู่กับพื้นที่ของเครื่อง บางเกมอาจติดตั้งได้ไม่ครบ".
  - The contract PDF and the Rental Order PDF print the terms from the version stamped on each rental, so new rentals carry item 9 and older ones keep their own wording. The /rental-terms/ page and the LIFF form read the same source.
  - Shipped versions: 2026-09-23, then 2026-09-28 (lock-code charges), then 2026-10-03. `rentalTermsVersionAt` walks them by date.
  - **Owner:** if the terms were edited and published from Admin after 2026-09-28, the shipped 2026-10-03 replaces that text. Re-publish from Admin with item 9 added if so.
- **The same sentence, "⚠️ ไม่สามารถเพิ่มหรือเปลี่ยนเกมได้ระหว่างระยะเวลาเช่า" / "⚠️ Games cannot be added or changed during the rental period.", appears in:**
  - **Game picker header:** on the booking page (`.game-picker-attention`) and in `game_index.html` (`.pick-title-attention`). It takes turns with the storage notice in one badge, 4 s each.
    - The second notice lies over the first and shrinks its text to fit (`fitAttentionNotice`). On one-line headers the badge widens instead.
    - Header heights were measured at 15 widths (320–1366 px) in TH and EN, before and after: identical, so the game grid is no smaller. The notice is never clipped.
  - **"สินค้าที่เช่า" card,** under the game lines, on the order page and on the my-rental page (`gameChangeNoticeHtml`).
  - **LINE game card** ("บันทึก/อัปเดตรายการเกมเรียบร้อยแล้ว"), above the edit button, in both the Bot's (`gameChangeNotice`) and the Delivery App's.
  - `gamePickerVersion` is now `20261003-1`.
- **Pin map: Google Maps.** The widget fetches `googleMapsBrowserKey` from the Bot's `/api/config` (env `GOOGLE_MAPS_BROWSER_KEY`) and draws Google Maps with a road / satellite switch.
  - Without a key, or if Google refuses it (`gm_authFailure`) or does not load, it draws OpenStreetMap as before.
  - No key is in the site's files (a test checks).
  - `place-search.js` and `QUOTE_PAGE_VERSION` are now `20261003-3`.
- **Owner, to switch the map to Google:** create a **second** API key in Google Cloud for the browser.
  - Under Application restrictions, choose Websites and add `https://ajgamerental.com/*` and `https://www.ajgamerental.com/*`.
  - Under API restrictions, allow only Maps JavaScript API. Enable that API in the project.
  - Put the key on Render (aj-line-oa-bot) as `GOOGLE_MAPS_BROWSER_KEY`.
  - Do not reuse `GOOGLE_MAPS_API_KEY`: the browser key is visible to anyone, which is why it is restricted.
- **Tests:** Bot 529, website 264, Delivery App game card 45. Headless checks:
  - a fake Google Maps script draws, and the pin is used;
  - a refused key falls back to OSM;
  - the order-page note shows in TH and EN.

## 2026-10-03 — "Pin it on a map" for browsers that refuse location (website)

- **Problem.** "📍 ใช้ตำแหน่งปัจจุบัน" failed in the Facebook app's browser; it worked in LINE. The Facebook and Instagram in-app browsers never give a web page the phone's location, so no setting on our side can make that button work there.
- **Fix.** The place box (`assets/place-search.js`) gains a map the customer moves under a fixed red pin, then taps "ใช้ตำแหน่งนี้". It needs no permission from the browser, so it works in Facebook, Instagram, LINE and every other browser.
  - There is a new "🗺️ ปักหมุดบนแผนที่" / "🗺️ Pin it on a map" button next to the location button on the calculator, in step 2, and in the order page's "needs a pin" panel.
  - When the location is refused, the map opens by itself with a note: "แอป Facebook / Instagram ไม่ให้เว็บใช้ตำแหน่งปัจจุบัน ปักหมุดบนแผนที่นี้แทนได้เลย". Other browsers get a general version of the note.
  - The map starts at the place chosen last, else Bangkok. A pin outside Thailand is refused.
  - The pin becomes a `maps.google.com/?q=lat,lng` link in the box. The box looks up the address there (Bot `/api/places/search`), shows the place name and the green line, and the price follows. If no address is found, the pin is still used, labelled "ตำแหน่งที่ปักหมุด lat, lng".
- **Map.** Leaflet 1.9.4 is kept on the site (`assets/vendor/leaflet-1.9.4`, BSD-2 licence included) and loaded only when the map opens. Tiles are OpenStreetMap's, credited on the map. No API key is needed.
- **Stale pop-up.** The owner's screenshot showed the calculator's old text inside Facebook: in-app browsers keep old copies. The pop-up's iframe now carries `&v=${QUOTE_PAGE_VERSION}` (`20261003-2`), and `place-search.js` is `?v=20261003-2`. Bump both together when the calculator changes.
- **Tests:** website 262. Headless run with a Facebook iOS user agent and location refused: on the calculator (TH/EN) and step 2, the map opens with the note; dragging and using the spot fills the box, the green line and the price. Escape closes the map.

## 2026-10-03 — Place suggestions in both place boxes; one accessory for PS5 / PS5 Pro (Bot `94ea86a`, website)

- **One place box, two pages.** `assets/place-search.js` (`AJPlaceSearch.create`) drives the calculator's `#maps` and booking step 2's `#demoMaps`, so they behave the same.
  - It looks the text up after 1.5 s idle, at least 4 characters, not mid-composition. Paste, Enter or leaving the box looks up at once.
  - One match is taken at once. Several open a list under the box, each with 📍, the name and the full address. Picking one closes the list; arrow keys and Enter work too.
  - A pasted link is taken as it is, and the address at its pin is looked up for the green line.
  - Nothing found: the box says how to type it better (TH/EN).
  - The green line "📍 ส่งไปที่: name · address" opens the place in Google Maps.
- **Bot.** New `POST /api/places/search {q, lang}` returns `{kind, places:[{name, address, lat, lng, link, pin}]}`. It is capped at 60 per 15 min per IP, with CORS open.
  - Lookup order: Google Places Text Search (New), then Geocoding API results, then Nominatim. Thailand only, cached 24 h.
  - `link` opens the place (`search/?api=1&query=lat,lng&query_place_id=…`); `pin` carries the coordinates and is what gets priced.
  - `/api/delivery/quote` now fills `location.label` for a pinned link from the address at the pin (`reverseGeocode`).
- **Calculator.** Prices only once a place is chosen (`chosenPlace`), using `pin`.
  - The button with a list open takes the highlighted place; with none, it looks the text up now.
  - `AJ_QUOTE_BOOK` also carries `place {name, address, lat, lng}`, so step 2 shows the same green line without asking again.
- **Step 2.** `demoProfile` gains `mapsText` (what is in the box) and `mapsPlace` (the chosen place). Both are saved for 24 h like the rest.
  - `maps` (the link the booking carries) is set when a place is chosen or a link is pasted. Typed text alone leaves it empty.
  - Validation asks the customer to "เลือกสถานที่ส่งจากรายการใต้ช่อง หรือวางลิงก์ Google Maps".
  - A saved link, the calculator's link and "📍 ใช้ตำแหน่งปัจจุบัน" are looked up once, quietly, for the green line.
  - The order page's Google Maps row shows the place name.
- **Calculator accessories, PS5 / PS5 Pro (ids 11, 18).** A radio list, as on the booking page: "ไม่เพิ่มอุปกรณ์เสริม" plus the badge "รวม 2 จอยในราคาเช่าปกติแล้ว" ("No accessory" / "2 controllers included") is chosen by default, and only one accessory can be picked. Other devices keep checkboxes.
- **Owner, optional:** for real place names in the list (e.g. "เซ็นทรัลเวิลด์" rather than a street address), enable **Places API (New)** in the same Google Cloud project as the Geocoding key. If the key has API restrictions, add Places API (New) to them. Without it, the list uses Geocoding results, then OpenStreetMap.
- **Tests:** Bot 528, website 261. Headless checks of the list, a pick, a single match, not found, a pasted link, the keyboard, a re-render, a reload, adopting from the calculator, and the PS5 radios, in TH and EN. The live Google answers were not checked from here: outbound access to Google and OpenStreetMap is blocked in this environment.

## 2026-10-03 — Calculator prices by itself; found place opens in Maps and fills step 2

- **When it prices:**
  - a pasted link: at once;
  - typed text: after 1.5 s idle, at least 4 characters, not mid-composition;
  - leaving the box or pressing Enter: at once;
  - a change of device, bundle, extras or days: re-prices.
- Repeat keys are skipped and stale answers dropped (`quoteSeq`, `lastQuoteKey`).
- The green found-place line links to a Google Maps pin (`search/?api=1&query=lat,lng`).
- `quotedMapsLink` travels to the booking page: `AJ_QUOTE_BOOK.mapsUrl` from the pop-up, or `?maps=` (with `utm_source=quick_quote`) from the standalone page. `adoptQuoteMapsLink` fills step 2 only when its box is empty.
- The owner turned on Google Geocoding (`GOOGLE_MAPS_API_KEY` on Render) on 2026-10-03.

## 2026-10-03 — Delivery fee from a place name (Bot `2fab756`, website)

- **Bot.** `resolveDeliveryLocation` tries, in order:
  1. the link's own pin;
  2. the place the link names (`q=` / `query=` / `/maps/place/`), looked up;
  3. typed text, looked up;
  4. the booking form's address, looked up.
- The lookup is in `services/geocode.js`: Google Geocoding when `GOOGLE_MAPS_API_KEY` is set, otherwise Nominatim. Answers are limited to Thailand and cached for 24 h. The quote response carries `location.label`.
- **Calculator (`/quote/`).** The box takes a link or typed text and shows the place it priced to in green. The location-refused and place-not-found messages are rewritten in TH and EN. The pop-up iframe has `allow="geolocation"`.
- **Owner, optional:** set `GOOGLE_MAPS_API_KEY` on Render (aj-line-oa-bot) for better Thai place matching. It works without it, using OpenStreetMap.

## 2026-10-02 — Cancel button on Console Pending and ID Pending (Delivery App `73c5b04`, Bot `a3979ee`)

- Each request has a red "ยกเลิกรายการ" button next to Confirm. It asks first and makes no booking.
- **Console Pending:** writes "ยกเลิก" into the request log's สถานะ column (`POST /api/console-pending/cancel`, checked against the Rental ID). A paid request is warned that cancelling refunds nothing.
- **ID Pending:** the bot's new `{action:'cancel'}` sets status `cancelled`. The list skips it; the Gist is not touched.
- Nothing is deleted. To undo, clear the status cell in the sheet.
- **Fixed with it:** DA's ID Pending had only seen PS5 requests since the platform split. It now asks for both lists and groups by console and ID number. Confirming a Switch request writes `aj-switch-game-id-data.json`.

## 2026-10-02 — Late-order delivery times (Delivery App `f972103`)

- Booking 548 got 22:00 for delivery and return. `deliveryTimeFor` in `deliveryTiming.ts` now applies the shop's rules:
  - after 22:00, and through the night until 06:00: 13:00;
  - from the cutoff up to 22:00: 10:00;
  - 19:00–19:59, before the cutoff: +1 h;
  - otherwise: +3 h for a console with games, +1 h for a headset or wheel, rounded up to the half hour, not before 10:00.
- The return keeps the same time of day.
- The cutoff is read from the bot's `booking-settings` (set in the index Admin) and cached for 5 minutes. It is capped at 20:00 and falls back to 20:00 when it cannot be read.
- Assumed and needs the owner's OK: orders between 00:00 and 05:59 count as "after 22:00", so 13:00.

## 2026-10-02 — Game picker opens once (website `1225367`)

- **Cause.** Opening the picker still flashed. The booking page sends AJ_PICKER_OPEN on frame load, again at +500 ms, and on AJ_GAME_READY. The picker's safety net (`forceRenderPicker`) repeats each request at 30 and 180 ms. Every request ran `openPickModal`, which wiped the grid to the "choose a console" prompt, and then redrew it: 15 renders and 2,671 covers created per opening.
- **Fix in game_index.html:**
  - `isRepeatPickerOpen` dedupes identical requests (same console, games, language, mode and dates) while games are showing, within 4 s.
  - `openPickModal({platformPending})` skips the prompt.
  - `closePickModal` resets the dedupe.
  - `refreshPickerAfterCatalog` redraws in place when the Gist catalogue lands, and ticks the booking's games that were unknown at open.
- **Fix in index.html:** `closeGamePicker` posts AJ_PICKER_CLOSE.
- **Result:** 2 renders and 383 covers per opening, none thrown away. A game picked while the requests were still arriving used to be wiped by the next request and is now kept.
- `gamePickerVersion` is now `20261002-2`.

## 2026-10-02 — Pictures no longer flash (website `b1ab684`, `9360e11`)

- **Cause.** Every render set `innerHTML`, which recreated every `<img>`. The page renders several times as data arrives (Gist, availability, reviews, board games), and the picker re-rendered its grid on each pick.
- **Fix.** `patchHTML(host, html)` morphs in place, in both `index.html` and `game_index.html`:
  - children are keyed by `data-key` / `data-id`;
  - an image whose src is unchanged is never touched.
- **Applied to:** the landing rails, home cards, console grid, all-devices pop-up, booking option rows (payment logos), order page, and the picker grid and list.
- **Rule for future work:** a host updated with patchHTML must not bind listeners to its children on each render; use one delegated listener on the host. The landing rails now do this (`bindBeforeRentDiscoveryClicks`).
- The device rail resets its scroll only when the type filter changes.
- `pickBrokenImages` stops a patch from bringing back a broken cover.
- `gamePickerVersion` is now `20261002-1`.
- **Measured:** landing page, 3 re-renders: 75 images recreated before, 0 after. Picker, 3 taps: 813 before, 0 after.

## 2026-10-02 — ID rental message: ครับ/ค่ะ and no-refund note (website `4c414ad`)

- The message copied from `/ajgameid/` and `/ajgameid/switch/` greets "สวัสดีครับ/ค่ะ" and closes "...ให้หน่อยครับ/ค่ะ".
- It ends with the shop's terms: "⚠️ หลังชำระเงินแล้ว ทางร้านขอสงวนสิทธิ์ไม่คืนเงินครับ แต่สามารถเปลี่ยนไอดีเกมอื่นแทนได้ ...". The English message carries the same note.
- Removed the dead builders `buildMessage` and `handleLine`. `handleLineShare` is the only place the message is built.

## 2026-10-02 — A failed delivery price no longer stops a payment; gold calculator button (website `d6b87fc`, `386b1b9`; Bot `7bad28c`; Delivery App `ee1614e`)

- **Incident.** A customer could not pay: the order-page button stayed on "รอราคาค่าส่ง". Payment was hard-locked until Lalamove returned a live price. Any failure locked the button with no way forward: a Lalamove error, a map link with no pin, or a slow server. The retry text sat far up the page. The exact cause for this customer is unknown: no logs are reachable from here (Render logs and `.env` are not in this environment).
- **Website.**
  - The page retries once quietly.
  - After that, the button reads "ชำระเงิน · ค่าส่งจ่ายตอนรับเครื่อง" / "Pay now · delivery fee later" and works. A note right above it gives the reason and offers retry and "ใช้ตำแหน่งปัจจุบัน".
  - The booking carries `deliveryPending: true` and a cost line "ร้านแจ้งยอด ชำระตอนรับเครื่อง".
  - The quote request now sends `rentalCode` and `attempt`.
- **Bot.**
  - `/api/delivery/quote` alerts the admin on LINE when an order-page quote fails: no pin, Lalamove error, or not configured. It waits for the page's retry and fires once per rental per 30 minutes. The quick-quote page never triggers it.
  - The payment notice gets a line "⚠️ ยังไม่ได้คิดค่าส่ง".
  - `deliveryPending` is in PAGE_PRICING_FIELDS.
- **Delivery App.** Console Pending shows a red "ยังไม่ได้คิดค่าส่ง" tag, a note, and a red empty delivery-fee field (`orderDetails().deliveryPending`).
- **Calculator button.** Gold on the cards and in the all-devices header, with a hint under the label ("รู้ยอดรวมก่อนจอง" / "See the total before booking"). A shine plays three times and is off under reduced motion. On phones the pop-up title gets its own row.
- **Stack inventory** (Thai): https://claude.ai/artifact/V5mQhRXthaaUGkUHTL9DtW
- **Owner decision pending:** the Delivery App backend is on Render **Free** and sleeps after about 15 minutes. The website's rental-code request then times out at 12 s and falls back to a local code, and the app's timed jobs pause. Recommend Starter, like the Bot.

## 2026-10-02 — Nintendo Switch game ID list at /ajgameid/switch/ (website `5caa8eb`, Bot `f817e57`)

- New page https://ajgamerental.com/ajgameid/switch/ works like the PS5 list. It starts with one sample ID, Mario Kart 8 Deluxe, with a placeholder cover. **Owner:** add the real games in its admin (`?admin=1`). The first save from that admin creates `aj-switch-game-id-data.json` in the same Gist. The page reuses the GitHub token already saved for the PS5 list in that browser.
- The Switch page is **generated** from `ajgameid/index.html` by `node scripts/build-switch-id-page.mjs`, so never edit it by hand. After any change to the PS5 page, run the script; `tests/ajgameid-switch.test.mjs` fails until you do.
- Both lists number their IDs from 1, so requests are now kept apart:
  - The ID Pending sheet has a `platform` column (R). Blank means PS5.
  - `GET /api/id-pending?platform=switch` returns only Switch requests; without the parameter it returns PS5 only.
  - The customer's LINE card has a new "เครื่อง" row.
- A Gist pull now reads only the named file. Before, it fell back to any JSON file.
- Each page has a PS5 | Nintendo Switch switcher at the top.
- **Owner to check:**
  - Switch help text for ไอดีร้าน / ไอดีลูกค้า (Nintendo Account, own user, saves; one console at a time).
  - Step 6 of "วิธีการแจ้งเช่าไอดี", which now says the shop will guide the sign-in in the chat. It replaces the PS5 QR video; send a Switch video if you want one.
  - The rent-step screenshots are shared with the PS5 page.
- Not verified on a real LINE device: LIFF on `/ajgameid/switch/`. It works if the ID-rental LIFF endpoint is `https://ajgamerental.com/ajgameid` (a path prefix). Without it, the page falls back to copying the message.

## 2026-10-02 — Quotation: "x 3 วัน", green notes first, notes in the message (Delivery App `451e08e`)

- Item lines now read "จำนวน N เครื่อง x D วัน", and accessories read "x D วัน".
- Green customer-note rows go first, above the delivery note. Red rows stay after the standing notes.
- `customerNoteMessageLines` adds `✅line✅` (green) and then `❌line❌` (red) to the copy text right under the delivery line, in TH and EN.
- The form labels are prefixed with 🔴 / 🟢.

## 2026-10-02 — Quotation green note; notes one row per line (Delivery App `0738518`)

- QuotationFormModal has a new field `customerGoodNote` ("ขึ้นเป็นตัวเขียว"). It passes through the route, the service and BuiltQuotation.
- `rentalItemRows` writes every line of each note as its own `** line **` row and returns `customerNoteRows[]` (red) and `customerGoodNoteRows[]` (green). The green rows are formatted on both the quotation and the invoice sheets. Test: test:quotation-notes.

## 2026-10-02 — LIFF quote send fixed; step-1 calculator button removed

- The LIFF app now reads `?qq=` first, before `bootstrapLiff`, and stores it in sessionStorage as `ajQuickQuote` so it survives login. It shows a full-screen `#quickQuoteScreen` (sending / sent / failed) over the contract form and sends right after LIFF init. Texts come from `quickQuoteTexts()`, a function, because the screen draws before later constants exist. Script version is `20261002-quick-quote-2`.
- The step-1 "คำนวณค่าเช่า" button is removed. The calculator stays in the menu, on device cards, in the all-devices pop-up and at ?quote=1.

## 2026-10-02 — Switched-off announcement no longer reappears

- Cause: `DEFAULT_ANNOUNCEMENT` had `enabled: true`, and `loadSiteAnnouncement` fell back to it whenever the Bot did not answer (cold start or network). The flood notice came back even though Admin had turned it off.
- Fix: the default is now `enabled:false` and is used only to pre-fill the admin form. `loadSiteAnnouncement` returns null when the Bot's answer is unknown, and `applySiteAnnouncement(null)` closes the notice. Test: tests/announcement-off.test.mjs.

## 2026-10-02 — Device card buttons aligned; card "เช็คคิวและจอง" opens the calendar

- `renderConsoleGrid` wraps the games, calculator and book buttons in `.con-actions` (`margin-top:auto`). Before, only the book button had it, which left gaps on short cards.
- `startBookingWithCalendar(consoleItem, bundleId)` is shared by the card's book button and the calculator's `AJ_QUOTE_BOOK`. It selects the device, sets step 1, leaves the before-rent page and calls `openCalendar("start")`.

## 2026-10-02 — Greeting-button statistics on /analytics (Bot `9e454fd`)

- `greeting_button_clicked` is posted by aj-detached-omnichannel-bot when a customer taps a button on the daily greeting (LINE/Messenger). It is accepted and excluded from the website figures (`isGreeting`).
- `aggregateAnalytics().greeting = greetingSummary()` returns:
  - totals: clicks, customers, line, messenger;
  - buttons: one row per id, label = the newest `content`, sorted by clicks;
  - days: one row per Bangkok date.
  No button ids are hard-coded.
- /analytics has a new tab "💬 ข้อความทักทาย" with the metrics, a table of buttons (labels escaped with esc()) and a per-day chart. Test: test/greeting-analytics.test.js.

## 2026-10-02 — Calculator on every device card; quote sent to the shop via LIFF

- Device cards (`renderConsoleGrid`, so both the main page and the all-devices pop-up) show `data-card-quote` when the device is bookable, which calls `openQuotePopup("card", id)`. The quote page accepts `?device=` or the postMessage `AJ_SET_DEVICE` and selects that device unless it is closed.
- The LINE button now points to `https://liff.line.me/<LINE_LIFF_ID>/?qq=QQ-XXXXXX&lang=…` (`target=_top`, liffId read from the Bot's `/api/config`). If the id is unavailable it falls back to the old oaMessage text.
- The LIFF app (`public/liff/app.js`): `quickQuoteHandoffCode` / `sendQuickQuoteViaLine` log in if needed, then POST `{code, lineAccessToken}` to `/api/quick-quote/line-send` and close the window.
- Bot: `getVerifiedLineProfile`, then push `quickQuoteFlex` to that userId (deduped per user+code), then `markQuickQuoteSent`, then `notifyAdmin` with the display name and masked id. The LIFF script version is now `20261002-quick-quote`.
- Assumes the LIFF endpoint is the existing `/liff/` app (same as the contract LINE hand-off).

## 2026-10-02 — Calculator button in the all-devices pop-up

- `#allConsolesQuote` sits in the `#allConsolesModal` header (before "คัดลอก URL") and calls `openQuotePopup("all_consoles")`. The calculator opens on top of the list, and closing it returns to the list. Booking from the calculator closes both pop-ups and opens the queue calendar.

## 2026-10-02 — Calculator: one name; booking opens the queue calendar

- The menu, the step-1 button, the pop-up title and the quote page title all say "คำนวณค่าเช่า" / "Rental calculator". "คำนวณค่าเช่าคร่าวๆ" is gone from index.html.
- `AJ_QUOTE_BOOK` handler: `selectCalcConsole` + bundle, `state.calc.step = 1`, then `setBeforeRent(false, {startGuide:true, scrollTo:false})`, scroll to `#calculator`, then `openCalendar("start")`. This works from the before-rent page as well.

## 2026-10-02 — Rental calculator: same-page booking, ?quote=1, menu "คำนวณค่าเช่า"

- In the pop-up, "เช็คคิวและจองเครื่องนี้" postMessages `AJ_QUOTE_BOOK` (consoleId, bundleId) to the parent. The parent accepts it only from `#quoteFrame`, closes the pop-up, runs `selectCalcConsole` and sets the bundle, then scrolls to step 1. On the standalone /quote/ page the link opens in the same tab (no `target=_blank`).
- `https://ajgamerental.com/?quote=1` (or `#quote`) opens the pop-up on load. The pop-up has `#quoteCopyUrl`, which runs `copySectionUrl("quote")` and gives `?quote=1&lang=…`.
- The menu item is now "คำนวณค่าเช่า" / "Rental calculator". The step-1 button and the pop-up title still say "คำนวณค่าเช่าคร่าวๆ".
- New event `quick_quote_popup_booked` (allowed on the Bot).

## 2026-10-02 — Balance payment no longer creates a booking; quick price pop-up on the booking page (Delivery App `1783a35`, website, Bot)

- Booking 547 cause: the balance for 545 confirmed the same customer's old, never-booked request (16–19/09) as a new booking, and a card was sent.
  - `confirmConsolePendingByRentalCode` now returns `stale` for a request whose return date has passed, and the payment is parked as `stale_request`. `resolveRentalCodeForPayment` skips such requests.
  - `resolveRentalForPayment` first checks `openBookingForBalance`: the one open booking whose transferBeforeDelivery or cashReceive equals the amount.
  - A rental code on the payment that has no booking gives way to that balance (audit `redirected_to_balance`).
  - Test: `npm run test:payment-not-new-booking`.
  - **Booking 547/548 must be cancelled by hand.**
- Booking page: "🧮 คำนวณค่าเช่าคร่าวๆ / Quick price check" sits first in the menu and in the step-1 header beside the rental-steps button.
  - It opens `#quoteModal` with an iframe of `/quote/?embed=1&src=web&lang=…`. The TH/EN switch uses postMessage `AJ_SET_LANG`, so filled-in values are kept. It closes with ×, Esc or a click outside.
  - The `quick_quote_popup_opened` event (value menu/step1) is shown on /analytics.

## 2026-10-02 — Quick quote moved to ajgamerental.com/quote/ (website `fc6da56`, Bot `4f99de1`)

- The page now lives in this repo at `quote/index.html`, so the URL is **https://ajgamerental.com/quote/** (add `?src=line|messenger|whatsapp|web`). It calls the Bot (`API = https://aj-line-oa-bot.onrender.com`) for `/api/delivery/quote`, `/api/queue-closures`, `/api/quick-quote` and `/api/analytics/event`; `/api/quick-quote` was added to the Bot's CORS list.
- The old Bot link `/quick-quote/:key` 301-redirects to the new URL, keeping `src` and `lang`. Bot `public/quick-quote/` is removed, and the page tests moved to `tests/quick-quote-page.test.mjs`.
- Devices are listed in the booking page's order: `BRAND_ORDER`, then `RANK` (a test checks that it equals index.html's `consoleRank` list), then the higher rate.
- A device whose Ready Date is in the future, or whose queue is shut in Admin → ปิดคิว (a closure with no reopen date), is shown disabled as "⛔ … - พร้อมวันที่ DD/MM/YYYY" or "ปิดคิวในช่วงเวลานี้", and opens by itself. Bundles that are not ready yet are disabled the same way.

## 2026-10-02 — Delivery card balance bigger; quick quote answered on LINE with a Flex card; readable copy text (Delivery App `9575897`, Bot `fa8758b`)

- Delivery card (`deliveryMessage.ts` `balanceBlock`): the amount to pay on delivery sits in a tinted box with a bold label, the amount in 3xl red, and a one-line instruction. Applies to bank, cash and card/e-wallet.
- Quick quote → LINE:
  - The page puts a code `QQ-XXXXXX` on the last line of the oaMessage text. Pressing the button POSTs `/api/quick-quote`, which saves the quote in memory and in the "Quick Quotes" sheet (columns: Quote ID, Created At, Language, Source, Device, Days, Total, Quote JSON, LINE User ID, LINE Sent At).
  - The LINE webhook finds the code (`quoteCodeIn`) and replies with `quickQuoteFlex` (quick-quote-card.js), built from the saved copy. It writes the sender's userId to the row, notifies the admin, and keeps the message from Dialogflow.
  - An unknown code is retried once after 2.5 s, then the message is forwarded as usual.
- Copy / LINE text has sections (💵 rental + deposit, 🚚 delivery), one emoji per line, the total between rules, then 🎁 the discount line and 📅 the booking link. Copy adds ℹ️ and the note.

## 2026-10-02 — Booking card cost labels wrap (Delivery App `3262474`)

- `costBox` in bookingConfirmFlex.ts: every label has `wrap: true` (before, only the bold ones did), so long labels such as "ค่าประกัน (Bundle PS5)" and "📦 เช่าพร้อม Logitech G29" no longer end in "...". The amount stays on the first line (`gravity: 'top'`).

## 2026-10-02 — PS5 bundle: second device as its own booking; quick-quote discount note (Delivery App `6d20c8d`, Bot `323cf75`)

- A PS5 booking with a bundle gets a second booking on the partner device (G29 / PSVR2 / PS Portal). It is a clone with the same customer, phone, dates, times, places and address, plus a new Booking Log column **"Bundle Parent ID"** set to the PS5 Booking ID (header auto-created). Code is in `bundlePartnerService.ts`. `BookingService.syncBundlePartnerOf` runs from `addBooking` (when a bundle is set) and from `writeBookingRow` (when either side has a bundle):
  - it creates the second booking, mirrors changes, cancels and un-cancels it, switches the device when the bundle changes, and releases it when the bundle is removed;
  - it works one parent at a time, so the second booking is never created twice;
  - `deleteBooking` removes it too (bottom-up), and `setDone` marks it done with the PS5 booking.
- No money on the second booking: `bookingCharges` returns zero for it, and `FinanceService.upsertEntryFromBooking` skips it. Its sheet **Rental Fee cell still shows the formula's partner-device price**; ignore it.
- The customer never sees it. `sendBookingConfirm` refuses it (`bundle_partner`). `withoutBundlePartners` filters it out of My rental, customerActions, customerRentalChange, paymentRentalResolver, game selection, LINE identity, contract lookup/signed, profileToBookings, fraud, analytics, agentTools, paidBookingLine, rentalChangeService and consolePending.
- The driver's queue already groups same customer, date and type into one job ("PS5-2, G29").
- Queue checks:
  - `conflictFor` ignores the edited booking's own second booking.
  - `findUnitForDates` and `startDayOptions` require the partner device to be free.
  - Extension `maxDays` takes the tighter of the PS5 and partner-device queues.
- App: the second booking shows "📦 Bundle ของ #545 · ยอดเงินทั้งหมดอยู่ที่ #545" with no customer buttons.
- Existing booking 545 gets its second booking on its next edit with the bundle selected.
- Quick quote: a green line under the total, "🎁 ลูกค้าเก่าลด 10% · รีวิวลดเพิ่ม — ยืนยันสิทธิได้ตอนกดจอง" (EN too), also included in the copied and LINE text. No tick boxes.

## 2026-10-02 — Confirmation email: grand total, vehicle, highlighted payment rows (Bot `7c4ae88`)

- `rentalChargeLines` (rental-lookup.js): "ค่าจัดส่งไป-กลับ (รถยนต์/มอเตอร์ไซค์)" from `deliveryQuote.serviceType`, then "ยอดรวมทั้งหมด / Grand total" = rental after discounts + deposit + delivery paid + payment fee.
- rental-confirmation.js `ROW_STYLES`: grand total grey and bold; payment status green (orange when unpaid); balance red and the largest. `paymentStatusRows` rows carry a third element, the style.

## 2026-10-02 — Bundle on the confirmation card; no-ID deposit ฿10,000 / ฿15,000 everywhere (Delivery App `939e748`, Bot `406f685`, website `25178a8`)

- Booking 545 (PS5 + Logitech G29) was confirmed as a bare PS5: ฿1,200 rent and a ฿2,000 deposit, while the balance (฿4,771) already carried the pair's ฿450 and ฿3,000 deposit. Cause: a request filed from the payment webhook (`createPendingFromPayment`) kept only the name and phone. It now keeps the website's rental (`orderFromPayment`: costs, bundleId(s), extras, discounts, …; no identity fields). Paid ledger items read it too. `findBundleByWebsiteId` maps `ps5_g29`→g29, `ps5_vr2`→psvr2 when no cost line names the partner. Card deposit label: "ค่าประกัน (Bundle PS5)" / "Deposit (PS5 bundle)". Test: `npm run test:bundle-from-payment`.
- Booking 545 itself is not fixed by this: the shop has to edit it (tick the bundle) or resend after editing.
- No-ID rule, now one rule in all three repos: under ฿4,000 → ฿10,000, ฿4,000 and up → ฿15,000, any PS5 bundle → ฿15,000; ≥฿10,000 is left alone (already stepped up). Bot `noContractDepositAmount(base,{bundle})` + `isBundleRental`; DA `noContractDeposit(base, bundle)` in backend and BookingLogScreen; website old flow uses the same rule. Active no-ID bookings in the Delivery App now show the new figure.
- Pre-existing DA test failures, not from this change: test:header-guard, bind-rental-code, sheet-write-race (need live Sheets), flex-ledger (blacklist-check version gate).

## 2026-10-02 — PS5 + Logitech G29 delivered by car; padlock warning line break (website `79aadaa`, Delivery App `ba58566`, Bot `8672087`)

- Website step 3 delivery quote: `deliveryNeedsCar()` counts the chosen PS5 bundle (PS5 + Logitech G29 → `hasLargeItem` → Lalamove CAR). The quote key includes `bundleId`, so changing the bundle quotes again. The quick-quote page already sent the bundle name; now covered by a test.
- Return-day card (`reminderFlex.ts`): "⚠️ หากรหัสแม่กุญแจถูกเปลี่ยน / จากการใช้งานหรือระหว่างขนส่ง" (EN: "…is changed / during use or during transport"). Before, LINE wrapped "งาน" onto a line of its own.

## 2026-10-02 — Quick quote: book/LINE buttons, stats on /analytics, rate limit; PS5 bundle no-ID ฿15,000 (Bot `31dc2fb`, website `c8d3430`)

- Quote page buttons: "เช็คคิวและจองเครื่องนี้" opens `https://ajgamerental.com/?consoleId=<id>&lang=..&utm_source=quick_quote`; "ส่งราคานี้ให้ร้านทาง LINE" opens @ajgame (`line.me/R/oaMessage/%40ajgame/`) with the quote typed in.
- Channel tag: add `?src=line|messenger|whatsapp|web` to the link given out on each channel.
- Events: `quick_quote_opened/calculated/delivery_failed/book_clicked/line_clicked/copied` go to the analytics sheet. `/analytics/` has tabs "🌐 เว็บไซต์" and "🧮 หน้าคำนวณราคา" (devices, days, channels, add-ons, delivery fees, vehicles, failures, actions by device). Website stats leave these events out.
- `/api/delivery/quote`: 30 per 15 minutes per IP → 429.
- No identity verification + any PS5 bundle → deposit ฿15,000 (quote page and website `calcSummary`/badge).
- Open: Bot `no-contract.js`/`line.js` and the Delivery App `noContractDeposit` still use 5,000/8,000, while the website charges 10,000/15,000. Waiting on the owner. Also waiting: whether to add returning-10%/review tick boxes to the quote page.

## 2026-10-01 — Quick quote: no identity verification (Bot `8779cde`)

- Tick box "ไม่ยืนยันตัวตน / No identity verification" (shown once a device is chosen): the deposit becomes ฿15,000 when the normal deposit is ฿4,000 or more (bundles included), else ฿10,000 — the website's unified-flow `noContractDeposit`. The hint shows "ค่าประกันเพิ่มเป็น ฿X (ปกติ ฿Y)"; the summary line reads "ค่าประกัน ไม่ยืนยันตัวตน". The old greyed no-ID row is gone.
- Bot tests green; headless TH/EN: PS5 ฿2,000 → ฿10,000, PS5+G29 ฿4,000 → ฿15,000, untick restores.

## 2026-10-01 — Quick quote: After Work, accessories, PS5 bundles, current location (Bot `d3f4773`, `0b8228a`, `992df84`)

- After Work 3 Nights: for 3 days on a device whose rate has a promo price (300→777, 350→888, 400→999, 500→1,299), a tick box "เริ่มเช่าวันจันทร์หรืออังคาร / Starts on a Monday or Tuesday" applies it as its own discount line. Not on a bundle rate.
- Accessories as on the booking site (`extrasForConsole`): Switch extras built in (side extras after "extra controllers" on Switch 2), catalogue `rentalAccessories` by device, the dock as a flat charge per rental. PS5 `rentalBundles` replace rate/weekly/deposit; a G29 bundle asks Lalamove for a car; add-ons count as a second item for delivery.
- "📍 ใช้ตำแหน่งปัจจุบัน / Use my current location" fills the map link from the phone and prices the delivery at once.
- Returning 10% / review discounts: not added — recommended as plain tick boxes without verification, awaiting the owner.
- Bot 491/491; headless TH/EN: PS5+G29 7 days ฿4,000 + deposit ฿4,000 + car; Switch 2 extras; Viture dock ฿200 flat; location → quote.

## 2026-10-01 — Quick quote: private rough-price page (Bot `65485a5`)

- `https://aj-line-oa-bot.onrender.com/quick-quote/q7Hk2mVx9Rt4Wp` (unlisted; `QUICK_QUOTE_KEY` on Render replaces the key; wrong key → 404; noindex). Not linked from the website or the Delivery App.
- Choose a device (website catalogue from the gist, same defaults as `normalizeConsole`), days (3/7/14/30 chips, 3-day minimum) and a Google Maps link → rental (monthly/weekly/daily, as `rentalCost`), deposit, no-ID deposit (฿10,000/15,000, shown greyed), Lalamove round trip via `/api/delivery/quote` (fare, AJ discount, pay; car for G29), total. No queue check, promotions, discounts or accessories. TH/EN switch, "copy the quote" text for chat.
- Bot 489/489; headless TH/EN: PS5 7 days ฿2,500 weekly, 30 days ฿6,500 monthly, <3 days blocked, delivery rows.

## 2026-10-01 — Same-day cutoff editable in Admin (website `387bdd5`)

- Admin → ปิดคิว now starts with "เวลาตัดรอบเช่าวันเดียวกัน / Same-day cutoff": a time field + save. Stored on the Bot as site content `booking-settings` = `{"rentalCutoffTime":"HH:MM"}` (generic `/api/admin/site-content/:key`, no Bot change), read on every visit (`loadBookingSettings`) and cached in localStorage (`aj_rental_cutoff_v1`) for the next visit. Default 18:00 when never set. The calendar, the queue gate and the notice "หลัง HH:MM น. เริ่มเช่าได้วันถัดไป / After HH:MM, choose tomorrow or later." follow it.
- Website 197/197; headless: a saved 10:30 is loaded and applied.

## 2026-10-01 — Payment page faster and fuller; floating button gone; cutoff 18:00; clickable contacts in emails (website `897397c`, Bot `98a58e4`, Bot `1d438af`)

- Slow "กำลังโหลดรายการเช่า…": `/api/rentals/payment-page` and `/payment-page/link` read Console Pending directly and wait at most 1.5 s for the Apps Script history mirror (`rentalForPayment(code, { forPage: true })` → `fetchBookingForPage`). A cold Render start can still add time.
- Payment page "สินค้าที่เช่า" lists the device's own detail lines (2 controllers, cables, game count…) from the catalogue, then accessories/games, as the order page does.
- The floating "เช็คคิว & คำนวณค่าเช่า" button (bottom right on scroll) is removed (`updateFloatButton` is a no-op).
- Same-day cutoff: one setting `rentalCutoffTime` (website) = "18:00" (was 20:00), used by `rentalCutoffPassed` and the notice "หลัง 18:00 น. เริ่มเช่าได้วันถัดไป / After 18:00, choose tomorrow or later." Not yet editable from Admin — the next step is a site-content key read into that variable.
- Emails (Bot `1d438af`): 081-624-4715 → tel:+66816244715, LINE @ajgame → https://lin.ee/5GGXU1T, contact@ → mailto:, in the confirmation / pay-later / identity-update emails and the My rental change email.
- Bot 487/487, website 197/197; headless: payment page item lines TH/EN, no float button.

## 2026-10-01 — Pay-later email waits 15 minutes, sheet-backed (Bot `eb184f9`, website `cc9ed38`)

- `/api/rentals/pay-later` (called by the order page after step 3 + live delivery price) now queues instead of sending: a row in the new sheet tab **Pay Later Emails** (Rental ID, Email, Language, Created At, Due At, Status, Sent At, Attempts, Note), due 15 minutes later. The Bot works the queue every minute (`pay-later-queue.js`) and reads pending rows back at start-up, so restarts/deploys lose nothing.
- At the due time it sends only if still unpaid: skipped when paid (server memory or the stored record — Beam, LINE slip), when the request is cancelled, or with no email. Statuses: sent / skipped_paid / skipped_cancelled / skipped_no_email / failed (3 tries, 5 min apart; the shop can still send from Console Pending). "Confirmed" in the request sheet is not a skip — it only means the contract was finished.
- Note under the pay button: before sending "หากยังไม่สะดวกชำระตอนนี้ ร้านจะส่งอีเมลพร้อมรายละเอียดและลิงก์ชำระเงินให้ภายใน 15 นาที (email)" / "Not ready to pay now? AJ will email you the details and a payment link within 15 minutes"; if it was already sent, the "ส่งให้แล้ว / has emailed" wording.
- The Delivery App's preview → send stays immediate (and the queued one then counts as already sent).
- Bot 484/484 (`pay-later-queue.test.js`: not before 15 min, once, paid → skipped, restart reload, retries), website 194/194.

## 2026-10-01 — Pay later without a button; queue pop-up on the link; shop preview (website `91e849f`, Bot `5975ea7`, Delivery App `54fd13b`)

- The "ชำระภายหลัง / Pay later" button is removed. After "ยืนยันและไปหน้าชำระเงิน", once the live delivery price is in and the Console Pending row with it is written, the page asks the Bot to send the pay-later email (`maybeSendPayLaterEmail`, once per Rental ID — the Bot refuses a second automatic send even after a reload). The Bot's held copy of the rental now follows the page's re-upserts (`pricingFieldsOf`), so the email and the payment page carry the delivery fee. No email if the delivery price never loads (the customer cannot pay then either).
- Under the pay button, once sent: "สามารถชำระเงินภายหลังได้ ทางร้านส่งอีเมลพร้อมรายละเอียดและลิงก์ชำระเงินให้แล้ว (email)" / "You can also pay later. AJ has emailed the details and a payment link to …".
- Email, under the payment link: "เมื่อกดลิงก์ ระบบจะเช็คคิวว่างอีกครั้ง หากคิวเต็มแล้วจะมีข้อความแจ้งเตือน" / "When you open the link, the queue is checked again. If the dates are no longer available, you will see a notice."
- Payment page (`?pay=`): the queue is checked as soon as it loads; taken dates → pop-up "คิวช่วงนี้ไม่ว่างแล้ว / These dates are no longer available" with "ติดต่อร้านทาง LINE", and the pay button is disabled. The same pop-up if the queue fills at the moment of paying (hold conflict).
- Delivery App Console Pending: the 📧 button opens a preview (recipient, subject, total, pay-now per method, payment link, full email text, "sent before" warning) with ยกเลิก / Cancel and ยืนยันส่ง / Send (sends even if sent before). Bot signed `/api/integrations/delivery-app/pay-later-preview`.
- Verification: Bot 478/478, website 194/194, Delivery App tsc; headless Chromium: queue full TH/EN → pop-up + disabled button; queue free → hold → link call → redirect. The Delivery App preview panel was not rendered in a browser.

## 2026-10-01 — Pay later: summary email + private payment page; payment status on the paid confirmation (website `b3e67ba`, Bot `3ce4131`, Delivery App `3835a02`)

- Order page: "ชำระภายหลัง — ส่งลิงก์ชำระเงินทางอีเมล / Pay later — email me a payment link". It saves the rental exactly as the pay button does (agreement filed under the Rental ID, Console Pending upsert) but holds no queue and charges nothing, then `POST /api/rentals/pay-later {contextToken}`. The note "หลังยืนยันยอดชำระ Delivery App จะย้าย… / After payment is confirmed, Delivery App creates…" is removed.
- Pay-later email (Bot, TH/EN): same layout as the confirmation — summary + itemised charges, "สถานะการชำระเงิน: ยังไม่ได้ชำระ / Payment status: Not paid yet", button "ทำรายการชำระเงินต่อ / Continue to payment" → `https://ajgamerental.com/?pay=<Rental ID>&t=<token>` (HMAC `pay:` purpose, 400 days, does not open My rental). No PDF, no My rental, no identity link. Resend guard 10 min. Recorded as `paymentPendingEmailSentAt`.
- Payment page (website `?pay=`): rental as quoted, read from `POST /api/rentals/payment-page` (cache or Console Pending), same picker (reservation ฿200/EN ฿1,000, or full by bank / card +3.50% / e-wallet +2.95%; no Wise). Pay → queue check (`ensureBookingHold` with the rental's console/dates; `consoleId`/`startIso`/`endIso`/`bundleId` now in `bookingStructured`, older rows matched by name) → `POST /api/rentals/payment-page/link {token, method}`: the Bot computes the amount (`paymentPlan`, `expectedBeamAmount`), saves paymentOption/upfront/onDelivery/total on the rental, returns the Beam link (normal payment-success flow).
- Paid confirmation email (with the agreement PDF) adds "สถานะการชำระเงิน: ชำระเงินแล้ว (ยอดเต็ม|ยอดจอง) ยอด X บาท" and "ยอดคงเหลือ: Y บาท" when a balance is left / "Paid (full amount|reservation) THB X", "Balance due". Reservation vs full from the Beam method (`cash` = reservation).
- Console Pending sheet: columns ชื่อลูกค้า / เบอร์โทร / อีเมล / Line Unique ID added if missing and filled on every upsert (blanks never overwrite).
- Delivery App Console Pending card: shows อีเมล, and while unpaid a button "📧 ส่งอีเมลสรุปรายการ + ลิงก์ชำระเงิน" → Bot signed `/api/integrations/delivery-app/pay-later-email`. Use it for AJ-20261001-R0004 (could not be sent from the sandbox — production is unreachable from here). If the card shows no อีเมล, the request has no email in its data.
- Verification: Bot 476/476 (`pay-later.test.js`), website 192/192 (`pay-later.test.mjs`), Delivery App tsc + console-pending suites; headless Chromium 400px TH/EN of `?pay=` with the API mocked (layout, picker, credit → link call with `{token, method}` only, redirect).

## 2026-10-01 — VIP rate on extensions; Blacklistseller screening built but off (Delivery App `7493b03`/`7871994`, Bot `91f075c`)

- "เช่าต่อ": a VIP member (looked up on the Bot) extends on their VIP daily/weekly rate for the device, with no returning 10% on top (website rule); never for a bundle. Page, server quote, request and the extension card ("ค่าเช่าราคา VIP") follow. Everyone else unchanged. Preview `/c/extension?demo=1&vip=1`. `test:extension-pricing` 26/26.
- Blacklistseller (paid credit) — OFF until `BLACKLISTSELLER_ENABLED=true` + `BLACKLISTSELLER_API_KEY` on the Bot's Render. When on, every identity submission (booking flow photos, and verify-later) runs: idcard-summary (Thai 13-digit ID; passports by name only) and fullname-summary (`fullname` + `firstname`/`lastname`), plus earlier rentals with AJ from the contracts sheet (same ID, phone or full name). Result → email/Telegram/Discord ("🚨 พบรายงานใน Blacklistseller" / "🛡️ ผลเช็คตัวตนผู้เช่า", ID masked), logged in tab "Blacklistseller Checks", forwarded to Delivery App `/api/integrations/aj-rental/blacklist-check` → push to shop devices + Fraud Report finding when reports found (ID strong, name weak).
- Past customers on demand only: `POST /api/admin/blacklistseller/check-past` (admin token) `{limit, dryRun}` — dry run by default (lists who, no credit); skips people already in the checks tab.
- Not verified against the real API: the docs site and API are blocked from the sandbox. Field names come from the docs screenshot (`idcard`); the fullname body and the response shape are assumed — the count is read from any total/count field and the raw answer is shown when unknown. Confirm with the docs' Request Parameters / sample response before switching on.
- Bot 469/469 (`blacklistseller.test.js`), Delivery App `test:blacklist-intake` 5/5, `tsc` clean.

## 2026-10-01 — VIP prices on every booking, not only website ones (Delivery App `4463b33`, Bot `82e7329`)

- Booking 543 still showed ค่าประกัน ฿2,000: it was created before `a40a548`, and the booking form had no way to set a VIP deposit. The Edit/Add Booking form now has a "👑 สิทธิ์ VIP" section: ค่าประกัน VIP (blank = normal) and ส่วนลดราคาเช่า VIP, saved to the `VIP Deposit` / `VIP Rental Discount` columns, so the confirmation card and "คิวเช่าของฉัน" (TH/EN) follow. Summary shows ส่วนลดราคาเช่า VIP, ค่าประกัน (VIP), and the delivery discount (new field ส่วนลดค่าจัดส่ง).
- Members are looked up automatically: Bot `GET /api/vip-entitlement?phone=&lineUserId=` (HMAC of `vip-entitlement|phone|line` with `AJ_RENTAL_WEBHOOK_SECRET`); Delivery App `vipService` prices it like the website (VIP rate per catalogue id / ps5 / *, never on a bundle; deposit by normal deposit for all or ticked devices; catalogue matched by model name from the gist). The extras offer carries `vip`; a new booking or a clone is filled automatically (re-priced as dates/device change, until the shop types); a saved booking gets a "ใช้ราคา VIP ของลูกค้า" button.
- Console Pending: website requests keep the website's figures (what the customer paid); a request the website did not price (LINE chat, payment-only) looks the member up.
- A VIP rate replaces the returning 10% (backend `bookingCharges` and form), as on the website; a VIP deposit alone keeps the 10%.
- Not changed: extensions (เช่าต่อ) still use catalogue rates.
- Verification: `test:vip-charges` 36/36, Delivery App backend/frontend `tsc` clean, console-pending/confirm/my-rental suites pass; Bot 460/460. Booking form not rendered in a browser here.

## 2026-09-30 — VIP deposit and rate on the card, My rental and email; every discount itemised; wireframe (website `25d0cb6`, Delivery App `a40a548`, Bot `fe65d0b`)

- Root cause (booking 543, AJ-20260930-R0021): the Delivery App's Rental Fee and Deposit are sheet formulas from the catalogue, and nothing carried the VIP rate or VIP deposit (฿1,000) from the website, so the card and My rental showed catalogue prices. The website's costs also showed the VIP price as "ค่าเช่า" and then subtracted the VIP discount again (double-counted in the rows, total was right).
- Website: the rental row is now the list price (`regularRental`) with a "ส่วนลดราคาเช่า VIP / VIP rental rate discount" row; `bookingStructured` carries `vip.deposit` and `deliveryQuote {subtotal, discount, total, serviceType}`.
- Delivery App: new Booking Log columns `VIP Rental Discount`, `VIP Deposit`, `Delivery Discount` (created on the next schema read). `bookingCharges` takes the VIP discount off before the returning 10%, and uses the VIP deposit instead of the catalogue deposit (no-contract step-up from it). Console Pending confirm passes them on (VIP rate dropped if the dates were moved; delivery discount only if the fee is unchanged; the quote warns). Confirmation card and My rental (`costLines`) list: rental, VIP rate discount, returning 10%, each review discount, add-ons/bundles, deposit "(VIP)", Lalamove round trip, ส่วนลดค่าจัดส่ง, ค่าจัดส่งที่ชำระ — Thai and English. `test:vip-charges` 23/23.
- Bot: confirmation email money rows come from `rentalChargeLines` (website cost rows by name + rental total + deposit + delivery fare/discount/paid + payment fee), TH/EN. Bot 459/459.
- Booking 543 already exists: enter `1000` in its `VIP Deposit` cell (and any VIP rate discount) by hand; older VIP-rate requests in the log still carry the double-counted rows.
- Wireframe of the whole system in Thai (website 7 pages, Bot contract/verify/LINE cards/email, customer LINE pages, Delivery App shop pages, system map and journey, boards linked to each other): https://claude.ai/artifact/MAhsAv7eorH1A9DV5AHzp7 (private until shared from its Share menu).

## 2026-09-30 — Verify-now full step 3, return check, per-device quote prices, picker at large text (website `5386223`/`b967401`, Delivery App `c59d8fa`/`d732b10`, Bot `e619aa1`)

- Confirmation email CC: now ajgamerental2021@gmail.com only (contact@ajgamerental.com dropped — same mailbox, so every email arrived twice). Render's `RENTAL_CONFIRMATION_CC`, if set, overrides the default.
- Delivery details page: the delivery date is shown as text (hidden field keeps the value) — Safari on iPhone opened the calendar for a readonly date field. Confirm pages too.
- Website "ยืนยันตอนนี้ / Verify now" (Rental ID page, verify-later renters): the pop-up now holds the photos plus the step-3 agreement card itself (refund terms, Thai bank, English "I do not have a Thai bank account…" with full Wise details and payout choice, consent, signature). The card is moved into the pop-up and back on close (`lendAgreementCard` / `returnAgreementCard`, also in `showModal`/`closeModal`). Missing fields use step 3's messages; submit re-sends the agreement with the current refund + signature, then the photos. Headless check TH (bank, submit → agreement + identity POSTs, card back in step 3) and EN (Wise panel, 7 fields).
- Delivery App return job: closing a return first calls `GET /api/bookings/:row/return-check` (`returnCheckService`): refund (transfer + cash) ≠ booked deposit (`bookingCharges().deposit`), and return date ≠ confirmed return date. Warnings → modal "เช็คแล้ว / ยกเลิก" → the close dialog shows "ยืนยันอีกครั้ง…" before "ยืนยันจบงาน". Confirmed date: new column D `returnDate` on `Booking Confirm Sent` (written from now on), else first applied extension's `oldReturnDate`, else the request log's "วันที่คืน". Admin (canEdit) only; a failed check never blocks. `test:return-check` 8/8; frontend `tsc` clean (deps installed locally for the check).
- Quotation: "ตั้งราคาเอง" with 2+ devices → one price per device line (all units, whole rental, pre-VAT) sent as `agreedPrice`; add-ons stay inside agreed prices. Single device keeps the one total. `test:quotation-pricing` 40/40.
- Game picker at large text: LINE/Safari larger text zooms the page (iPhone 15 ≈ 260–330px CSS). `@media (max-width:360px)` stacks the picker head (title + X, buttons row, wrapping warning) and wraps consoles (no sticky "more" over names); game_index `@media (max-width:340px)` puts the footer's last button full width. Headless 393/314/262px TH/EN. The blank head in the customer's screenshot could not be reproduced exactly (no WebKit here); the overlapping rail and cut buttons were.

## 2026-09-29 — One confirmation card per booking; delivery fee on My rental; date changes follow queue and closures (Delivery App `0efcfc1`, Bot `70deb52`)

- Duplicate card (booking 542, 19:05): a paid web rental made two automatic sends — `booking_created` when the payment created the booking, and `contract_signed` when the contract made from the same payment arrived (its own marker, no check of the card marker). All automatic senders (`booking_created`, `contract_signed`, `line_link_catchup`, `paid_web_line_link`, `payment_match`) now use `onceOnly`, and `withConfirmTurn` serialises them per booking so the second reads the first's marker. The shop's manual send is unchanged (in-process lock; one Render instance).
- Duplicate email (19:06): the card and email are separate systems (card: Delivery App; email: Bot), so the card was not caused by the email. The Bot sends once per rental (`completePaidRental` guard). Two possible causes, not confirmed without logs: (a) the Bot retried from the account address after any error, including a timeout after the email had gone — now only when the Apps Script says nothing was sent; (b) the shop gets two copies: CC to contact@ajgamerental.com (an alias of the Gmail account, likely forwarding there) and CC to ajgamerental2021@gmail.com. If the two emails show the same From, it is (b): remove one CC (`RENTAL_CONFIRMATION_CC` / `BOOKING_EMAIL_CC` on Render) — owner's decision.
- My rental: "ค่าจัดส่งไป-กลับ / Round-trip delivery" between rental fee and deposit when the booking has a fee.
- Date changes: "เปลี่ยนวันเช่า / Change dates" and the proposal card's "แก้ไขวันเช่า" page show a calendar of start days (±15-day window, from tomorrow) marked ว่าง/ไม่ว่าง/ปิดคิว (Free/Full/Closed) for the current number of days (`startDayOptions`: a unit of the model free for the whole span + closure on the delivery or return day). Grey days cannot be picked; changing the number of days redraws it. Preview/commit (`quoteModification`) and proposals (`proposeStartDateChange`, reason `queue_closed`) refuse closed days server-side too. Closure rules: Bot `/api/queue-closures`, matched to the website catalogue (public gist `aj_rental_data.json`, by model name → id/type), website semantics (`queueClosureService`). If either cannot be read, nothing is blocked (logged). Not checked live from here (sandbox proxy blocks both URLs).
- "แก้เวลา/สถานที่ส่ง": date read-only, server refuses a changed date (`date_locked`) — date moves go through "เปลี่ยนวันเช่า". "แก้เวลา/สถานที่รับคืน": any day from max(today, start) to the return date; later → extension (as before); before start refused (`before_start`).
- Verification: Delivery App `tsc` clean; `test:queue-closures` 19/19 (new), `test:contract-signed` (new one-card test incl. concurrent turn), `test:my-rental-link` 110/110, `test:date-change` 51/51, `test:return-window` 23/23, `test:rental-change`, `test:paid-booking-line`; Bot 456/456 incl. new `customer-email-once.test.js`. Headless Chromium 400px TH/EN: modify calendar (demo) disables Full/Closed days and reloads on a new day count; delivery date read-only with the note; return date min/max set.

## 2026-09-29 — Rental extension priced on the whole rental (Delivery App `48f9fd0`)

- "เช่าต่อ / Extend" (Rich menu, My rental and the reminder card all open `/c/extension`) used to charge daily rate × extra days. It now prices the whole rental — days already covered (Booking Log start → current return date) + the extra days — on the booking site's rate card (`rentalTariff`: 30 days at the monthly price for ฿300/350/400/500 daily rates, then weeks at the unit's Inventory weekly rate, then days), and charges only the difference. PS4 3 days + 4 = 7 days: ฿1,500 − ฿900 = ฿600, not 4 × ฿300. The returning 10% and the payment fee still apply to that difference, so the page shows ฿540 for that example — say if the 10% should not apply to extensions.
- The day list marks choices that make the rental whole weeks or a month: "4 วัน · รวม 7 วัน เรทรายสัปดาห์" / "4 days · 7 in total, weekly rate". The rate row shows day and week prices; the summary shows "ค่าเช่ารวม 7 วัน (เรทรายสัปดาห์)", "หักค่าเช่า 3 วันเดิม", then the discount, fee and total. The shop/customer card's first money row is now "ค่าเช่าก่อนส่วนลด / Rental before discount".
- "Already covered" uses the list price, not what was actually paid (VIP or promotions are not re-read), and a unit with no weekly rate uses seven daily rates. Like the booking site, 13 days can cost more than 14.
- Verification: new `test:extension-pricing` 20/20, `test:extension-queue` 11/11, `tsc` clean; the demo page (`/c/extension?demo=1`) checked in headless Chromium at 400px in Thai and English, including switching language on the page.

## 2026-09-29 — Console Pending shows the delivery fee; names with digits caught on the page (website `35ee401`, Delivery App `b12281c`)

- Case: AJ-20260929-R0027 (PS4, 18:32) appeared in Console Pending while the renter could not get past "ยืนยันและไปหน้าชำระเงิน". Console Pending is written by design the moment step 3 is confirmed (status Pending / รอโอนเงิน), before the agreement and payment, so the shop can follow up on renters who do not finish. The renter's tries (18:32–18:44) were all before the step-3 fixes above went live (~18:45); their phone was first +66635399435 (refused then). Their name ended in "0" (ปริวัฒน์ ภิรมย์บูรณ์0): the contract takes that, but the refund account name must be letters only, so the same name there would also be refused. The signature running outside the box does not matter.
- Delivery fee: the website only fetched the live price after the order page opened, so a renter stuck at step 3 left ค่าจัดส่ง 0; and the Delivery App card always started ค่าจัดส่ง empty (and wrote it back empty on Confirm) even when the request had a fee. Now the quote starts with the agreement, the Console Pending row is written again when it arrives (`queueConsolePendingUpsert`, sequential writes, prices re-read from `bookingStructured`), and the card starts with the quoted fee.
- Step 2 refuses digits in the name ("ชื่อ-นามสกุลต้องไม่มีตัวเลข / The name must not contain numbers."); step 3 checks the refund account name with the Bot's letters-only rule ("ชื่อบัญชีต้องเป็นตัวอักษรเท่านั้น ตามที่ธนาคารแสดง"). Phones typed +66 / 0066 / 66… are sent as 0… (`thaiPhoneText`).
- Verification: website 185/185; headless Chromium with the APIs mocked: the name and account-name errors show, then with fixed names the confirm writes Console Pending twice — first total 2,900 / fee 0, then 3,028 / fee 128 after the quote — phone sent as 0635399435. Delivery App frontend has no installed toolchain here (tsc not run); the change is two lines.

## 2026-09-29 — Step 3 "บันทึกสัญญาไม่สำเร็จ" fixed at the causes (Bot `d7fb5aa`, website `c74d96d`)

- The toast "บันทึกสัญญาไม่สำเร็จ กรุณาตรวจบัญชีรับเงินคืนและลายเซ็น แล้วลองใหม่" was shown for every refusal of `POST /api/booking-context/:token/agreement`, whatever the real field. Three real causes, none about the refund account or signature:
  1. The full ID number lives only in the Bot's memory (`identityDrafts`, 24 h); today's restarts/deploys emptied it while open pages still showed "บันทึกไว้แล้ว (ลงท้าย …)", so the contract had no `idNumber`. The page now checks the saved number before sending (`ensureIdentityDraftAlive`: re-saves a number typed on the page, or `GET /api/identity-drafts/:id`); if the Bot no longer has it, the renter is taken to step 2 to type it again. No agreement request is made in that case.
  2. "ไม่ต้องการระบุที่อยู่ ตำแหน่งจากลิงก์ Google Maps ถูกต้องแล้ว" sent an empty address and the contract requires one — every such booking failed. The contract now reads "ตามหมุด Google Maps / As pinned on Google Maps" with the pin's link beside it.
  3. A phone written as +66… (11 digits), or a number from abroad on a Thai-language booking, failed the contract's phone rule. `thaiPhoneDigits` turns +66 / 0066 / 66… into 0…; a foreign number is kept as the contact (`noThaiPhoneNumber`) in either language — the schema no longer ties that flag to English (the LINE form still only offers it in English). This also fixes the verify-identity page for renters like +33….
- The toast now names the field and moves to it, in Thai and English (ID number/expiry, name, phone, email, address/Maps → step 2; console/dates → step 1; refund, signature, consent, timed-out session → step 3). The same handling applies when the agreement is re-sent at payment for a changed rental. Toasts can stay longer (`toast(msg, ms)`; these stay 5 s).
- The Bot logs `Agreement incomplete for <Rental ID>: <fields>` (field names only) so the next refusal is visible in the logs.
- Not changed: drafts are still memory-only by design (no ID numbers on disk). Which of the three hit the customer in the owner's screenshot is not known.
- Verification: Bot 453/453 (new: +66/0066/66/foreign numbers in TH and EN, pin-only address TH/EN, log line); website 182/182 incl. new `agreement-error-recovery.test.mjs`; headless Chromium 400px TH/EN: a dead draft id at step 3 → one `GET /api/identity-drafts/…` 404, no agreement POST, back to step 2 with the ID field marked and the bilingual toast; a refused `phone` → step 2 with the phone field marked.

## 2026-09-29 — Verify-identity page: faster, step-2 address, step-3 refund (Bot `d71dad7`)

- Slow "กำลังโหลด…": the page waited for the history mirror through Apps Script, then the device sheet, one after the other. It now reads Console Pending directly, waits at most 1.5 s for the history mirror, and reads devices in parallel (`fetchBookingForPage`). Submit still reads the full record.
- Rental ID / Device / Rental period (รหัสการเช่า / เครื่อง / ช่วงเช่า) on separate lines.
- Address (only when the booking has none): same as booking step 2 — postal code → subdistrict list → district and province filled in (free entry outside the list), house/building line, and the booking's Google Maps link prefilled. "ไม่ต้องการระบุที่อยู่ ตำแหน่งจากลิงก์ Google Maps ถูกต้องแล้ว / I don't need to enter an address — the Google Maps link is exact" hides the address fields; the pin becomes the contract address. The postal data is a copy of the website's `assets/data/service-area-addresses.json` at `public/assets/data/` in the Bot — update both together.
- Refund: same as booking step 3 — the refund-terms box, Thai bank (6–13 digits), and on English bookings "I do not have a Thai bank account and would like to receive the security deposit refund through Wise" with the Wise Refund Details (Full Name, Country, Currency, Bank Name, Account Number / IBAN, SWIFT, Email) and bank / email / link payout.
- Verification: Bot 449/449; headless Chromium at 390px, Thai with address, English with the pin only and Wise, English with address and Wise — all submit the expected payload.

## 2026-09-29 — My rental: missing Rental ID recovered, verify button shows (Delivery App `e805957`)

- Root cause of "no ยืนยันตัวตนเพื่อลดค่าประกัน button" on booking 541: its Booking Log row had no Rental ID (it is R0057). The verify link, like the game list and contract lookup, is keyed on the Rental ID, so none was built — and the page had no code to show either. Why that row was saved blank is not known (every creation path in the code writes it); worth checking how 541 was made.
- A running rental with no Rental ID now recovers it from the Bot's request log (`Line / WhatsApp LOGs`): same phone (from ข้อมูลจอง) and same start date, not cancelled, not already on another booking, exactly one answer (`rentalIdForUncodedBooking`). The code is written back to the booking row, so this happens once. The verify button, games and contract lookup then work.
- The Rental ID row now always leads the rental's details, above เลขที่การจอง / Booking no. ("-" when there truly is none), on the customer's page (LINE and link) and the shop preview.
- Verification: `test:my-rental-link` 108/108 (recovery from a fake log with a cancelled row, another customer's row and an already-booked code; write-back; verify URL; row order), `tsc` clean, all other Delivery App test scripts unchanged.

## 2026-09-29 — My rental: "Pick games again"; a no-identity renter can verify later and lower the deposit (Bot `5c48ec7`, Delivery App `93dabff`)

- Delivery App My rental (LINE rich menu and the no-sign-in link alike): the games button reads "🎮 เลือกเกมใหม่ / Pick games again" once the rental has games (`selectedGamesFor`, shared with `getSelectionState`).
- A rental taken without identity verification shows, under the deposit: "คุณเลือกไม่ยืนยันตัวตน จึงใช้ค่าประกันที่สูงขึ้น ยืนยันตัวตนตอนนี้ ค่าประกันจะลดเหลือ {standard}" / "You chose not to verify your identity, so a higher deposit applies. Verify now and it comes down to {standard}." plus "🪪 ยืนยันตัวตนเพื่อลดค่าประกัน / Verify identity to lower the deposit" (active rentals with a Rental ID). History keeps the note without the button.
- The button opens the Bot's `/verify-identity/<token>?lang=` — signed with `AJ_RENTAL_WEBHOOK_SECRET` under purpose `aj-identity-upgrade:` (never usable as a My rental link, Rental IDs only; test vector shared by both repos). It is separate from the verify-later photo link. The page asks for document type/number/expiry (must expire after the return date), ID photo + selfie, any contract details the booking lacks (name/email/address), a deposit refund account (Thai bank, or Wise email on English bookings — the contract requires one), consent and a signature.
- On submit (`POST /api/identity-upgrade/:token`): validate → file the photos (no background save, no separate alert) → create the signed contract → save the rental once with the deposit, total and balance on delivery reduced (`identity-upgrade.js`; overpayment kept as `depositRefundDue`) → email the renter "ยืนยันตัวตนเรียบร้อย ค่าประกันปรับเป็น … / Identity verified, deposit now …" with the agreement PDF (CC as usual) → one Telegram + Discord alert with the deposit and balance change and any refund owed. The contract reaches the Delivery App through the existing contract-signed forward, which now clears "ไม่ทำสัญญาเช่า"; the Booking Log, delivery queue and My rental then show the normal deposit and the "ดูสัญญาการเช่า" button. The shop also gets the usual new-contract alert, and the photos wait for review as with any identity upload.
- The standard deposit: `depositBeforeNoContract` (recorded from now on when no identity is chosen) → the device's catalogue deposit when stepping it up matches → the step-up read backwards (฿8,000 → ฿4,000, ฿5,000 → ฿2,000).
- Verification: Bot 447/447 (new identity-upgrade tests: token vector and purpose separation, deposit/total/balance maths, refund due, email TH/EN, shop message, route order); Delivery App `tsc` clean, `test:my-rental-link` 103/103 (games label, note, verify URL) and `test:contract-signed` (no-contract cleared, deposit 8,000 → 4,000); every other Delivery App test script unchanged (header-guard and bind-rental-code need Google credentials and fail on main too). Headless Chromium at 390px: the verify page submits correctly in Thai (bank) and English (Wise) with the Bot running locally and the API mocked; the Delivery App page renders the note, button and "เลือกเกมใหม่" in both languages. Not yet run against real sheets/Drive — first real use should be watched.

## 2026-09-29 — Game picker: every picked game visible on phones, one-line buttons, numbered covers

- Root cause (iPhone/Android): the picked-games chips sat in a box capped at `max-height: 52px` (44px inside the booking site's embedded picker) with its own scroll, and "สร้างข้อความเพื่อแจ้งทางร้าน" wrapped the button row to two lines. Only the first row of picks showed.
- Rebuilt rather than overridden: one `<ol class="pick-selected-list">` component; phones use two even columns (number · name cut with … · ✕ button), wide screens keep full names wrapping as before. No height cap or inner scroll in the base, phone or embed CSS — the embed layer's own footer sizing was removed so the phone block is the single source. 10 picks = 5 rows ≈ 176px at 390px.
- Button labels live once in `TRANSLATIONS` (th/en) and are rendered by `renderPickActions()` for every mode: "ล้างทั้งหมด / Clear all", "📋 แจ้งร้าน / 📋 Notify AJ", "✅ ใช้รายการนี้ / ✅ Use this list", and for the Delivery App token / booking-card picker "ส่งรายการเกม / Send games", "กำลังส่ง... / Sending…", "✓ บันทึกแล้ว / ✓ Saved", "ส่งรายการใหม่ / Send update" (state `pickSubmitState`). The embed script no longer keeps its own copies of these labels or swaps the button's onclick; `pickPrimaryAction()` decides. How-to text updated to the new label.
- Selected covers (grid and list view) show the pick number instead of ✓, matching the list.
- `gamePickerVersion` → `20260929-3` on the production and demo booking pages.
- Verification: 180/180 website tests; every inline script in game_index.html passes `node --check`; headless Chromium at 390×844, 412×915, 360×740 (TH and EN, and a token link): 10/10 names visible, buttons one line (38px), no horizontal scroll; tapping numbers covers in order and removing one renumbers; PC 1030px keeps full names.

## 2026-09-29 — Returning LINE renters see their saved details; identity step greyed when not needed

- Root cause of "LINE connected and discount verified, but the whole form is still open": the saved address arrives as one line; the postal code filled in, but a postal code with several subdistricts (10510 has seven, in two districts) left แขวง/ตำบล blank, so the details counted as incomplete and the summary card never showed. After a reload the subdistrict list was also never reloaded ("กรอกรหัสไปรษณีย์ก่อน" beside 10510).
- Now: the area names in the address text pick the subdistrict and district (`demoAddressGuess`; longest name wins, e.g. ทรายกองดินใต้ over ทรายกองดิน); if it still cannot be split, the saved one-line address is accepted on its own (`addressFromProfile`, persisted; cleared once the customer edits any address field) and sent once, not doubled with the area fields (`demoAddressText`). The postal lookup re-runs on load, and a verified returning renter keeps the summary card after a reload. The no-address option now also counts as complete.
- Step 3 "ยืนยันตัวตน / Identity verification" is grey, disabled and labelled "ไม่ต้องยืนยัน / Not needed" whenever `demoIdentityStepSkippable()` (valid agreement on file, which already excludes an agreement over a year old or an expired document, or the no-identity choice). The page never stays on step 3 in that case.
- Verification: website 179/179; inline JS `node --check`; walked in headless Chromium at 420px with a mocked returning LINE profile (address "Djcj ทรายกองดิน เขตคลองสามวา กรุงเทพมหานคร 10510" → ทรายกองดิน / เขตคลองสามวา, summary card shown, only the Rental Terms tick left; step 3 disabled for valid agreement and for no-identity, enabled otherwise).

## 2026-09-29 — "คัดลอกลิงก์" shows that it is working

- Making the link is a call to the Bot and can take several seconds (longer when Render has put it to sleep). The popup now opens the moment the button is pressed, in a busy state: grey backdrop, spinner, "กำลังสร้างลิงก์และคัดลอก…" / "Creating and copying the link…" and "รอสักครู่ อาจใช้เวลาหลายวินาที" / "One moment, this can take a few seconds." There is no button, and backdrop, Escape and the picker behind cannot be used. When the link is on the clipboard it becomes "คัดลอกลิงก์แล้ว" with "รับทราบ" / "Got it". If the Bot fails or takes over 45 s, the popup closes with "สร้างลิงก์ไม่สำเร็จ ลองใหม่อีกครั้ง". A second press while busy is ignored.
- Verification: 177/177 tests. Headless Chromium at iPhone size, TH and EN, with a Bot delayed 3 s: busy at 0.4 s, still busy after a backdrop tap and Escape, the picker's close button covered, then done with the button. With a failing Bot: closes with the error toast.

## 2026-09-29 — Shared game list: "คัดลอกลิงก์ / Copy link" saves every tap

- In the booking site's game picker, the copy button now reads "คัดลอกลิงก์" / "Copy link" (with text on a phone too). Pressing it saves the games picked so far (every console) into a **new private list** on the Bot and copies `?games=1&console=…&pick=<id>`. Every press makes another, separate list.
- From then on, and for anyone who opens the link (another phone, a friend), each tap on a cover adds or removes that one game straight away. There is no save button. "ล้างทั้งหมด" clears that console. After a copy, a popup explains this and is closed with "รับทราบ" / "Got it". There is no status bar over the games; a failed save shows a toast asking to tap again. Open windows pick up each other's changes every 5 seconds. Console chips show how many games each console has, and a console with games stays visible when the row is folded.
- The folded console row is one line: PS5, Nintendo Switch 2 and "เครื่องอื่น +N ▾" / "More +N ▾". If a narrow screen still runs short, the chips scroll under "More", which stays pinned at the end.
- A list is kept **7 days after its last change** (`GAME_PICK_SESSION_TTL_MS` in the Bot). "ใช้รายการเกมนี้" continues into the booking with that console's games, as before. An expired or unknown link shows "ลิงก์เลือกเกมนี้หมดอายุแล้ว…" and opens the picker empty.
- Bot: `src/services/game-pick-sessions.js` (single-game toggle operations, so two people tapping at once both land; 10 games per console; an 11th is refused, not dropped). Stored in the Google Sheet tab `Game Pick Sessions`. `POST /api/game-selection/sessions` (40 per IP per hour), `GET`/`PATCH /api/game-selection/sessions/:id`.
- The "วิธีเลือก" / "How to" button is smaller in both languages.
- Verification: website 176/176 and Bot 438/438 tests. End to end in headless Chromium at iPhone size, TH and EN, with two separate visitors against the Bot's real store module: copy saves 2 PS5 games; a Switch 2 tap saves with no button; the second visitor sees them, adds one and removes one; the first sees the same list within the poll; a second copy is a separate list; "ใช้รายการเกมนี้" enters the booking.

## 2026-09-29 — Game picker fits a phone: grid gets the height, nothing overlaps

- A customer's screenshot (LINE in-app browser, booking site → เลือกเกม, all consoles) showed one cut-off row of games that could not be scrolled, the "คัดลอก URL เลือกเกม" button on top of "ล้างทั้งหมด", three-line footer buttons and oversized text.
- `index.html`: the copy-URL button moved into the picker header (icon only on a phone). On a phone the storage warning is one line under the title, and the console chips are smaller. All consoles are still listed at once (the earlier decision not to hide them in a scrolling row stands). `html{text-size-adjust:100%}` stops iOS from enlarging text on its own.
- `game_index.html`: covers default to small (`aj_pick_size`, when the renter never chose). Inside the booking-site window on a phone, the sort chips are one scrollable row and the footer buttons are one row of small text. `gamePickerVersion` → `20260929-1`.
- Console row (booking site, browse mode): starts folded to PS5 and Nintendo Switch 2 (`GAME_PICKER_FEATURED_PLATFORMS`, by game platform) plus the console being viewed, followed by "เครื่องอื่น +N ▾" / "More consoles +N ▾". Expanded, it lists them all, with "ย่อ ▴" / "Show fewer ▴". It resets to folded each time the picker opens.
- The "กดเพื่อดูเกมได้เต็มจอ" / "แสดงวิธีเลือกเกมอีกครั้ง" toggle is gone: its markup, state (`aj_pick_details_collapsed_v1`), CSS and the TH/EN `tut_focus_tip_html` note that pointed at it. The how-to box is hidden unless the booking site's "วิธีเลือก" / "How to" button asks for it (`AJ_PICKER_HOWTO` → `showPickTutorial`). The embedded picker's header has no padding of its own, so it is as tall as what it shows (0 in browse mode).
- Measured at iPhone 13 size: grid height 179px → 345px in the booking-site window, and 43px → 453px for the Delivery App's `?t=` picker link. Touch-drag scrolling of the grid is verified. Desktop is unchanged apart from the copy button now sitting in the header.
- Verification: 170/170 tests (two version pins updated to `20260929-1`), inline JS `node --check`, headless Chromium at 390×664, 390×560 and 1366×820.

## 2026-09-28 — "คิวเช่าของฉัน / My rental" as a no-sign-in link (email, Admin, Delivery App)

- One link per rental: `https://aj-line-oa-bot.onrender.com/my-rental/<token>?lang=th|en`. The token is deterministic, signed with the secret the Bot and Delivery App already share (`AJ_RENTAL_WEBHOOK_SECRET`, HMAC-SHA256 over `"aj-my-rental:" + payload`, payload `{"v":1,"r":"<Rental ID>"}` or `{"v":1,"b":"<Booking ID>"}`), carries no phone or LINE id, and binds nothing. Bot module `src/services/my-rental-link.js`.
- The confirmation email now has a red "คิวเช่าของฉัน" / "My rental" button (text version too) instead of the old "เช็ครายการเช่า" link. Admin → Rentals shows the link with Open (ไทย / English) and Copy buttons. The website's own Menu item and pop-up are renamed "คิวเช่าของฉัน" / "My rental".
- Where the link lands is `MY_RENTAL_PAGE` on the Bot: `website` (default now) redirects to the booking site's rental page (`?myRental=…&t=…`); `delivery-app` redirects to the Delivery App's `/c/my/r/<token>`. Booking-ID tokens always go to the Delivery App. A bad token gets a bilingual notice (410). The LINE rich-menu page is untouched and still asks the binding questions.
- **Waiting on the Delivery App:** prompt at `docs/DELIVERY-APP-MY-RENTAL-LINK-PROMPT.md` in the Bot repo (token spec with test vector, `/c/my/r/:token` page with the same data/design as `/c/my`, token-scoped actions, open/copy buttons on the booking and customer screens). After it ships, set `MY_RENTAL_PAGE=delivery-app` on the Bot in Render.
- Verification: Bot 422/422 (token round-trip, forgery, fixed vector, email button TH/EN, route and Admin fields); website 170/170; inline JS `node --check`; local Bot run: Rental-ID link → 302 to the booking site rental page, Booking-ID link → 302 to the Delivery App, bad token → 410 notice.

## 2026-09-28 — VIP members get their LINE Unique ID automatically

- Opening Admin → VIP: for every member whose LINE Unique ID is blank, the Bot searches the contracts, the booking log (`Line / WhatsApp LOGs`, including the booking JSON) and the Delivery App customer sheet. A phone match wins (newest row in that priority order; `+66` and dashes are normalised). A name match (titles such as คุณ/นาย and spacing ignored) is used only when every row with that name points at the same LINE account. An account already held by another member is never offered, and an existing value is never overwritten. Found IDs are saved to the `VIP Customers` sheet straight away, so LINE sign-ins are recognised as VIP without pressing Save; the form shows a green "ใส่อัตโนมัติจาก… (เบอร์โทรตรงกัน / ชื่อตรงกัน)" note.
- Typing a new member's name or phone (on leaving the field) asks `POST /api/admin/vip-customers/line-lookup` and fills the blank LINE field; that one is kept only after Save VIP members.
- Verification: Bot 417/417 (matcher unit test covers phone, +66, name with title, ambiguous name, taken account, existing value); website 169/169; inline JS `node --check`; Admin VIP tab walked in headless Chromium with the Bot mocked.

## 2026-09-28 — LINE connect returns to the booking, email format enforced, no-contract reminder removed

- Connect LINE / เชื่อมต่อ LINE on step 2 called `liff.login()` with no return address, so outside the LIFF browser LINE sent the customer to the LIFF's home (the Before rent screen) and the booking looked lost. It now saves the draft and the current step (`aj_line_connect_return_v1`, 15 minutes), logs in with `redirectUri` = the booking URL (`?booking=1&lang=…`), and on return finishes the login inside the normal eligibility check, reopens the same step, shows "LINE: <name>" on the customer card, toasts "เชื่อมต่อ LINE แล้ว" / "LINE connected", and removes LINE's login parameters from the address bar. The shop announcement is not reopened on that return (it was seen before leaving).
- Email must look like name@domain.tld (letters-only ending). A wrong address shows "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบ เช่น name@gmail.com" / "This email address is not valid…" as soon as the customer leaves the field, and continuing stays blocked as before.
- Removed the "ลูกค้ายังคงต้องยอมรับเงื่อนไขการเช่าของทางร้าน" / "You must still accept AJ's Rental Terms." box under the no-identity choice.
- Verification: 168/168 website tests; inline JavaScript passes `node --check`; walked in headless Chromium at 400px with APIs mocked (bad email flagged on blur and cleared when fixed; simulated LINE return lands on step 2 with typed details kept, LINE name shown and the toast). Real LINE sign-in still needs a check on a phone: the LIFF app's endpoint URL must be a prefix of `https://ajgamerental.com/?booking=1…` for LINE to accept the return address.

## 2026-09-28 — Rental period edits open the calendar only; owner copied on confirmation emails

- On the Rental ID page, Edit / แก้ไข beside Rental period / ช่วงเวลา now opens the queue calendar by itself instead of the whole step-1 pane. OK updates the duration and dates on the page (fee and delivery quote follow through the normal render). Inside this calendar, Clear selected dates / ล้างวันที่ที่เลือก only clears the draft, and closing without OK leaves the booking's dates and Rental ID untouched. Edit beside Rental item / สินค้าที่เช่า still opens the full equipment pane.
- Bot: every rental confirmation email (paid rental and Admin resend) now CCs `ajgamerental2021@gmail.com` in addition to `BOOKING_EMAIL_CC` (contact@ajgamerental.com), deduplicated. Overridable with `RENTAL_CONFIRMATION_CC`; an empty value falls back to the owner inbox.
- Verification: 167/167 website tests and 415/415 Bot tests pass; website inline JavaScript passes `node --check`. Walked in headless Chromium with the APIs mocked: 28–31/10 (3 days) changed to 03–08/11 (5 days) through the calendar and the Rental period card updated; clear + close kept 28–31/10 and the Rental ID.
- Note: the header above still says the unified flow is behind `?flowDemo=1`; it is now the default (`legacyFlow=1` for the old flow) and `UNIFIED_FLOW_TEST_CHARGE` is `false`.

## 2026-09-28 — Returning-customer autofill, retained identity photos, and live delivery quotes

- The unified flow now restores the latest known name, phone, email, delivery address and map pin after a verified LINE sign-in or successful returning-customer lookup. Existing customer edits win: autofill only fills blank fields. The browser keeps those contact/delivery fields for 24 hours, while full identity numbers and images remain out of localStorage; the server returns only the document's last four characters.
- Choosing “Verify later” / “ยืนยันตัวตนภายหลัง” no longer clears identity photos already selected in the current page. A bilingual notice explains that the files are still held and can be submitted by unticking the option.
- Root cause of the stuck “Awaiting confirmed quote” / “รอยืนยันราคาจริง” state: the production service was configured to call Lalamove's sandbox base URL. The Render blueprint now uses the live endpoint, and the Bot also chooses the live/sandbox host from the production/test key prefix so the two cannot silently drift again.
- A failed live quote now gives a clear bilingual explanation and Calculate again / ตรวจสอบข้อมูลจัดส่ง actions. Checkout stays disabled until a confirmed delivery quote is present, and the payment launcher rechecks the quote before it creates a Beam link.
- Verification: 161/161 website tests and 409/409 Bot tests pass; website inline JavaScript and changed server modules pass syntax checks; both repositories pass `git diff --check`.
- Production verification: Bot commit `7430828` is live. A real quote request for one ordinary device returned HTTP 200, `MOTORCYCLE`, round-trip subtotal ฿212, AJ discount ฿100, customer delivery total ฿112 and valid quotation IDs. Both `ajgamerental.com` and `ajgamerental.onrender.com` serve the updated bilingual retry/retained-photo UI.

## 2026-09-28 — Catalogue Admin username no longer disclosed

- Removed the real Admin username from the public `game_index.html` login placeholder. The username field now opens empty and disables autocapitalization and spellcheck while retaining the browser's standard username autocomplete behavior.
- Bumped the embedded game-picker cache version on the production and demo booking pages, and added a regression assertion preventing the real username from returning as a public placeholder.

## 2026-09-28 — Passkey Admin access and monochrome contract logo

- Admin sign-in on the booking page, game catalogue, and AJ Game ID catalogue now offers Passkey in Thai and English. Existing password sign-in remains as the bootstrap/recovery path, and an authenticated Admin can add a passkey from each surface.
- WebAuthn ceremonies are verified by the Bot, require user verification, expire after five minutes, are origin/RP-bound, and share the existing Admin login rate limit. Credential public keys and counters are kept in the private `Admin Passkeys` Google Sheet; the public site-content API cannot read them. The old catalogue credentials embedded in public HTML were removed.
- A passkey registered on `ajgamerental.onrender.com` covers all three production pages there. The standalone GitHub Pages AJ Game ID origin has a different RP ID and needs its own registration if that deployment remains in use.
- The contract logo is now a deterministic grayscale asset and sits 18 pt from the top-right edge on physical pages 1 and 2 only. All six pages of representative Thai and English contracts were rendered and visually checked; page 3 remains unbranded.
- Updated Nodemailer to 10.0.11 after the production dependency audit found a high-severity issue in the previous release. `npm audit --omit=dev` now reports zero vulnerabilities.
- Verification: 407/407 Bot tests and 160/160 website tests pass; all changed browser scripts and server modules pass syntax checks; both sites pass `git diff --check`.

## 2026-09-28 — AJ logo on the first two contract pages

- The bilingual Master Agreement PDF now places the existing AJ logo in the upper-right corner of physical pages 1 and 2 only. Later terms pages remain unbranded, and the Rental Order PDF is unchanged.
- Verified by rendering and visually inspecting all three pages of representative Thai and English signed contracts. The logo does not overlap headings, party details, terms, signatures, or page numbers.
- Bot verification: 403/403 tests pass, including a regression that limits the logo draw to the first two pages; `src/services/pdf.js` passes `node --check` and `git diff --check` passes.
- Owner decisions recorded: keep the flood announcement on; Gmail permission has been granted; keep the unified flow at the ฿1 test charge and retain the Demo banner until the final production test is complete.
- Test-row cleanup remains an explicit production operation. The target Rental IDs are the handover list from 24–26 September plus the duplicate ฿1 payment for R0064; cloud deletion must be confirmed at the final action and verified across every affected sheet.

## 2026-09-27 — Open items after the Claude Code sessions of 24–27 September (read first)

State at website `5a2189a`, Bot `869d766`; website 157/157 and Bot 402/402 tests pass. Everything below is deployed. The unified flow is still behind `?flowDemo=1` and still charges ฿1.

Waiting on the shop owner:
- Apps Script: paste the current `google-apps-script/DriveUploadWebApp.gs` (Bot repo), run `authorizeGmail` once and allow Gmail, then Deploy → Manage deployments → New version. Until then the Render log shows "The script does not have permission…" for sends from contact@; the Bot retries from the Gmail account itself, so customers do get the email, just not from contact@ajgamerental.com.
- Top up Lalamove and set the pickup point (delivery quotes).
- Delete test rentals: AJ-20260924-R0056, R0057, R0085; AJ-20260925-R0011, R0026; the duplicate ฿1 delivery-app payment for R0064; AJ-20260926-R0039, R0049, R0054 and other test rows from 26/09.
- Turn off the flood announcement (Admin → ประกาศ) when deliveries resume.
- Delivery-app side of identity holds: `docs/DELIVERY-APP-ID-EXPIRY-PROMPT.md` in the Bot repo.

Not yet verified on production (needs a real ฿1 payment, owner's device):
- Upload identity photos on step 3, change the payment method on the Rental ID page, pay: the Rental ID must stay the same and the email must carry the AJ logo and the agreement PDF. Then Menu → Check my rental with email + phone must find it.
- Admin → Rentals resend against real sheet data; confirm-step speed with real Drive uploads.

To switch the unified flow live (only when the owner says so): set `UNIFIED_FLOW_TEST_CHARGE = false`, remove the "Demo … ทดสอบ 1 บาท" banner, make the unified flow the default instead of `?flowDemo=1`, and re-check the non-demo path.

Known: R0054 has no contract. Its signature was filed under R0049 (the old Rental ID bug below), so Admin resend reports no signed agreement waiting. A new test booking is needed for a contract.

## 2026-09-27 — A paid web rental always gets its contract; Check my rental; pop-up language buttons

- Root cause of "paid but no contract / no PDF" (R0039, R0054): `rentalSignature()` included the payment method and total, so choosing a payment method or receiving the delivery quote on the Rental ID page allocated a new Rental ID. The signed agreement and identity photos stayed with the old ID. Fixed:
  - payment and total no longer change the Rental ID;
  - the Console Pending row is rewritten whenever its content changes (content key in `aj_rental_sheet_submitted_<code>`);
  - before payment the page files the agreement under the current ID (`state.calc.demoAgreementFor`), or sends the renter back to sign if the signature is no longer in memory;
  - identity photos move to a new ID through `previousContextToken` (same document only);
  - identity upload and agreement, sent in parallel, no longer overwrite each other on the Bot.
- A paid rental without a contract alerts the shop on LINE with the reason (`agreementProblems`).
- Passport numbers limited to 6–10 characters, matching the contract schema.
- Check my rental (Menu, and `?myRental=CODE&t=TOKEN` from the email): `POST /api/rentals/lookup` accepts a private view token (issued with the booking context and in the email link), Rental ID + phone, or email + phone (lists that renter's rentals). 20 tries per 15 minutes per IP. Rentals made on the device open with one tap. Language button and copy-link button.
- Pop-ups share one language button: `showModal(title, body, {relocalize})` (FAQ, Check my rental, paid notice, Verify now). The returning-customer dialog has its own button and now says "ไม่เคยทำสัญญาการเช่า" / "I have never signed a rental agreement".
- "ยืนยันตอนนี้" / "Verify now" on the Rental ID page opens the two-photo upload in a pop-up (`demoIdentityUploadGridHtml(prefix)`, shared with step 3) instead of reopening step 3.
- Paid pop-up shows the full rental (equipment, dates, days, fee, deposit, name, phone, identity status, verify button) and can switch language.
- Confirmation email: AJ logo on the right of the heading (`public/assets/aj-email-logo.png`, shown only for an https base URL). English bookings get an English email.
- Menu has line icons (not emoji); more space above the Rental Terms; identity-sent state survives a reload.
- Verification: local end-to-end runs with mock Beam and mock Apps Script (Thai verify-later with payment change, English with photos on step 3, dates edited after signing) all produced the contract PDF attached to the email.

## 2026-09-26 — Identity expiry rule, confirmation email reliability, Admin → Rentals

- ID card or passport must expire after the return date (expired, before start, during the rental or on the return date all block). The website shows a red warning and disables continuing and paying. The LINE contract form shows a warning pop-up. The Bot checks it on new signings only (`idExpiresTooEarly`), so the shop can still edit and rebuild older contracts. Also fixed: renters without a Thai address had skipped the expiry and email checks.
- Faster confirm step: both identity images go to Drive in parallel, and the signature's Drive backup happens after the renter is answered (`backUpPendingSignature`).
- Confirmation email:
  - fee, deposit and a Check-my-rental link added;
  - if sending as contact@ fails, the Bot retries from the account;
  - a failed send alerts the shop on Discord and LINE;
  - the outcome is stored as `rentalConfirmationEmailStatus`.
  - Apps Script falls back to MailApp when GmailApp is not authorised, and gained `authorizeGmail()`.
- Admin → Rentals (รายการเช่า): find a rental and "Send confirmation email again". A signed agreement still waiting is made into the contract first and its PDF attached; an existing contract's PDF is rebuilt and attached. Endpoints: `GET /api/admin/rentals/:code`, `POST /api/admin/rentals/:code/resend-confirmation`.
- Identity photos sent show green "ยืนยันตัวตนเรียบร้อยแล้ว" to the renter (the shop still sees "awaiting review"). Example photos fit the screen.

## 2026-09-26 — Site announcement pop-up and day-range queue closures

- Announcement pop-up on every page load, above any linked pop-up. Thai on the left, English on the right, with ⚠️. It is edited and switched on/off in Admin → ประกาศ (site-content key `announcement`) and currently shows the flood notice.
- It opens while the page loads from the browser's last copy (localStorage), and the current copy is fetched before the main script runs. The Bot keeps site content in memory for 60 s; a save updates it at once.
- Queue closures in Admin take dates (Bangkok days). A closure with an end date blocks deliveries and returns on those days only; rentals spanning them are allowed. No end date keeps the old "no bookings" behaviour. Calendar cells show "ปิดคิว" / "Closed".

## 2026-09-25 — Agreement at payment, Beam return confirmation, menu and payment layout

- The web agreement (Master Agreement, same as the LINE form) is signed on step 3 and made into the contract only when the rental is paid.
- Paid rentals confirm themselves from the Beam webhook (`charge.succeeded` and `payment_link.paid`) or from the return page (`/api/payments/confirm-return`), without running twice after a restart.
- The confirmation is an HTML email with the agreement PDF attached, CC contact@ajgamerental.com.
- `UNIFIED_FLOW_TEST_CHARGE` switches between the ฿1 trial charge and real amounts.
- Header menu: Rental prices / Game list / How to rent (same pop-ups as `?allConsoles=1`, `?games=1`, `?steps=1`).
- Payment groups have prominent headings.
- LINE-verified details show as a summary card with Edit; returning LINE renters are filled from their last booking too.
- The Wise deposit refund is offered on English bookings only.
- Deleted built-in games stay deleted.

## 2026-09-26 — Payment group titles no longer split badly on phones

- Thai reservation group title shortened to “ชำระปลายทาง (โอนจองคิว ฿200)”. The bracketed part never breaks, so “฿200)” can no longer drop onto a line of its own; on a phone it sits as one clean second line.
- English title keeps “E-Wallet” whole, so a phone no longer leaves “E-” at the end of a line. Wording unchanged.
- Verification: all test files pass (148); checked with the Sarabun font at 390px and 360px.

## 2026-09-26 — Green pay button on the demo order page

- The demo order page's pay button (`#demoBeamPay`, `?flowDemo=1`) was the same red as the open payment group above it. It is now green, full width, 60px tall with 20px bold text, a shadow and a lock icon. The payment groups keep their red style; the owner asked for them unchanged.
- Verification: website inline JavaScript syntax check and all test files pass (`unified-rental-flow-demo` 63/63); checked visually at 390px.

## 2026-09-13 — Rental-window game picker links and no-contract acceptance

- The post-contract game-picker button now opens the same token-backed picker path as booking Flex cards. Fresh tokens restore the saved list and expose both rental dates, so games becoming playable on the start date or during the rental are selectable and retain their bilingual playable-date suffix.
- Legacy/fallback picker redirects now also carry both rental dates and the saved game names, while the resolve response reports whether the list is pending or already submitted.
- Unsigned booking Flex cards now offer a bilingual “ไม่ทำสัญญาเช่า” / “Rent without a contract” action. Its opaque, restart-safe link shows the original and increased deposit, the revised total, and the current Rental Terms with Cancel and Accept controls.
- Acceptance raises deposits from ฿2,000 to ฿5,000 or ฿4,000 to ฿8,000, recalculates payment totals/fees, persists the updated booking to Rental History and Console Pending with retries, and sends a refreshed bilingual booking Flex confirming that the customer acknowledged the terms.

## 2026-09-13 — Simplified booking helper copy

- Removed the helper sentence above the game picker, the Google Maps input hint, the returning-customer discount explanation, and the first-time-renter recommendation under the rental-contract heading.
- Kept the related game picker, Google Maps field/buttons, returning-customer option, and rental-contract controls unchanged in both Thai and English.
- Added regression coverage to ensure the removed helper blocks stay hidden while their controls remain available.

## 2026-09-13 — Krungthai logo and returning-customer identity binding

- Booking confirmation Flex cards now show a circular Krungthai logo only beside transfer instructions that use account `8690576029`; other bank accounts do not receive the logo.
- Manual returning-customer verification now returns an opaque, short-lived proof instead of customer details. The Bot resolves that proof server-side, adds the verified customer name to the Flex greeting, and persists name and phone against the Rental ID.
- When LINE links the booking, the Bot persists LINE Unique ID, customer name, and phone both in the Console Pending columns (where available) and its structured booking data. Only the customer name is rendered on the Flex card; phone and LINE Unique ID remain private.
- Delivery App Console Pending now reads name, phone, and LINE Unique ID from that structured booking data whenever there is no newly signed contract, while still giving signed-contract values first priority. This lets verified returning customers proceed without manual re-entry.
- Verification: Bot syntax and 295 tests pass; website inline JavaScript syntax and 59 tests pass. Production serves the exact logo asset and updated website code, and the representative Thai booking Flex was delivered successfully to the owner's specified LINE test account.

## 2026-09-10 — Legacy game-picker links now restore saved selections

- If an older booking row has no persisted picker URL, its Flex button now opens a bot endpoint that mints a fresh short-lived token from the booking record. The picker can therefore preselect the saved games and submit replacements through the same backend flow as newer bookings.
- Legacy rows without a verified LINE identity still fall back to the existing copy-and-send picker. Bot tests remain green at 291/291 before deployment.

## 2026-09-10 — Keep game-picker actions on refreshed booking cards

- Booking Flex cards now retain a “เลือกเกม” / “Choose games” action when the customer selected “แจ้งรายชื่อเกมภายหลัง”. If games are already saved, the action is labelled “เลือกเกมใหม่” / “Choose different games” and the saved list remains the baseline.
- The opaque picker URL is now persisted when LINE links to a booking and when a game list is submitted, so payment-method changes and admin re-sends no longer drop the button. Older rows without that field receive the fresh-token fallback documented above.
- Added regressions for Thai/English labels, legacy-row fallback links and handoff persistence.

## 2026-09-10 — Payment Flex readability and exact fee amounts

- Shortened the Thai/English full-payment labels in booking Flex cards so LINE does not render an ellipsis; the label now reads “ชำระเต็มจำนวน” / “Full payment”. Advance-payment labels were shortened as well.
- Credit-card and E-Wallet bookings now show the calculated fee as a separate, fully readable row with the exact amount (for example, `฿112`) in both languages. The same fee is included in rebuilt booking messages and persisted as `paymentFee` when a payment method is changed.
- Payment-method page amounts now include the `฿` currency symbol beside the fee. Added regression coverage for both languages and confirmed all 289 Bot tests pass.

## 2026-09-10 — Localized payment switching, full transfer, Wise and faster save feedback

- Fixed the payment-change page so its API options, document title, loading state and language toggle all use the selected language. English no longer reuses Thai payment labels, and changing the language reloads the matching option set.
- Added fee-free full Thai bank transfer in Thai and English. English additionally offers Wise with the next-business-day weekend/Thai-holiday warning, refund timing guidance and the three requested Wise reference links. Thai shows the card/E-Wallet deposit-refund-by-bank-transfer notice.
- Confirming a payment method now persists the selected language alongside the rewritten payment data/message. Wise is rejected outside English, carries the shop transfer details, and is protected from stale browser resubmission like the other payment fields.
- Booking confirmation Flex cards now explicitly show the current payment method in Thai and English; full bank transfer and English Wise cards include their relevant transfer details.
- Reduced long saving waits: Beam link creation has a 15-second upper bound, relevant Google Sheet reads/writes have a 12-second upper bound and reuse the known-sheet lookup, the redundant rental-history mirror runs after the canonical Sheet write without blocking the customer, and LINE card delivery is waited on for at most 4 seconds with accurate sent/pending/failed confirmation copy.
- Verification: all 288 Bot tests pass, inline payment-page JavaScript and server/service syntax pass, and local browser QA confirms four Thai choices (without Wise) and five fully localized English choices with the requested notices and links. No payment method was submitted during UI QA.

## 2026-09-10 — Payment-method changes stay authoritative across the website and contract flow

- Website booking submissions now use the Bot's acknowledged Console Pending upsert instead of writing directly to Apps Script with `no-cors`. Every send path awaits the response before marking the rental submitted.
- Repeated submissions for an existing rental preserve the current payment method, payment link, expiry, upfront/on-delivery amounts and bank fields already stored in the Sheet. They also preserve the payment-aware stored message, preventing another browser or stale local state from restoring an old method or cancelled Beam URL.
- The booking viewer reads the latest rental-history row first and uses in-memory context only while a brand-new row is unavailable. Website-side message reconstruction and old-Beam-link regex recovery were removed; the payment block stored by the Bot is displayed as the source of truth.
- Website fee calculations are covered against the Bot formula: `base + ceil(base * bps / 10000)` with 350 bps for credit, 295 bps for E-Wallet, and the existing language-specific cash reservation cap.
- Chose handoff option (a) for Rental Order PDFs: the mutable payment-method line is removed while the agreed total remains. Rendered Thai QA confirms the two-page PDF is legible and has no payment-method line.
- Verification: website regressions pass 54/54 with inline JavaScript syntax validation; Bot regressions pass 280/280 with server syntax and PDF rendering checks. Local browser initialization passed in Thai and English without submitting a booking or creating a payment.

## 2026-09-05 — Fast contract response and automatic LINE completion

- Contract submission now responds as soon as the signed local PDF and metadata are safely written. Slow Google Drive uploads, recovery retries and the Contract Sheet append continue in the background, so those external services no longer leave the mobile form stuck on “กำลังสร้างสัญญา...” / “Generating contract...”.
- When the submitted contract already has a verified LINE Unique ID (including a contract opened inside LIFF), the server automatically sends the booking-confirmation Flex when needed and the contract-ready Flex. The completion popup no longer offers LINE/Messenger/WhatsApp choices in this case; it shows the automatic LINE-delivery status and PDF action in Thai or English.
- Contracts without a LINE identity retain the existing channel choices and fallback flow.
- Bot regressions pass 265/265.

## 2026-09-05 — Contract LIFF state restoration and equal channel buttons

- Corrected a bad LIFF diagnosis from the immediately preceding release: `ID_RENTAL_LIFF_ID` belongs to the ID-game catalogue, while the contract uses `LINE_LIFF_ID`. Contract links and `/api/config` use the contract LIFF again, and every LIFF deep link now includes the required path separator before its query.
- The contract page now waits for `liff.init()` to restore the endpoint state before rereading `ctx`, language and Rental ID, then loads the booking context. Query-only `liff.state` payloads are supported, and OAuth fragments such as `access_token=...` can no longer be accepted as a Rental ID.
- The completed-contract launch label is shortened to “เปิด LINE” / “Open LINE”.
- LINE, Messenger, and English WhatsApp booking buttons now receive equal widths and fixed equal button heights even when the LINE recommendation label is present. The contract completion actions use the same fixed-height treatment in both languages.
- Bot regressions pass 263/263 and website regressions pass 45/45.

## 2026-09-05 — LINE marked as the recommended booking channel

- The final booking actions now label LINE as “ช่องทางแนะนำ” / “Recommended” while retaining Messenger in both languages and WhatsApp for English customers.
- The completed-contract actions use the same recommendation label. The LINE action opens a bilingual four-step launch guide with compact Open-prompt and sending-screen examples before handing off to LIFF.
- Contract completion now saves the server-generated booking message together with the contract ID/PDF result. Reopening booking confirmation after closing its popup can restore every channel without depending solely on another context fetch; the context fetch still runs first for fresh data.
- Manual copy/open remains a last-resort fallback only after an actual LINE delivery failure.

## 2026-09-05 — Collapsed booking extras and contextual game lists

- Promotions & News and the full Available Consoles catalogue are collapsed by default in booking mode behind one bilingual “ดูโปรโมชั่นและเครื่องอื่น ๆ” / “View promotions & other consoles” control immediately after the calculator. Step changes do not open it automatically.
- Compact pre-rental console cards now show a bilingual “ดูเกมของเครื่องนี้” / “View games for this console” action only when that console has a game catalogue. It opens the picker in browse-only mode on the matching console without changing the current booking selection.
- The global browse-all-games action remains for customers who have not chosen a console.

## 2026-09-05 — Clear dates and explicit Step 3 navigation

- Added “ล้างวันที่ที่เลือก” / “Clear selected dates” beside the calendar status/navigation area. It is disabled when empty; when used it clears both draft and committed start/return dates, invalidates the rental code, payment link, contract signature and saved LINE launch, releases the existing hold, and returns date guidance to start-date selection.
- Payment selection now updates calculations and advances only the inline guide marker; `syncStep:false` keeps the customer on Step 2. Step 3 still requires the explicit Next button.
- Regression tests pass 41/41 and inline JavaScript syntax validation passes. Browser QA confirmed the Thai clear control appears in the live calendar and is disabled while no dates are selected.

## 2026-09-04 — Remove avoidable LINE preparation delays

- Identified code paths, not a proven diagnosis of a specific customer request: every new code awaited a historical Sheet read before the authoritative allocator; optional context-message PATCH failures discarded a valid context token; payment-link fetches had no timeout; preview and checkout could race allocations.
- Historical Sheet reads now occur only on allocator fallback (bounded to 5s), allocator waits are bounded to 12s, optional payment-link requests to 10s, and hold acquisition to 30s. Availability checks remain mandatory and fail closed.
- A successful context POST returns its usable token without waiting for the optional PATCH. Failed refinements are logged without forcing manual-copy fallback. Code allocation is shared between preview/checkout; overlapping share execution is blocked while pending.
- Regression tests 39/39 include stalled PATCH, concurrent allocation and bypassing historical Sheet on successful allocation. Inline syntax passes. Network/LINE outages can still require fallback; no claim of guaranteed delivery or exact customer root cause without request logs.

- 2026-09-04 follow-up: reduced step 3 screenshot to 120px in both languages (step 2 remains 160px), and shortened only the English guide copy. Kept the visible launch footer, wait-for-card instructions, agreement/payment sequence, and retry/contact advice.

- 2026-09-04 follow-up: LINE guide examples are now 160px wide. Guide instructions scroll independently above a non-shrinking action footer so the launch link stays within the popup viewport. Checked TH/EN footer bounds at 375×568 (bottom 556px) and internal scrolling; no booking submitted during QA.

- 2026-09-04 follow-up: reduced both LINE guide example images to 220px wide (responsive below that), in Thai and English, with tighter spacing.

- 2026-09-04 follow-up: English LINE guide step 3 now uses the owner's English sending-screen screenshot; Thai keeps its original screenshot. Images remain responsive.

## 2026-09-04 — LINE guide screenshots

- Added the owner's Open-prompt screenshot below step 2 and sending-screen screenshot below step 3 in both guide languages, with localized alt text and responsive image sizing. Original screenshots are preserved, including the Thai text in the sending-screen example.
- Verified image loading and placement on mobile (375px) and desktop; website regression tests pass 36/36. No booking or notification behavior changed.

## 2026-09-04 — Explicit LINE launch and guarded card delivery

- External-browser booking now opens a bilingual in-page guide with a real, user-tapped LIFF link instead of relying on navigation after asynchronous preparation. Yellow/green status links reopen the guide; the existing booking URL is reused only for the same draft and language.
- Guide explains iOS Open, waiting for the sending screen, checking the receipt in AJ chat, completing the agreement where required, and waiting for delivery/payment confirmation. Public guide links: `/?lineGuide=1&lang=th` and `/?lineGuide=1&lang=en`.
- LIFF handoff waits are bounded and success requires the server's linked + flexSent acknowledgement. Failure retains retry/help and existing text fallback. Opening LINE alone is not described as delivery success.
- Contract completion sends Flex instead of booking Text when a verified LINE identity is available. Receipt sends are guarded per rental/customer, and contract-card sends per rental/customer/PDF. Successful receipt markers are persisted best-effort; this is not durable exactly-once delivery across all restarts/network ambiguity.
- Contract-card heading is now “สร้างสัญญาเช่าเรียบร้อยแล้ว” / “Rental agreement created successfully”. Booking-details receipt is distinct from the Delivery App's paid/confirmed booking card; that application is unchanged.
- QA: website 36/36 tests; bot 261/261 after rebasing Claude's payment-latency change. TH/EN guide checked at 375px and 1280px without horizontal overflow; real Express contract form initializes. Local LIFF endpoint mismatch warnings are expected. Actual iOS app-switch and customer LINE delivery require a real-device acceptance test; no test bookings/messages sent to production customers.

## 2026-09-03 — Booking-detail clarity and guarded send actions

- Removed the duplicate green LINE returning-customer banner while retaining the verified Master Agreement/status block inside the returning-customer card.
- Revised only the Thai cash-on-delivery option: the group is now “ชำระปลายทาง (มีโอนจองคิวก่อน ฿200)” and the choice/message is “โอนจองคิว ฿200 และชำระยอดที่เหลือปลายทาง”; English remains unchanged.
- Board-game bundles are hidden by default. Admin Feature Settings now includes a persisted “Show board-game bundle” switch; hiding the feature also clears stale board-game selections from the active draft.
- Disabled LINE, Messenger, and English WhatsApp actions now show bilingual guidance to recheck dates/details and contact AJ in chat. This guidance is intentionally suppressed during the separate post-click cooldown lock.
- The detailed preparation-time notice is collapsed by default and expands on demand in both languages.
- Next-step buttons now scroll the three-step tracker to the top of the viewport (accounting for the navigation height), so the active Step 2 or Step 3 is visible before the customer continues.
- Website tests pass 32/32 and inline JavaScript syntax validation passes.

## 2026-09-02 — Preparation-time disclosure across booking and contracts

- Added the bilingual 30–60 minute / 2–3 hour preparation estimate to the calculator introduction, Booking Details after game selection, and the step-by-step guide.
- Added the same notice to the LIFF contract form, its expanded rental agreement, the public Rental Terms page, and both contract/order-confirmation PDFs so the customer sees one consistent policy throughout the journey.
- The wording explains that timing starts after availability confirmation, the complete game list, and reservation/payment, and that actual timing depends on download size, internet speed, game count, and the current queue.
- Advanced the Rental Terms version to `2026-09-02`, intentionally requiring customers with an older saved acceptance to review and accept the updated terms again.
- Website tests pass 27/27; Bot/contract tests pass 227/227; both changed JavaScript modules pass syntax validation.

## 2026-09-02 — Copy fallback for failed booking channels

- LINE, Messenger, and English WhatsApp still attempt their existing automatic handoff first on both the main booking page and the post-contract completion page.
- A genuine channel/handoff exception now opens a bilingual recovery popup containing the complete booking message, a Copy button, and a direct button for the selected AJ chat. Opening the chat from the popup copies the message first.
- Availability/hold conflicts remain blocking queue errors and intentionally do not expose the fallback, preventing customers from sending a booking for a slot another customer is holding.
- The post-contract LINE fallback also covers missing LIFF context/config and a failed completed-contract Flex API request. Messenger's normal paste workflow remains unchanged.
- Website tests pass 26/26; Bot/contract tests pass 226/226; both inline scripts pass syntax validation.

## 2026-09-02 — New-game priority and ready-date field

- `game_index.html` now places newly created games at the front of the ready-to-play group by default; unavailable games remain above them and retain farthest-to-nearest ready-date priority.
- Existing Admin-created games carrying `insertedAt` also receive the new-game priority, so the game just added before this deployment moves up without being recreated. Editing a game clears automatic priority and makes its editable ID order authoritative again.
- Fixed the missing `toggleUnavailableDate()` handler: selecting “not ready” immediately reveals a required ready-date field, while clearing it hides and resets the date.
- Bumped the booking-page game-picker cache version and added regression coverage for ordering and date-field behavior.

## 2026-09-02 — Returning-customer checkbox Step 2 follow-up

- Removed the remaining generic guide advancement from the returning-customer checkbox change handler. When previously completed guide stages were restored from browser state, that advancement could still jump directly to Step 3.
- Checking and clearing the returning-customer option now explicitly keeps the current booking-detail step and only updates the next guide target to payment or contract choice.
- Added a regression test covering both checkbox directions; all 21 website tests and inline JavaScript parsing pass.

## 2026-09-02 — Booking-channel handoffs hardened

- The contract LIFF now restores `ctx`, rental code, language, payment fields, and the completed-contract LINE handoff flag when LINE wraps them inside `liff.state`; previously the completed-contract LINE button could lose its booking context and fail.
- The contract page app cache-buster was updated so customers do not keep running the stale pre-fix JavaScript after deployment.
- On the main booking page, LINE, Messenger, and English WhatsApp still require a fresh availability hold, but a temporary Beam payment-link failure no longer blocks the booking handoff. The booking reaches AJ and payment can be completed from the resulting conversation.
- Verified the production availability/config endpoints, English LIFF-state restoration on the real local Express server, Thai/English channel rendering, zero browser console errors, all 214 Bot tests, and all 20 catalogue/booking-page tests.

## 2026-09-02 — Booking-detail choices stay on Step 2

- Fixed the automatic guide's leftover four-step mapping after the booking flow was reduced to three steps.
- Returning-customer selection, no-contract Rental Terms acceptance/cancellation, contract actions, Google Maps, and payment choices now remain in Booking Details (Step 2) instead of moving the customer to Review/Send (Step 3).
- Step 2's guide now reaches payment before pointing at its Next button; Step 3 is reserved for reviewing and sending the booking.
- The behavior is shared by Thai and English. Inline JavaScript syntax and focused regression tests pass.

## 2026-09-01 — English ajgameid LIFF deep link

- The ajgameid catalogue now accepts `?lang=en` or `?lang=th`; an explicit URL language overrides the language previously saved in that browser.
- LIFF-wrapped query strings are also read from `liff.state`, which is how LINE forwards parameters appended to a `liff.line.me` permalink.
- This provides a dedicated English LIFF link without changing the Thai default or the customer's language switch.

## 2026-09-01 — Catalogue Admin entry hidden by default

- The public ajgameid and game catalogue headers no longer expose an Admin button.
- Their existing login entry is shown only when the owner opens the page with `?admin=1`, matching the main booking page behavior.
- The game-picker cache version was bumped so embedded catalogue sessions receive the updated header.

## 2026-09-01 — ajgameid LIFF-only identity and compact mobile cards

- The normal website no longer initiates LINE login; LIFF initialization is restricted to the LINE in-app browser.
- A verified LIFF session shows the customer's LINE Unique ID in the top-right header.
- The copy confirmation uses the rental guide outside LIFF and opens AJ LINE only for a verified LIFF session.
- Removed the legacy `resultsHint` and footer output and tightened the two-column mobile catalogue layout.

## 2026-09-01 — Editable game ordering across every console

- `game_index.html` preserves the existing catalogue sequence as a numeric `orderId` and exposes it as an editable, globally unique ID order in Admin without changing the internal game key used by booking selections.
- Every public console section, the embedded booking picker, and the Admin list use the same priority rule: games not ready for service appear first, ordered by ready date from farthest to nearest; all other games follow the editable ID order.
- A ready date is required whenever “not ready for service” is selected. Ordering labels, validation, and availability copy are bilingual.
- New games receive the next available ID order unless Admin chooses another unused number. The booking page game-picker cache version was bumped to `20260901-1`.
- Regression tests, inline-script parsing, desktop bilingual checks, and a 375px mobile overflow/error check pass.

## 2026-08-30 — Analytics disclosure and social footer

- The before-rental landing panel now shows the complete bilingual anonymous-analytics disclosure near the initial trust/decision content; the existing disclosure remains below FAQ as well.
- Added a responsive site footer with bilingual AJ Game Rental copyright copy and direct, accessible SVG-icon links to AJ's YouTube, Facebook, and TikTok pages. External links open safely in a new tab.
- Social-link clicks are recorded as an anonymous analytics event and appear in the owner dashboard. Desktop and 390×844 mobile browser checks pass in Thai and English with no horizontal overflow or JavaScript errors.

## 2026-08-30 — Privacy-first website analytics dashboard

- The production booking page now sends non-blocking first-party analytics events for page visits, language changes, funnel steps, game/terms/contract actions, returning-customer verification, and LINE/Messenger/WhatsApp handoffs.
- Analytics uses random browser/session identifiers and deliberately excludes customer names, phone numbers, LINE IDs, identity documents, maps links, addresses, rental codes, and message contents. The bilingual website notice discloses this anonymous usage measurement.
- The Bot accepts only allowlisted event names and fields, rate-limits submissions, batches Google Sheets writes to a dedicated `Analytics Events` tab, and keeps booking usable when analytics storage fails.
- `/analytics/` is a separate no-index owner dashboard using the existing server-side Admin login. It provides selectable 1/7/30/90/365-day views, daily activity, weekly/monthly summaries, channel counts, funnel actions, and estimated conversion.
- Unauthenticated analytics reports return HTTP 401. The event endpoint returns HTTP 202, the production page has no new JavaScript errors in browser verification, and all 192 Bot tests pass.
- Analytics login now remains valid on the same browser for 30 days. The remembered token is signed with the configured Admin password, survives Bot restarts/deployments, becomes invalid when the Admin password changes, and is removed immediately by the dashboard Logout button.

## 2026-08-30 — Delivery area, timing, and fee FAQ aligned

- The pre-rental service line now explicitly says delivery is limited to Bangkok and the metropolitan area in both languages.
- Canonical bilingual FAQ entries are applied after Gist data loads, so stale remote copy cannot restore the old wording. The delivery section is ordered: delivery time, device-preparation time, service area, then Pattaya/Chonburi.
- The duplicate “ให้บริการพื้นที่ไหนบ้าง / Which areas do you serve?” entry is removed. The service-area answer lists Nakhon Pathom, Samut Sakhon, Samut Prakan, Pathum Thani, and Nonthaburi.
- Delivery timing now explains the 18:00 cutoff concisely. Lalamove/Grab and the estimated 1–2 hour transit time are consistent in FAQ and rental steps. Delivery-fee FAQ copy includes the actual app rate, 3–6 day return-trip benefit, 7+ day round-trip benefit, and customer-paid overage above ฿100.
- Verified the Gist-backed FAQ in a real local browser in Thai and English, including order, multiline fee formatting, removal of the duplicate area entry, and zero console errors.

## 2026-08-30 — Master Agreement wording clarified

- The bilingual rental-step guide now explains that the Master Agreement lasts one year and only its verified information and signature may be referenced for a later rental. Every rental still requires fresh confirmation of its details and Rental Terms.
- The guide and returning-customer note both require a new Master Agreement after expiry or whenever material customer information changes; the former wording that implied reusing the whole rental contract was removed.

## 2026-08-30 — Full device names in booking Flex

- The booking Flex device row now gives the device value more width and allows it to wrap. Long names such as Meta Quest variants are shown in full instead of ending in `...` in narrow LINE clients.
- The behavior is identical for Thai and English cards. A bilingual regression test covers a deliberately long device name; all 190 Bot tests pass.

## 2026-08-29 — Booking journey reduced to three steps

- Removed the automatic Finger Guide overlays. The customer-controlled rental-steps guide remains available from its button.
- Combined game selection with delivery, payment, contract, map, and returning-customer options in one Booking Details step. A game-catalog rental now defaults to “send game list later”; selecting games remains optional.
- Reduced the calculator from four steps to three: Device/Dates, Booking Details, and Review/Send. Existing saved drafts are clamped safely into the new flow.
- The general Connect/Refresh LINE button is hidden; LINE connection is requested only by flows that actually need it. Existing connected customers still see Rental History.
- Returning customers accept identity/contact reuse and the current Rental Order/Rental Terms with one combined checkbox.
- Before submission, the generated identifier is labelled “รหัสรายการชั่วคราว” / “Temporary order ID”. The rental summary and booking Flex now say “ยอดรวมก่อนค่าจัดส่ง” / “Total before delivery”.
- Verified JavaScript syntax and the three-step/default-game behavior in a real local browser. No browser console errors were reported. All 189 Bot tests pass.

## 2026-08-29 — Master Agreement + Rental Order rollout

- The existing signed identity contract is now described as a **Master Agreement**. It records verified identity, signature, and general Rental Terms acceptance for one year; it no longer claims that the whole old contract is reused for every future rental.
- Returning-customer discount and agreement eligibility are separate. Discount history alone never authorizes reusing a signature.
- The booking page stores the verified Master Agreement metadata only after the Bot API has verified either a LINE User ID or the existing manual returning-customer challenge. A customer without LINE cannot retrieve agreement metadata before that challenge succeeds.
- A valid agreement opens a bilingual confirmation modal showing agreement number/expiry and the current Rental Order number. One combined checkbox confirms unchanged identity/contact details and current-order/Rental-Terms acceptance.
- The structured booking message carries agreement/order metadata. The Bot creates a separate Rental Order PDF and the LINE booking Flex can show buttons for the Master Agreement, current Rental Order, and Rental Terms.
- An expired or missing agreement does not skip the contract flow; the returning-customer price discount may still apply independently.

### Delivery App handoff still required

- Persist these optional fields on each booking: `masterAgreementId`, `masterAgreementSignedAt`, `masterAgreementValidUntil`, `masterAgreementPdfUrl`, `rentalOrderId`, `rentalOrderPdfUrl`, `rentalOrderAcceptedAt`, `rentalTermsVersion`, and `rentalTermsUrl`.
- Booking Confirm Flex and My Rentals (active/history) must display the immutable agreement/order references captured for that rental. Never replace historic rows with the customer's newest agreement.
- Continue enforcing customer ownership before redirecting to either PDF, as the existing `/c/my/contract` route does.

## 2026-08-29 — Booking Flex labels no longer truncate

- Thai and English booking Flex cards now wrap Google Maps, payment-summary,
  and bank-transfer headings instead of displaying ellipses on narrow LINE
  clients. Summary labels can wrap while numeric values stay aligned.
- The compact identifier label is now `รหัสเช่า` / `Rental ID`, while the full
  Rental ID value remains prominent.
- Bot syntax and all 183 automated tests pass.

## 2026-08-29 — Full dates in booking Flex cards

- Thai and English booking Flex date rows now split their width evenly between
  label and value, so `DD/MM/YYYY` remains fully visible instead of ending in
  an ellipsis on narrow LINE clients.
- Bot syntax and all 182 automated tests pass.

## 2026-08-29 — Contract-completion LINE Flex handoff

- Only the contract form's `จองผ่าน LINE` / `Book via LINE` completion action
  now enters the verified booking LIFF and links the signed-in LINE Unique ID to
  the same Rental ID. Messenger, WhatsApp, and the PDF action are unchanged.
- The Bot sends the booking Flex first with the rental-contract action removed,
  because the customer has already completed the agreement. It then sends the
  existing contract-ready Flex with the PDF and payment instructions directly
  below it.
- Thai and English use the booking language throughout. The completion handoff
  has bilingual progress, success, and failure messages, and duplicate taps are
  idempotent for the same LINE user and booking context.
- Bot syntax and whitespace checks pass, and all 181 automated tests pass.

## 2026-08-29 — Chat booking no longer double-checks the same hold

- LINE, Messenger, and WhatsApp now acquire one server-side booking hold only,
  after the final Rental ID is available. The former provisional hold followed
  by a second hold/refresh was removed because one click could fail between the
  two checks and incorrectly report that queue verification failed.
- If the historical Rental ID Sheet is temporarily unavailable, checkout now
  uses the existing allocator/offline collision-resistant suffix instead of
  blocking every chat channel with an unrelated queue error.
- The real queue conflict check remains active before preparing each channel's
  message or payment link. Syntax, whitespace, endpoint, and source-flow checks
  pass for LINE, Messenger, and WhatsApp.

## 2026-08-29 — No-contract Rental Terms acknowledgement

- Selecting the no-contract option now opens the complete bilingual Rental
  Terms before the option can be enabled. The renter must explicitly check an
  acknowledgement and continue; closing or cancelling leaves the option off.
- The acknowledgement stores its timestamp, language, and terms version in the
  booking payload. Existing saved no-contract selections without the current
  acknowledgement are reset and must be accepted again.
- Thai and English booking messages state that the renter acknowledged the
  terms and include the matching-language read-only terms link. The LINE Flex
  card presents the same status and link; Messenger and WhatsApp use the same
  localized plain-message output.
- The standalone terms page opens in the booking language, supports an explicit
  Thai/English switch, and is safely frameable only by the AJ booking origin.
- AJ Console syntax and whitespace checks pass. AJ Bot syntax and all 179 tests
  pass, including both terms-page languages and both Flex-card languages.

## 2026-08-28 — Book via LINE verified LIFF handoff

- Only the `จองผ่าน LINE` / `Book via LINE` confirmation now enters the
  production booking LIFF before opening the AJ Official Account chat.
- LIFF obtains the signed-in LINE profile and sends its access token to the Bot;
  the Bot verifies that token with LINE and links the resulting LINE Unique ID
  and display name to the same Rental ID/booking context.
- After the verified link, the existing AJ chat opens with the complete booking
  message prefilled and still waiting for the customer to press Send. Copy,
  WhatsApp, and Messenger flows are unchanged.
- The durable booking-row update retries briefly to cover the race between the
  booking page's background Sheet append and the LIFF transition. The chat only
  opens after that link succeeds; otherwise LIFF shows a bilingual retry action.
- AJ Console inline JavaScript and Bot syntax checks pass; all 171 Bot tests pass.
- Follow-up: verified identity now links to the live booking context immediately
  and the slower Sheet persistence retries in the background, so LIFF no longer
  waits on Apps Script. Safari shows a clear “LINE has been opened” handoff page
  with an Open LINE again action instead of appearing to jump back to the home page.

## 2026-08-28 — Full bilingual contract terms and channel-specific refunds

- Web terms and the two-page contract PDF now share the same late-return,
  damage, two-day extension, delivery/return-time, inspection-photo, and GPS
  conditions in Thai and English.
- Late charges explicitly count any partial day as one full day. The accidental
  empty third recovery-cost item was removed.
- The refund section now states that cash refunds are never available. The web
  explains Thai-bank and Wise timing separately; each generated PDF prints only
  the selected route's timing and details. Thai-bank refunds are due after
  return inspection within the return date, while Wise states 1-3 business days
  and includes the three official help links.
- Page-one term labels and page-two clause headings/key phrases are bold. Both
  languages remain two A4 pages with signatures on both pages.
- JavaScript syntax, rendered four-page visual QA, and all 170 Bot tests pass.

## 2026-08-28 — Admin After Work ฿999 selector

- The Bot Admin booking editor now detects the existing After Work 3 Nights
  conditions for ฿400/day consoles: a three-day rental beginning Monday or
  Tuesday.
- Eligible bookings display a bilingual green checkbox for the ฿999 promotion.
  Selecting it inserts the ฿201 promotion discount and recalculates the total
  and pay-on-delivery amount; removing eligibility also removes the promotion.
- Existing bookings that already contain the promotion reopen with the option
  selected. The cost rows remain editable for exceptional Admin adjustments.
- JavaScript syntax and all 167 Bot tests pass.

## 2026-08-28 — Legacy foreign-renter history in returning discount checks

- Returning-customer eligibility now also reads the legacy English Google Form
  responses in spreadsheet `13nL...lJzJk`, gid `19272404`.
- The source supports exact first name + last four Passport characters and the
  existing exact first name + phone fallback. Header matching follows the sheet's
  real English columns, including `Passport No.` and `Mobile Number`.
- The Admin eligibility tester can show matched foreign legacy details and labels
  this source separately in Thai and English.
- Bot tests pass 166/166 and the LIFF cache-buster was updated.

## 2026-08-28 — Two-page contract signatures and ajgameid copy guide

- Thai and English contracts now use the verified local two-page A4 generator in
  production, including the expanded late-return and damage clauses.
- Both lessor and renter signatures appear on pages 1 and 2, with a comfortable
  gap after each page's final paragraph instead of being pinned to the page edge.
- `ajgameid/index.html` adds the existing bilingual rental-guide action to the
  successful-copy popup as a full-width green play button above OK.
- All 163 bot tests, syntax checks, bilingual browser checks, and four rendered
  PDF page inspections passed before release.

## 2026-08-27 — Rental-change FAQ

- Added a bilingual FAQ explaining that the start date or rental duration may
  be changed once, within 15 days of the original date, with notice by 12:00 on
  the preceding day and subject to availability.
- The same FAQ points customers to LINE > “คิวเช่าของฉัน” / “My Rentals” for
  accessory additions, or to an admin when using another channel.
- FAQ data is normally pulled from the shared Gist. `normalizeFaq()` therefore
  inserts this item immediately after the cancellation/refund question when it
  is missing, so existing cached and remotely managed FAQ lists also receive it.
- Applied independently to `index.html` and `index-demo.html`; no page was copied
  over the other.

## 2026-08-26 — One-time rental rescheduling clause

- Added a new item 4 to the Thai and English rental terms: a renter may change or postpone the rental start date once, within 15 days of the original date, subject to availability, and must notify AJ before 12:00 on the day before the rental starts. Existing items shift down automatically. The final wording was shortened for readability.
- The generated Thai/English contract PDF includes the same rule. A Thai test contract with an Additional notes value remains on one signed A4 page, and the shared Telegram/Discord/email message builder includes the note.
- LIFF app cache-buster updated. Bot tests pass 151/151. Bot production commit: `60824ce`.

## 2026-08-26 — Availability refresh no longer contradicts the calendar

- Fixed a race where the calendar continued showing the last successful queue snapshot as available, but a later transient refresh error immediately blocked Step 1 and disabled the Next button.
- Queue refresh now retries both independent availability sources once. A successfully verified snapshot remains usable for five minutes while a background refresh is pending or temporarily fails, keeping the calendar, readiness message, and Next button consistent.
- Booking safety is unchanged: before retaining the server-side booking hold, the site still requires a fresh live availability response. A cached snapshot can help the customer continue through the form but cannot finalize a conflicting booking.
- Verified the reported Xbox Series X period (30 Aug–2 Sep 2026) in Thai and English at desktop and 390×844 mobile sizes: the calendar accepts the three-day range, Step 1 reports ready, Next is enabled, and the browser console has no errors. Inline JavaScript and `git diff --check` pass.

## 2026-08-26 — Admin eligibility results show matched private details

- After an eligible result, the Admin tester now fetches customer details through a separate Bearer-token-protected endpoint. The public customer eligibility API remains Boolean/source-only.
- The Admin result shows matched name, phone, full Thai ID/Passport, latest rental dates, Rental ID, device, and deposit-refund bank/account details. Missing legacy fields are labeled as not recorded rather than inferred.
- Added an explicit private-information warning and responsive definition-list layout in Thai and English.
- Verified production assets and confirmed the details endpoint returns HTTP 401 without a valid Admin session. Bot tests pass 148/148. Bot commit: `bbd3d5a`.

## 2026-08-26 — Admin returning-customer eligibility tester

- Added a dedicated `ทดสอบสิทธิ์ลูกค้าเก่า` card to the authenticated LIFF Admin home. It calls the same eligibility API used by customers and displays only eligible/not eligible plus the matched source—never another customer's record.
- The tester switches independently between Thai and English and supports three paths: phone/name + last four ID/Passport characters, first name + phone, and first name + last five Rental ID characters.
- Added concise bilingual validation/status copy, responsive mobile styling, and cache-busters for both JS and CSS.
- Verified the Admin flow in the real local server at a 390×844 viewport: language and method switching work with no horizontal overflow. Production assets were verified after deployment. Bot tests pass 146/146. Bot commit: `2aebb35`.

## 2026-08-26 — Returning discount reads legacy rental agreements

- Returning-customer verification now reads the legacy Google Form agreement responses in spreadsheet `15pbl...SwkQUQ`, gid `1940708406`, in addition to current Contracts, confirmed Rental History, and Delivery Customers.
- Columns are resolved from their real headers (including `เลขบัตรประจำตัวประชาชน` and `เบอร์โทรศัพท์ที่ติดต่อได้`) rather than fixed positions.
- Thai verification requires phone + last four ID characters; the no-ID fallback requires exact first name + phone. English verification requires first name + last four Passport characters. Mismatches remain rejected.
- Production API checks for the reported customer returned `eligible: true` both through legacy-contract identity and the phone fallback. Bot tests pass 145/145. Bot commit: `d3dde5c`.

## 2026-08-26 — Renter notes preserved across contract outputs

- The LIFF agreement form now snapshots the live Additional notes value before asynchronous image compression and submission, preventing mobile input methods or writing-assistant overlays from leaving the shared payload blank.
- The same normalized `notes` value continues to feed the PDF and the one shared message used by Telegram, Discord, and email; it is now also retained in local contract metadata for audit/recovery.
- Bumped the LIFF cache-buster and verified the new script on production after deployment. Bot tests pass 143/143. Bot commit: `3bab091`.

## 2026-08-26 — Contract checkbox compatibility

- Fixed contract submissions from pages opened before a deployment where a checked native checkbox can arrive as the HTML value `on` instead of Boolean `true`.
- The server accepts only recognized checked values (`true`, `on`, or `1`) for privacy acknowledgement, agreement consent, and rental terms; missing, unchecked, and false values remain rejected.
- Validation errors for these fields now show clear Thai/English instructions instead of the raw Zod message `Invalid input: expected true`.
- Bumped the LIFF app cache-buster and verified the production assets after deployment. Bot tests pass 142/142. Bot commit: `071e84c`.

## 2026-08-25 — Contract booking costs follow the selected language

- The rental-agreement page now localizes structured booking-cost labels every time it loads or changes language, rather than retaining the language used on the booking page.
- Thai booking context switched to English now shows English rental, After Work promotion, review discount, returning-customer discount, payment-fee, and deposit labels; switching back restores Thai.
- The localized rows are also stored in the submitted `bookingCosts`, so the PDF and shop notifications use the agreement language while all amounts and pricing calculations remain unchanged.
- Production and local browser checks passed for Thai → English → Thai, including the hidden submission value and default Thai/Foreigner customer type. Bot tests pass 140/140.

## 2026-08-25 — Selective Trust/privacy and Booking-flow release

- Prepared a production release from the latest remote `main` rather than the
  locally advanced worktrees, so unrelated contract, delivery, pricing, game-ID,
  and admin-security commits are not included.
- The booking page now adds bilingual privacy reassurance beside the rental
  contract and returning-customer verification, without changing eligibility or
  pricing calculations.
- The rental-agreement form explains document purpose, access limits, 30-day
  document-copy deletion, and the existing one-year agreement/data-retention
  limit in Thai and English. Submission now requires an explicit privacy
  acknowledgement, validated by both the browser and server schema.
- Booking steps now expose bilingual live readiness, keep later steps locked
  until prerequisites and a successful queue check exist, and provide direct
  queue retry actions in the form and calendar.
- Verified at a 390×844 mobile viewport in Thai and English. The website inline
  script passes `node --check`; the bot suite passes 138/138; pricing and payment
  implementation files are unchanged by this selective release.

## 2026-08-24 — Rental agreement works with and without LINE

- The production booking page now offers two agreement routes outside LINE:
  `Open with LINE` uses the existing contract LIFF, while `Continue in browser`
  opens the same contract form through the direct HTTPS `/liff/` route.
- Both routes use the same short booking-context token and preserve Rental ID,
  language, device, dates, games, add-ons, payment, promotion, discounts, and
  delivery-map data. There is still only one contract form and submission API.
- When the booking page is already inside LINE, the agreement button skips the
  chooser and continues through LIFF. LINE booking messages keep the LIFF URL;
  Messenger, WhatsApp, and copied booking messages now use the direct web URL
  so customers without LINE are not prompted to install or open it.
- The chooser is bilingual, mobile responsive, keyboard-cancellable, and does
  not mark the Finger Guide contract step complete when the customer cancels.
- Verified locally in Thai and English at desktop and 390×844 mobile sizes.
  The direct web contract loaded without a LINE redirect, inline JavaScript and
  `git diff --check` passed, and all 133 bot regression tests passed.

## 2026-08-24 — Returning-customer fallback through Delivery App Customers

- Manual phone verification now checks both the existing confirmed rental history and the Delivery App Customers tab (`gid 281638460`).
- A customer without an AJ Contract can qualify when the normalized first name and phone number match the same Customers row; matching only one value never grants the discount.
- Rental-ID verification remains restricted to confirmed rental history and is not weakened by this fallback.
- The Customers reader supports both named-column sheets and the legacy fixed layout (`UUID`, name, phone, Maps URL, timestamp).
- Bot tests pass 131/131, including exact match, mismatched name/phone, and legacy headerless Customers cases.

## 2026-08-23 — One-page rental agreement and note notifications

- The local A4 agreement generator now uses a compact bottom signature area so a normal completed contract, including a renter note, stays on one page without shrinking the existing body text.
- Exceptionally long content can still flow safely to another page instead of overlapping the signatures.
- A rendered Thai contract matching the reported Nintendo Switch 2 case was visually checked: all sections, the note, and both signatures fit cleanly on one A4 page.
- Contract notes are now included in the single shared notification message sent to Discord, Telegram, and email.
- Bot tests pass 129/129, including regressions for one-page signed PDF layout and note propagation.

## 2026-08-23 — After Work 3 Nights promo across four daily rates

- The Monday/Tuesday-start, exactly-three-night After Work promotion now supports every requested daily-rate tier: ฿300/day → ฿777, ฿350/day → ฿888, ฿400/day → ฿999, and ฿500/day → ฿1,299.
- Thai and English calendar cells, booking summaries, and share messages display the rate-specific promo price instead of a fixed ฿999 label.
- Structured booking costs carry the same rate-specific promo label and discount into the LIFF rental agreement; PDF totals continue to calculate from those rows without recomputing or losing the discount.
- Review discounts remain ฿50 each whenever any After Work tier applies, and the returning-customer 10% discount continues to apply last.
- Frontend syntax and eligibility checks pass for all four tiers and invalid weekday/duration/rate cases. Bot tests pass 127/127, including a PDF regression covering all four promo tiers.

## 2026-08-23 — First-name matching and resilient availability loading

- Manual returning-customer checks now require the customer's first name only; surname is explicitly not required in Thai and English. The Rental ID suffix or phone must match a `Confirmed` row with the same normalized first name.
- A repeated five-character Rental ID suffix is therefore safe when the first names differ. Multiple confirmed rows with both the same suffix and first name still fail closed.
- English Passport verification also uses first name only, while Thai ID verification keeps phone plus the last four Thai-ID digits.
- Availability now races the existing Apps Script request against a same-origin bot proxy with a 30-second server cache. The first valid response wins, and the calendar no longer waits for queue-closure or booking-hold refreshes before showing dates.
- Local UI verification showed available calendar cells after 4.5 seconds with no stuck checking or queue-error state. Bot tests pass 126/126 and frontend syntax/diff checks pass.

## 2026-08-23 — Returning-customer verification without an ID/Passport record

- The bilingual returning-customer dialog keeps the existing contract-based verification and adds an explicit branch for customers whose Thai ID or Passport was not recorded.
- That branch verifies either the last five characters of a previous Rental ID or a previously supplied phone number against `Line / WhatsApp LOGs`. Only rows whose status is exactly `Confirmed` qualify.
- Five-character Rental ID suffixes can repeat across dates, so the API fails closed unless exactly one confirmed row matches. Phone lookup accepts 8–15 digits and ignores formatting.
- A switch beside the Rental ID field changes the lookup to phone, and a “How to find Rental ID” control reveals the supplied Thai or English example image in the dialog.
- LINE Unique ID auto-verification remains the first choice and bypasses this dialog when a confirmed rental is already linked.
- Bot verification: 125/125 tests pass, including pending/cancelled rejection, ambiguous Rental ID rejection, and confirmed phone matching.

## 2026-08-23 — Review discounts during After Work promotion

- When After Work 3 Nights sets the rental price to ฿999, the Google Maps and Facebook review discounts are now ฿50 each instead of ฿100 each.
- Step 3 labels switch dynamically between ฿50 for eligible After Work dates and the normal ฿100 for all other rentals in both Thai and English.
- Summary, booking messages, and rental-contract handoff use the same calculated ฿50 amounts; the returning-customer 10% discount continues to apply last to the remaining eligible balance.

## 2026-08-22 — Rental-agreement minimum-age notice

- The production Step 3 rental-agreement card now states in Thai and English that the person entering into the rental agreement must be at least 20 years old.
- The warning appears only in the branch where the customer will complete a rental agreement; no-contract behavior and pricing are unchanged.

## 2026-08-22 — Dedicated LIFF endpoint for the production booking site

- Production `index.html` now uses LIFF ID `2010212481-IXO3gDQp` for the main booking website. The former ID belongs to the Delivery App and is no longer used by production booking-page LINE initialization.
- Browsers that retained the former Delivery App LIFF ID in `aj_liff_id` automatically remove only that obsolete value and migrate to the new production ID. Custom/non-matching values remain untouched.
- The rental-contract LIFF ID and `index-demo.html` are unchanged.

## 2026-08-22 — Automatic LINE returning-customer verification

- On page startup, an existing LIFF login is detected without forcing a login. The LINE access token is verified with LINE server-side when available. LINE's in-app browser can retain the known LINE User ID while exposing no LIFF access token on the direct production URL, so that validated opaque `U` identifier is now a rate-limited fallback for the same server-side history lookup.
- A verified LINE User ID qualifies through either an `AJ Contract` row or a `Line / WhatsApp LOGs` Rental History row whose status is exactly `Confirmed`. Merely submitted `Pending` records and `Canceled` records never qualify.
- Customers without a LIFF session, without a linked LINE User ID, or without matching history retain the existing bilingual partial-identity verification fallback.
- When LINE eligibility is found, the page automatically selects the 10% returning-customer discount, keeps the contract branch consistent, and skips the corresponding Finger Guide questions. Step 3 shows a prominent bilingual green confirmation above the already-checked discount box. The manual partial-identity check continues to search contract rows only.

## 2026-08-22 — Returning-customer eligibility and newest-first event cards

- The 10% returning-customer checkbox now opens a bilingual eligibility dialog before it can affect pricing. Thai customers enter their prior-rental phone number plus the last four Thai-ID digits; English customers enter their agreement name plus the last four Passport characters.
- The bot checks those two values against prior contract rows server-side, returns only `eligible: true/false`, rate-limits attempts, and never returns identity or contract details to the booking page. Invalid, unavailable, and no-match states leave the discount unchecked.
- Customer Reviews & Past Events now places newly added Admin entries first. Added “TILOG-LogistiX 2026 at BITEC Bangna” as the first current card, with a 1000×1000 optimized image and the supplied Facebook detail link.
- Bot verification: 119/119 tests pass, including Thai/English partial-identity validation and renter-type matching.

## 2026-08-22 — Wise business-day guard and restored Step 3 order

- English Wise full payment is disabled on Saturdays, Sundays, and the 2026 Bank of Thailand financial-institution holidays. The card explains why it is unavailable and any previously selected Wise value falls back safely to balance on delivery.
- Production Step 3 is again ordered as Board Game Bundle → Google Maps → returning-customer discount (and its review discounts) → rental contract choice/link → payment.
- Thai and English returning-customer labels now state that the 10% discount is for returning customers only; review cards carry the same eligibility badge, while the one-year agreement warning remains intact.
- The finger guide follows the same visual order in both languages, including the returning-customer and no-contract branches.
- Returning-customer identity verification was intentionally not enabled yet. Recommended next step is a server-side eligibility endpoint with rate limiting and a short-lived signed eligibility token; do not expose or query Thai ID/passport records directly from the browser.

## 2026-08-21 — All rental-agreement handoffs use LIFF

- Booking messages shared through LINE, Messenger, and WhatsApp now carry a `liff.line.me` agreement URL even before a LINE user ID is known, allowing LIFF to capture the customer's LINE profile when opened.
- Structured booking context tokens now travel in the LIFF URL instead of a direct Render `/c/` URL, preserving device, dates, duration, delivery map, games, add-ons, and every applicable discount.
- LIFF Admin booking corrections now return and copy the same LIFF agreement URL in Thai and English; the Rental ID still reloads the corrected structured booking.

## 2026-08-21 — English booking copy says Thai QR Scan

- The generated and rebuilt English booking message now labels the balance-on-delivery method “Thai QR Scan”; payment-page and Thai copy are unchanged.

## 2026-08-21 — Removed cash from English payment copy

- English payment options and generated/rebuilt booking messages now list Thai QR, Card, and E-Wallet for the balance due on delivery without offering cash.
- Removed the obsolete English cash-payment sentence from the admin-managed FAQ in the production Gist.
- Thai payment copy and behavior are unchanged.

## 2026-08-21 — Complete corrected booking copy and faster Admin save

- Corrected booking copy now includes a non-zero delivery fee even when a legacy dedicated field still contains `0`; the Admin form also derives that field from an existing Thai or English delivery cost row and stores one canonical row on save.
- Successful Admin corrections append the reusable rental-agreement link to the copied Thai/English booking details unless No contract is selected.
- Reservation cancellation copy now names the exact deposit: Thai bank-transfer reservations are ฿200; English card/E-Wallet/Thai QR bank-transfer reservations are ฿1,000.
- Removed the redundant post-write Apps Script read from Admin booking saves. It could return stale data and made mobile requests time out after the write had already succeeded. Save progress/failure labels are now specific to saving rather than sending.
- Bot verification: 118/118 tests pass, including a regression for `deliveryFee: 0` plus a `Delivery fee = ฿300` cost row.

## 2026-08-21 — Bilingual Admin booking correction and delivery fee

- LIFF Admin > Bookings now includes an explicit TH/EN output-language selector and a dedicated delivery-fee field.
- The delivery fee is stored with the structured booking and appears exactly once in rebuilt Thai or English booking details.
- The edit screen can copy the untouched original customer booking message before any correction. After saving, the result screen can copy the newly rebuilt booking message as well as copy/open the rental-agreement link.
- The selected language controls both the rebuilt booking message and the generated agreement URL.
- Bot verification: 117/117 tests pass.

## 2026-08-21 — Admin booking correction now returns a contract link

- Saving LIFF Admin > Bookings now refreshes any seven-day in-memory booking context so the contract does not reload stale pre-edit pricing.
- A successful save shows a reusable rental-agreement URL for the same Rental ID, with Copy and Open actions. No replacement Rental ID is created.
- For an accidental returning-customer discount, remove the discount row, restore total/upfront/on-delivery values, leave No contract unchecked, save, and send the generated link.
- Bot test suite: 116/116.

## 2026-08-20 — English deposit-refund guidance restored

- Production payment options again state: “Deposit refund: Wise (1–3 business days) or Thai bank transfer, if available.”
- The English note includes links to Wise transfer timing, transfer policy, and country coverage. Thai wording is unchanged.

## 2026-08-20 — PS5 bundles hold every physical device

- A PS5 bundle booking now sends an atomic multi-device hold containing PS5 plus the selected physical bundle device: PS Portal, PS VR2, Logitech G29, or PS FlexStrike Wireless Fight Stick.
- The booking-hold API exposes each held device to availability polling, so a bundled peripheral is blocked from standalone and other bundle bookings for the same dates.
- Multi-device holds are stored and restored together in the customer's browser while remaining compatible with older single-device hold data.

## 2026-08-20 — LINE booking message fallback on desktop

- LINE booking handoffs still use the official message URL so mobile opens LINE with the complete booking message prefilled.
- On desktop devices with a fine pointer, the booking message is also copied to the clipboard before opening LINE. This gives PC customers a paste-ready fallback when LINE cannot open automatically.
- Mobile user agents are explicitly excluded from the extra copy step, preserving the existing working mobile flow.

## 2026-08-18 — reliable LINE, WhatsApp, and Messenger booking handoff

- Both the booking page and post-contract completion flow now use the current percent-encoded LINE OA URL (`%40ajgame`) and same-page universal navigation for LINE/WhatsApp, avoiding popup blockers after asynchronous booking work.
- Messenger no longer uses the stale numeric deep-link id. Both flows use `https://m.me/ajgamerental`, which resolves to the current AJ Page conversation.
- Messenger now has a dedicated bilingual handoff screen showing the complete booking message, a user-initiated Copy button, an Open Messenger button, and instructions to paste and tap Send. Opening retries the copy but still opens the universal fallback if clipboard permission is denied.
- LINE and WhatsApp carry their message in the supported URL and no longer depend on clipboard permission. WhatsApp remains English-only by product design.
- Verification: bot test suite 112/112; website inline syntax, diff check, and static regression checks for all three channel URLs pass.

## 2026-08-18 — LINE verified-slip Thai wrapping

- Corrected the target after screenshot clarification: the payment-purpose value remains `รอร้านตรวจสอบประเภทยอด`. The explanatory sentence below the rows now forces a break after `และจะตรวจสอบว่า`, keeping `ยอดนี้` together at the start of the next line instead of letting LINE strand `ย` at the end of the previous line. English copy is unchanged.
- Bot test suite: 111/111, including exact assertions for the unchanged purpose value and corrected explanatory newline.

## 2026-08-18 — net-balance loyalty discount and real 30-minute hold configuration

- Returning-customer 10% now applies last to the remaining eligible console rental balance: regular rental/accessories, less After Work, console promotions, and fixed Google/Facebook review discounts. Example: PS5 ฿1,200 − After Work ฿201 − reviews ฿200 = ฿799; loyalty rounds 10% to ฿80.
- Summary UI, structured contract handoff, and Thai/English booking messages list discounts in that same calculation order. The bot does not recalculate them: LIFF and PDF sum the signed booking-cost rows received from the website.
- Root cause of production still showing 10 minutes: `src/config/env.js` supplied its own 10-minute fallback to the 30-minute hold store. The server fallback is now 30, `render.yaml` explicitly sets `BOOKING_HOLD_MINUTES=30`, and a regression test asserts the server configuration—not only the standalone store.
- Bot verification: 111/111 tests pass. Production must report `ttlSeconds: 1800` before the 30-minute rollout is considered live.

## 2026-08-18 — Visible booking-share feedback and hold countdown

- Production `index.html` now shows an inline, accessible status directly below the LINE / Messenger / WhatsApp buttons as soon as the customer confirms. All share buttons are locked while the message is being prepared and for 12 seconds after the chat opens; the status survives returning from the chat app for 60 seconds. Thai and English copy explicitly tells the customer to send the prepared message in the chat, avoiding a false “sent automatically” claim.
- Calendar hold rendering now takes priority over the generic unavailable state for the current browser's hold and for capacity-blocking holds from other customers. Cells show `กำลังจอง · เช็คใหม่ใน N นาที` / `In progress · retry in N min`, calculated from the real hold expiry.
- Verified the production page at a 375×812 viewport in Thai and English with no browser console errors; inline JavaScript passes `node --check`.
- Follow-up review fixed the return-from-chat lock lifecycle: `lockedUntil` is persisted separately from the 60-second visible status, so Safari bfcache cannot unlock immediately or accidentally keep buttons locked for the full status duration.
- A production follow-up fixed two calendar regressions seen on iOS: failed first-load availability no longer remains labelled “checking” forever, concurrent callers now await the same in-flight refresh, and the customer's own 10-minute hold is persisted locally and merged back after Safari reload/bfcache or a backend instance change. The last successful availability payload is cached for display while the slow Apps Script refreshes; creating a new hold still requires a successful fresh refresh.
- Final root-cause review found `renderMonth()` was overwriting every busy cell's specific note with the generic unavailable label after `calendarDayStatus()` had already returned the hold countdown. That overwrite was removed. Render was retriggered after the production booking-hold endpoint was found returning `404`; the endpoint is now live. End-to-end production verification against a real Xbox Series S hold showed dates 18–21 as `In progress · retry in 4 min` and `กำลังจอง · เช็คใหม่ใน 4 นาที`, with no browser console errors.
- Hold acquisition is now the first network action after booking confirmation, using a provisional unique rental code when the final code is not ready; slow availability, payment-link, contract-context, and Sheet work happens only after the atomic hold exists. Open calendars poll the lightweight hold endpoint every 3 seconds and apply its result immediately without waiting for the slow Apps Script. Hold TTL is 30 minutes to cover contract completion and payment, while failed booking preparation releases the hold.
- Production concurrency verification: a second calendar that was already open changed to the hold label within 3.5 seconds, and a second overlapping acquisition returned HTTP 409. The frontend is live. The bot's 30-minute TTL commit is on `main`, but Render was still reporting `ttlSeconds: 600` after repeated checks, so the service needs a successful/manual deploy before production TTL becomes 30 minutes.

Running handover log between sessions and between assistants. Read at the start
of a session, update at the end. Newest entry first.

---

## 2026-08-18 — discounted contract totals and booking holds

### Fixed

- Contract pricing from the booking context is no longer overwritten by the
  catalog's undiscounted total in the bot backend. The LIFF form and local PDF
  independently sum the signed booking-cost rows, so PS5 ฿1,200 − After Work
  ฿201 + deposit ฿2,000 is stored and printed as ฿2,999 rather than ฿3,200.
- Added a server-side booking hold API and integrated it into every production
  booking action. Holds are atomic within the running bot service, scoped by
  physical model and overlapping dates, capacity-aware, and expire
  automatically after 10 minutes. `BOOKING_HOLD_MINUTES` can change the TTL.
- The booking page reads active holds with availability. A held last unit is
  unavailable in the calendar and the selected range explains that one booking
  is in progress with the remaining wait in minutes. The same browser can
  refresh its own hold without blocking itself.

### Verification

- Bot test suite: 102/102, including overlapping, refresh and expiry hold cases
  plus signed PDF booking-total calculation.
- Local API returned 201 for the first PS5 hold and 409 for a second overlapping
  hold; hold listing returned a 600-second TTL.
- Production booking page loaded in-browser, calculator rendered, and browser
  console had no errors. Inline JavaScript syntax and both repos' diff checks
  pass.

### Operational note

- Holds live in the bot process, which is sufficient for the current single
  Render instance. If the service is scaled to multiple instances, move the
  hold store to Redis/Postgres so all instances share the same atomic lock.

## 2026-08-17b — booking/steps/terms wording (both repos)

### Fixed

- Booking message (web `index.html` + bot `line.js`): added a "deposit
  refunded 100% when returned complete" line under the early-return line;
  reworded the reservation warning to point at the details above and end with
  a pointing hand (reservation variant only, both languages); Thai reservation
  footnote now says bank transfer; removed a doubled blank line before the
  amount due on delivery in the web Thai cash message (bot already collapses
  blank runs).
- Rental steps (web): transport both ways only, online service only with no
  shop pickup/return, dropped "if convenient" on the return confirmation, added
  a one-year-contract note. Removed "full deposit refund on return" from the
  Before rent terms line. Returning-customer hint notes a contract over a year
  old must be redone.
- Contract terms (bot LIFF `app.js`): cancellation clause now withholds the
  reservation fee too; new clause: contract valid one year, redo after.
- Contract PDF (`pdf.js`): 100% refund note under the refund account and the
  one-year term. Added a page-break guard — flowing content that reaches the
  signature zone starts a new page; normal contracts stay one page, a
  worst-case foreigner contract now flows to two instead of overlapping the
  signatures.

### Watch out for

- The rental clauses now live in two places: bot LIFF `termsCopy` (numbered
  list) and, for the one-year clause only, `pdf.js`. Update both if the terms
  change again.
- The full-payment warning ("before making payment") was left in the old
  `⚠️…⚠️` form; only the reservation warning was restyled, per the request.
- The Thai reservation warning reads "อ่าน…อย่างด้านบนละเอียด" verbatim as
  requested; the phrasing is slightly awkward if a future edit wants to smooth it.

### Verification

- Bot suite 97/97. Web: TH/EN booking footer, single-blank spacing, steps
  footnotes, terms line, returning hint all confirmed in-browser. PDF: normal
  1 page, worst-case foreigner 2 pages, Thai strings render.

---

## 2026-08-17

### Fixed

- Restored Beam only for the English “Balance on delivery” reservation option.
  It creates an exact ฿1,000 link with Card, E-Wallet, and Thai QR scan enabled;
  the English booking message, contract-completion Flex card, and shop
  notification include that link and its 12-hour expiry. Thai reservation and
  both Thai/English full bank-transfer options remain on the AJ Krungthai
  account and do not receive Beam links.
- The booking calendar now blocks the current Bangkok date from exactly 20:00
  onward (previously it remained selectable during the 20:00 minute).
- Restored the production Admin “Close queue” tab and the public queue-closure
  checks that were lost during the Before Rent merge. Admin authentication now
  uses the bot API again instead of credentials embedded in the static page.
- Queue closures can be permanent or scheduled with Bangkok start/end times at
  three scopes: all devices, one device type, or one device. The booking gate
  and calendar reject any rental range that overlaps an applicable closure.
  Existing boolean closures remain readable. The `Queue Closures` sheet now
  adds `Start At` and `End At` columns while preserving old rows.
- Thai reservation and full-payment bank-transfer options have temporarily
  reverted from Beam QR PromptPay to the AJ Krungthai account because SlipOK
  rejects Beam's settlement account as a different receiver. Cash/reservation
  and `bank` bookings no longer create, store, display, or forward Beam links;
  Thai booking text, contract completion text, Flex cards, and shop
  notifications show account `8690576029` instead. English ฿1,000 reservations,
  Credit Card, and E-Wallet use Beam. Restore Beam for Thai reservation and full
  bank-transfer options only after the receiver-account verification path is solved.
- The production `index.html?viewMsg=<Rental ID>` viewer now reads the bot's
  `/api/bookings/:code` endpoint first. This lets a just-created booking use the
  server-side handoff cache instead of waiting for Google Sheets propagation.
- Missing records are retried for a bounded period, then the existing Apps
  Script JSONP lookup is used as a fallback. A visible retry button replaces the
  former one-shot empty/not-found state.
- The bot's public booking lookup now permits cross-origin GET requests from the
  static booking site. No booking data is cached by the browser.
- Payment-option cards now match the supplied Thai and English reference layout:
  grouped headers, Recommended badge, stronger selected state, payment logos,
  separate fee lines, and card/E-Wallet deposit-refund notices. English Wise
  now warns that weekend and Thai-holiday payments arrive on the next business
  day. Labels use “Thai QR PromptPay” / “QR PromptPay” as requested; Beam link
  amounts and creation logic were not changed.
- Production checkout now creates real Beam links instead of the ฿1 demo
  endpoint. Thai ฿200 reservations use Beam QR PromptPay only; full Thai bank
  payments use Beam QR PromptPay in Thai and English. Card and E-Wallet links
  retain their configured fees, while English reservations retain the existing
  ฿1,000 card/E-Wallet/Thai-QR choice.
- Every Beam link expires after 12 hours. The booking page stores the expiry and
  refuses to reuse an expired cached link. Booking text, contract-completion
  text, LINE Flex cards, and shop notifications now identify Beam consistently
  and include the 12-hour notice.
- Successful Beam webhooks update the booking to “ชำระค่าจองแล้ว” for a
  reservation or “ชำระเต็มจำนวนแล้ว” for a full payment, with the amount,
  transaction reference, and payment timestamp stored against the Rental ID.
- Booking-to-contract handoff now stores a short-lived structured booking
  context before opening the LIFF contract. The context carries the exact cost
  rows and total from the booking page, including After Work, returning-customer,
  Google Maps review, and Facebook review discounts.
- The contract form, saved Google Sheet row, PDF, and post-contract LINE/Flex
  summary now preserve that exact breakdown instead of recalculating a gross
  device rate. The obsolete instruction telling staff to trust a separate chat
  total was removed in both languages.
- Contract-admin device creation now locks the Save button and changes its text
  to “กำลังทำรายการ...” / “Processing...” while the API request is pending. A
  submit guard prevents fast repeated clicks from creating duplicate rows.
- Successful device creation restores the Save button, clears the add-device
  form, keeps it open for another entry, and shows a Thai/English success popup.
  Failed requests restore the button without clearing the entered data. The LIFF
  `app.js` cache-buster was updated so admins receive the fix immediately.
- Full-payment bookings no longer show reservation-deposit cancellation text.
  The booking page, post-contract LINE text, and automatic Flex summary now all
  derive this from `paymentOption` instead of hard-coded Thai copy.
- Thai and English full Thai-bank-transfer messages keep the full-payment amount
  and bank account instructions, but omit every reference to a ฿200 reservation
  deposit. Reservation-only wording remains for payment choices that actually
  collect a reservation amount.

### Verification

- Browser-checked the Thai payment summary and confirmed the full-payment
  option is shown as Beam QR PromptPay with the exact discounted ฿2,999 total.
- Bot regression suite passes all 93 tests, including Thai PromptPay-only
  reservation links, full-payment QR links, 12-hour expiry, LINE/Flex copy, and
  webhook booking-status mapping.
- Browser-tested a PS5 contract context containing the ฿1,200 rental, -฿201
  After Work promotion, -฿80 returning-customer discount, -฿100 Google Maps
  review discount, -฿100 Facebook review discount, and ฿2,000 deposit. The form
  showed every row and the exact ฿2,619 total.
- Browser-tested the production page locally through the full booking flow:
  selecting Thai bank transfer shows the full amount due and no amount due on
  delivery.
- The booking-cost handoff and admin-device submit regression coverage remains
  green.
  lock/reset behavior, Thai/English post-contract
  text and Thai/English full-payment Flex cards.
- Inline production JavaScript syntax and `git diff --check` pass.

---

## 2026-08-16

### Fixed

- Restored the production-only After Work promotion in `index.html`: a
  ฿400/day console rented for exactly 3 days starting on Monday or Tuesday is
  discounted from ฿1,200 to ฿999.
- Restored the calendar marker (`โปร 3 วัน ฿999` / `3-day promo ฿999`) and the
  discount line in the rental summary, structured booking data, and Thai and
  English booking messages.
- Kept `index-demo.html` unchanged. This was a selective restoration from the
  former production implementation, not another production/demo file copy.

### Verification

- Browser test: PS5, 24–27 August 2026, showed the promotion, a ฿201 discount,
  and a ฿2,999 total including the ฿2,000 refundable deposit.
- Browser exclusion test: PS5 Pro at ฿500/day for the same dates did not receive
  the promotion.
- Browser console had no warnings or errors; inline JavaScript syntax and
  `git diff --check` pass.

---

## 2026-08-15

### Finished

- `index.html` and `index-demo.html` now carry the same Before rent experience;
  production was published from commit `9a33331` on 2026-08-14.
- Shortened the two delivery-promotion lines in both languages. The stated
  policy is: rentals of 3–6 days get free return delivery; rentals of 7+ days
  get both trips free, up to ฿100 per trip, within Bangkok metro.
- Renamed the social highlight section to “รีวิวจากลูกค้าและกิจกรรมที่ผ่านมา” /
  “Customer Reviews & Past Events” so it no longer implies partnerships or
  media endorsement.

### Verification

- `index.html` and `index-demo.html` are byte-identical after the copy changes.
- Inline JavaScript syntax and `git diff --check` pass for both files.
- Browser visual verification was unavailable because the in-app browser
  blocked localhost navigation in this session.

### Security still outstanding

- Admin credentials are still recoverable from client-side JavaScript.
- The Gist write token is still stored in browser `localStorage`.

---

## 2026-08-14

### In flight

**Social proof on the Before rent page (`index-demo.html` only).**
A trust strip under the four menu buttons and a swipeable row of customer
reviews after the promotions. Edited from a new "รีวิว" admin tab and synced in
the Gist under `socialProof`.

Daily Apps Script (`google-apps-script/social-proof-sync.gs`) writes
`socialProof.googleAuto` (rating, rating count, up to five reviews) and
`socialProof.facebookAuto` (follower count). The page prefers those over the
admin fields and falls back to the admin values when a sync has not run, so a
paused job shows slightly old numbers rather than an empty section.

**Waiting on the shop owner:**
- Apps Script Script Properties: `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACE_ID`,
  `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `GIST_ID`, `GITHUB_TOKEN`.
  Nobody has run `findPlaceId()` or `installDailyTrigger()` yet.
- More real reviews. Four are seeded from screenshots of the Facebook and Google
  pages; the owner wants around ten. Google's sync adds at most five more.
  Do not write reviews that were not left by a customer.

**Not ported to `index.html`.** Everything above is demo-only, as asked.

### Known gaps, deliberately left

- Facebook recommendation rate and review count are typed in by hand. Meta does
  not return review text for this page and the public page rejects any client
  that is not a browser, so there is nothing to read automatically.
- The three promo cards all link to `?go=calc`. Each card's URL is admin data;
  the fix is to set them in the admin panel, not in code.
- The console card carries six lines (day rate, week rate, minimum, deposit,
  call to action). Flagged as cluttered in review; not acted on.

### Recently finished

- Before rent landing page: four-button menu, console rail with carousel arrows,
  type filters, promotions rail, terms line. Merged into `index.html` as a
  three-way merge, not a copy.
- Game picker: `chrome=compact` hides the picker page's own instructions bar and
  console tabs when embedded, with a same-origin style injection as a fallback
  for a picker page that predates the parameter.
- Catalogue page renders 24 cards per platform behind a "show more" button,
  down from all 1,237 at once.
- Bot repo: a foreigner's deposit is refunded through Wise rather than cash.
  Payout route is a single radio choice; the details, the contract PDF and the
  Discord, Telegram and email notifications all read one shared module.

### Watch out for

- `index.html` and `index-demo.html` have diverged. See `AGENTS.md`.
- Declaration order in the inline script has caused three separate
  `ReferenceError: Cannot access X before initialization` faults. `applyLanguage()`
  runs at startup; anything it touches must be declared above it.
- The browser preview pane sometimes renders blank after a resize. Measure the
  DOM rather than trusting a screenshot when that happens.
- The console keeps errors from previous page loads. Check the `?v=` in an error
  before believing it came from the current build.

## 2026-08-29 — Rental Order acceptance UX and PDF snapshot

- Returning-customer Rental Order review now appears inside the returning-customer discount card only after the customer is verified by LINE or the manual eligibility flow.
- The Rental Order modal has its own Thai/English switch, safer edge spacing, and properly spaced acknowledgement checkboxes.
- When the modal is opened by LINE, Messenger, or WhatsApp booking intent, accepting continues that selected channel immediately. Opening the review button directly accepts only the order and prompts the customer to choose a channel.
- LINE Desktop itself does not run LIFF. Desktop booking therefore stays in the external browser, enables LIFF external-browser login, returns to the same signed booking context after login, and then links the LINE account and pushes the Flex card. It no longer invokes LINE Desktop's unsupported-LIFF QR dialog. Mobile external browsers keep the standard LIFF app-launch route.
- The bot's language-specific Rental Order PDF now includes the full accepted Rental Terms snapshot and version on subsequent PDF pages for durable reference.
## 2026-08-30 — Admin review save regression fixed

- Fixed the Reviews admin Save button after the new footer social links reused the admin form's `data-social` attribute and caused `undefined.trim()`.
- Footer analytics links now use `data-analytics-social`; review saving is additionally scoped to `#adminReviews` so unrelated page elements cannot enter the admin payload.
## 2026-08-30 — Analytics delivery reliability

- Website analytics now uses cross-origin `fetch` with `keepalive` as the primary transport and retains `sendBeacon` only as a fallback, avoiding silent beacon loss in stricter browsers.
- The private analytics dashboard now refreshes automatically every 60 seconds and displays its latest refresh time.
## 2026-08-30 — Analytics device and time breakdowns

- Moved the anonymous analytics disclosure to the very bottom of the Before Rent panel and removed the duplicate beneath FAQ.
- Anonymous events now include coarse browser and operating-system families without versions; the dashboard adds device class, browser, OS, and Bangkok hour-of-day session breakdowns.
- Daily chart bars now show their session count directly instead of requiring hover.
## 2026-08-30 — Compact mobile analytics dashboard

- Mobile analytics metrics now use three columns (six metrics in two rows) instead of six full-width cards.
- Device, browser, and OS summaries remain in one three-column row; weekly and monthly summaries share a two-column row.
- Mobile cards, headings, controls, and bar rows use compact spacing; verified at 390 px with no horizontal overflow.
## 2026-08-30 — Product rankings, funnel drop-off, and calendar analytics

- Analytics events now carry anonymous device/game IDs and display names; game selections are emitted from embedded-picker and handoff flows.
- Dashboard ranks devices and games by unique selecting Session, defaults to Top 5, and can expand to all; games are filterable by device.
- Added session funnel/drop-off analysis with explicitly labelled possible causes, plus calendar-month, calendar-year, recent-range, and five-year views.
- Analytics Sheet schema expanded through column P for device/game fields; old rows remain compatible. Mobile dashboard verified at 390 px with no horizontal overflow.
## 2026-08-30 — Legacy analytics device names

- Device rankings now prefer the Device Name stored on each analytics row and resolve older ID-only events against the live website device catalog (plus the device Sheet as fallback).
- Catalog names are cached server-side for five minutes; legacy IDs such as `11` now render as `PS5` without rewriting historical analytics rows.
## 2026-08-30 — Before-rent controls and language analytics

- The Before Rent page now records anonymous clicks for Rent, browse games, rental steps, FAQ, Google/Facebook review links, review/activity cards, all-activity link, and the review/activity carousel arrows.
- Review and activity section exposure is recorded once per Session when at least 35% of the section becomes visible.
- The private dashboard adds dedicated Before Rent and language panels. English-language Sessions are a demand signal only and are explicitly not presented as verified nationality.
## 2026-08-30 — Acquisition, friction, error, and revenue analytics

- The booking site now persists first-touch UTM/referrer attribution per Session, measures Step duration, records availability/API/handoff failures, and attaches Rental ID, device, games, channel, customer type, and quoted value to booking handoffs.
- Analytics Events expands through column AC while remaining backward-compatible with old rows. The dashboard adds acquisition/campaign, Step timing, lost-opportunity value, client error, and payment-backed commerce panels.
- Delivery App posts signed payment and customer-cancellation status events back to the Bot; the shared `AJ_RENTAL_WEBHOOK_SECRET` authenticates both directions. Outside-service-area reporting is supported through the same signed status payload using `reason: outside_service_area`.
## 2026-08-31 — Analytics calendar-day ranges

- หน้า Analytics ของ AJ LINE OA Bot เปลี่ยนตัวเลือก “วันนี้” จากช่วงย้อนหลัง 24 ชั่วโมงเป็นวันปฏิทินตามเวลาไทย (Asia/Bangkok) ตั้งแต่ 00:00 ถึง 23:59:59
- เพิ่มตัวเลือก “เลือกวัน” พร้อม date picker สำหรับดูสถิติรายวันย้อนหลัง และไม่อนุญาตให้เลือกวันในอนาคต
- ช่วงเลือกเดือนและเลือกปีใช้ขอบเขตวันตามเวลาไทยเช่นเดียวกัน
- ค่าเริ่มต้นเมื่อเปิดหน้า Analytics คือ “วันนี้” แทน “30 วัน”

## 2026-09-01 — Onrender ajgameid mirror synchronized

- Synchronized `/ajgameid/` in this repository with the current standalone `ajgameid` catalogue used by GitHub Pages.
- The Onrender copy now supports editable manual IDs and puts not-ready games first, sorted by the farthest ready date before falling back to manual ID order.
- Added a regression test so the embedded Onrender copy cannot silently lose the Thai/English ordering behavior again.

## 2026-09-01 — Returning-customer identity in booking and payment handoff

- The bot now resolves a matched returning customer's name and phone server-side from Contracts or the Delivery App Customers Sheet by verified LINE Unique ID; the public eligibility API still exposes only yes/no agreement status.
- The booking Flex greets matched customers by name in Thai and English, and the name/phone are persisted against the Rental ID.
- Verified SlipOK and Beam payment forwards now include customer identity plus normalized rental details, allowing Delivery App to create the paid booking automatically without retyping name or phone.
- Delivery App treats a rental code carried by the signed payment webhook as the explicit booking target after extension/modification checks, retaining idempotent booking creation and the existing ambiguity safeguards.

## 2026-09-01 — Current Rental Terms, refreshed payment links, and ajgameid LIFF booking

- Admin booking edits now attach the current Thai/English Rental Terms reference and regenerate Beam payment links from the edited upfront amount before saving; payment methods that do not use Beam have stale links cleared.
- `ajgameid` initializes its LIFF identity, stores verified LINE Unique ID/display name/language with the ID Pending row, and immediately pushes a bilingual ID-rental Flex after the customer taps Rent/Reserve.
- When the automatic Flex succeeds, the popup confirms that AJ received the request. Otherwise it keeps the copy fallback. The former guide button in that popup is now “Open AJ LINE”.
- The standalone GitHub Pages and embedded Onrender copies of `ajgameid` remain byte-for-byte synchronized.

## 2026-09-01 — Daily system backup package

- Added a standalone Google Apps Script daily backup for the website and LINE OA Bot; Delivery App is deliberately excluded for its separate owner-managed backup work.
- Each run copies production/legacy Google Sheets as native Sheets plus XLSX, recursively snapshots the Bot contract-output Drive folder, saves both website Gists, and downloads ZIP snapshots plus commit SHAs for `aj-line-oa-bot`, `ajconsole`, and `ajgameid`.
- Every snapshot has per-component results, redacted configuration, JSON manifests with SHA-256 descriptions, and a 30-day retention cleanup. A Thai status email is sent to `ajgamerental2021@gmail.com` after every successful, partial, or failed run without attaching customer data.
- The one-time installer creates a daily Apps Script trigger in the 03:00–04:00 Asia/Bangkok window. Activation still requires the owner to paste the script into Google Apps Script, set the production `GOOGLE_SHEETS_ID` as a Script Property, run the installer, and grant Google permissions.
- The Board Game catalogue Google Sheet is also in the default backup allowlist; the Delivery App Customers Sheet remains excluded with the rest of Delivery App.

## 2026-09-01 — ID rental booking type, cover and LIFF identity UX

- ID rental requests now carry an explicit `immediate` or `advance` booking type based on the same availability window used by the button: available and service-ready offers are “พร้อมเล่นทันที / Ready to play now”; busy or not-ready items are “จองล่วงหน้า / Advance booking”.
- The first HTTPS cover URL from the selected catalogue item is persisted in `ID Pending` and rendered as the LINE Flex hero image. Existing rows remain compatible with the two appended columns.
- The LIFF header shows `LINE: <profile display name>` instead of exposing the LINE Unique ID. On small screens, the language control is aligned at the right edge with the profile badge beneath it.
- Standalone and embedded `ajgameid` copies remain byte-for-byte synchronized.

## 2026-09-06 — Contract notifications wait for Google Drive links

- Fixed contract notifications being sent to Discord, Telegram, and email before the background Google Drive upload had populated the customer folder, ID-card/Passport, and selfie URLs.
- Contract creation still responds to the customer before slow Drive/Sheets work, but the background notification step now runs only after storage finalization; if storage fails, notifications still run and include the recorded upload error.
- Verified the complete Bot test suite: 265 tests passed.

## 2026-09-06 — Shareable links for games, FAQ, and rental steps

- Added bilingual copy-link controls to the game picker, FAQ, and rental-steps dialogs.
- Copied links reopen the requested dialog directly and preserve the selected Thai/English language.
- Game-picker links also preserve the active console so customers land on the relevant game catalogue immediately.

## 2026-09-07 — Local-only redesign demo v1 (not production)

- User requested an isolated redesign demo and a checked implementation list. Workspace: `/Users/ajgame/Documents/AJ Website Redesign Demo`; primary progress file: `CHECKLIST.md`; review notes: `HANDOVER.md`.
- Copied current production source into a separate snapshot, not the diverged `index-demo.html`. Added isolated bilingual design layers for booking, games and a three-step contract form. Production HTML/JS/CSS are unchanged; no push or deployment.
- Preserved the original calendar markup and logic, with desktop/mobile computed-style comparisons. Pricing and structured-payload source functions also match the originals.
- Public snapshots contain 18 website consoles and 1,064 games; Bot catalog has 17 device entries. Mapping audit found unresolved website devices: PS FlexStrike Wireless Fight Stick and Viture Pro 2. Do not guess mappings or silently change inventory names.
- Local Node server at `http://127.0.0.1:8817/` mocks all API writes, LINE identity/delivery, payments, documents and notifications. It does not use production credentials. Images may load from existing public URLs; calendar availability is fictional.
- Browser checks cover all three pages in TH/EN at 375/1440px, and PS5 → dates → two games → contract completion with matching dates/total. Real LIFF, Delivery App/HMAC, allocator concurrency, cloud documents/notifications and full pricing/accessibility acceptance remain unchecked staging work.
- Owner is reviewing demo design; do not merge this snapshot over production. Mock success does not demonstrate that any production LINE/timeout issue has been fixed.

## 2026-09-07 — Local redesign v2 after visual feedback

- In the isolated demo only, replaced the tall 18-console grid with a single horizontal rail. Swipe/trackpad, next-card preview, arrows and existing category filters remain; no devices or card pricing were removed.
- Rebuilt the product-card hierarchy with separate booking and game actions, preserving original nodes/listeners/disabled states. Moved the catalogue above secondary help and promotions; shortened the hero and removed duplicate section headings.
- Updated game catalogue to a compact working header, and the desktop contract wizard to sidebar progress/rental summary plus form content (stacked on mobile).
- Verified 18 cards in a single row, category re-render, arrows, prices and game links at 375/1440px in TH/EN. Rechecked the mobile LINE-mock booking-to-contract flow and unchanged calendar styles. Checklist and screenshots remain in the external demo workspace. No production deployment or source-code changes.

## 2026-09-07 — Rental-window game availability in local demo

- Added demo-only date-aware behavior to the embedded game picker: index sends the selected rental start/return dates, and a game whose `available_date` is inclusively within that range becomes selectable.
- A game ready on the first rental day has no warning. A game ready later in the rental displays a bilingual playable-date label and its selected name sent back to index includes the same date. Games ready after the return remain disabled; standalone catalogue behavior is unchanged without a rental range.
- TH/EN browser test for 15–24 September 2026 verified Wolverine ready on the first day, FC27 ready 19 September, Control Resonant ready 22 September, and GTA VI after the rental still disabled. The existing mobile LINE-mock booking-to-contract regression still passes. This has not been applied to production.

## 2026-09-07 — Rental-window availability production release

- Applied only the rental-window availability feature to production `index.html` and `game_index.html`; no redesign demo styles or layout were merged.
- The index now forwards rental start/return dates to the picker. Games released inclusively during that window are selectable; later releases remain disabled. Games released after the start date show a compact bilingual playable-date label inside the cover image and include the date in the selected-game message.
- Added cache-buster `gamePickerVersion: 20260907-1` and normalised saved names so previously submitted dated labels can still be reselected.

## 2026-09-07 — Rental-window availability correction

- Corrected the inclusive availability rule: games ready before or on the rental return date are selectable, including titles released before the rental start date (for example, NBA 2K27 ready 04/09/2026 for a 15–24/09 rental).
- Increased the in-cover “selectable / playable date” label for readability and bumped the picker cache-buster to `20260907-2`.

## 2026-09-08 — Verified LINE identity persisted to Console Pending

- Fixed the LINE booking handoff race in the Bot service. The website creates the Pending row before LIFF knows the customer account; after LIFF verifies the access token, the Bot now updates the matching Rental ID row in `Line / WhatsApp LOGs` directly through Google Sheets instead of relying only on the separate booking-history update.
- The direct update writes `Line Unique ID` and LINE display name. When the verified account matches an existing contract or Delivery App customer, available customer name and phone fields are also forwarded without changing unrelated booking values.
- The first persistence attempt is acknowledged during the LINE handoff; if the Pending row is still being created, bounded background retries handle the race. Added pure mapping tests and retained the existing booking-history update for Delivery App compatibility. Full Bot suite: 267/267 passing.

## 2026-09-09 — Review-discount actions in LINE booking Flex

- The shared Bot `bookingFlexMessage` now detects Google Maps and Facebook review discounts from structured cost rows, so the behavior applies to LINE bookings sent directly from index and again after contract completion. It works for both 50 and 100 baht discount tiers.
- After the payment instructions, the card shows a concise bilingual instruction to submit a screenshot in the same chat, plus only the selected review-channel buttons. Google Maps uses Google blue and Facebook uses Facebook blue; links point to the shop's supplied review URLs.
- Game-selection token resolution now returns `endDate`/`returnDate` as well as `startDate`, enabling the rental-window release-date logic when Delivery App launches the LINE picker. Implementation prompt: Bot repo `docs/DELIVERY-APP-GAME-AVAILABILITY-PROMPT.md`.
- Bot test suite: 268/268 passing.

## 2026-09-09 — Single-line booking total in LINE Flex

- Updated the shared booking Flex summary so the bilingual total label and amount remain on one row in narrow LINE clients. The label receives more width and both sides use `shrink-to-fit` instead of wrapping.
- Added Thai/English regression coverage. Full Bot suite: 269/269 passing.

## 2026-09-09 — The rental window reaches the picker in the format it is sent

- `normalizePickerDate()` now reads `dd/mm/yyyy` as well as ISO. The Delivery App sends the booking's dates in the format the sheets keep, so the ISO-only reader left `pickerRentalStart`/`pickerRentalEnd` empty and the picker silently fell back to judging games by today's date — the exact behaviour the rental-window work exists to replace.
- A `?t=` token link opened on its own now sets the range from the resolved booking too; previously only the embedded (contract-card) picker and `forceRenderPicker()` received it.
- `tests/game-readiness-window.test.mjs` runs the page's own readiness functions over the acceptance cases: 04/09, 15/09, 19/09, 22/09 and 25/09 against a 15/09–24/09 rental, the Thai and English submitted names, both date formats, and the no-window fallback. The three stale `gamePickerVersion` assertions were pointing at versions `index.html` had already moved past; all now read `20260909-1`, which is also the new cache-buster for this change.

## 2026-09-09 — Newest ready IDs first and age FAQ

- Updated the standalone and embedded `ajgameid` catalogues so unavailable/upcoming IDs remain at the top, while service-ready IDs are ordered newest-first by ID number. This puts newly added ready IDs near the top without overtaking not-ready entries.
- Added a canonical under-20 rental FAQ as the first item on index in both Thai and English. It explains the 20+ contract requirement, parent/guardian signing option and the higher-deposit no-contract option; remote FAQ data is normalised to avoid duplicate age questions.
- Verified the standalone and embedded catalogue files match, targeted ordering/FAQ tests pass, and browser checks confirm the FAQ and live ID order in both languages.

## 2026-09-09 — ID ordering correction for #67 and #68

- Restored the normal service-ready ID order to ascending ID number. Only the recently added IDs #67 and #68 are promoted to the front of the ready group, in that order; every not-ready item still appears before them.
- Applied the same correction to standalone and embedded `ajgameid` and added ordering regression coverage.

## 2026-09-09 — Creation-date ordering for new rental IDs

- New `ajgameid` entries now persist an ISO `createdAt` timestamp. Service-ready entries with creation dates sort newest-first, ahead of the legacy ascending-ID group, while not-ready entries always remain first.
- IDs #67 and #68 seed the new-entry group in that order when their existing records have no timestamp. The next saved ID keeps its sequential number (for example #69) but sorts ahead of #67/#68 automatically.
- Standalone and embedded catalogues use identical logic and regression tests cover the first future new entry.

## 2026-09-13 — Editable FAQ answers and delivery/return terms

- Fixed FAQ normalisation so answers saved through Admin are preserved. Canonical defaults are now inserted only when an item is missing instead of overwriting edited Thai/English answers during every load and save.
- Added a bilingual “How are delivery and return arranged?” FAQ immediately after the delivery-method item. It states that AJ arranges the driver for both trips and the renter only receives and hands back the equipment.
- Added a bilingual no-contract FAQ immediately after the contract-safety item, including the ฿2,000 → ฿5,000 and ฿4,000 → ฿8,000 deposit changes. Its Rental Terms viewer is read-only: no checkbox or acceptance action, only close controls.
- Added the same delivery/return responsibility to the website rental steps, the LIFF contract terms, both languages of the contract PDF, the public Rental Terms page, and returning-customer Rental Order PDFs.
- Advanced the shared Rental Terms version to `2026-09-13` and bumped the LIFF app cache-buster. Verified 58/58 website tests and 292/292 Bot tests, plus Thai/English browser checks and two-page TH/EN Rental Order PDF text extraction.

## 2026-09-13 — Production queue-check CORS repair

- Fixed the booking site's all-device queue failure by adding `/api/availability` to the Bot's public CORS middleware. The endpoint itself was healthy, but browsers could not read its response from `ajgamerental.onrender.com` because the required `Access-Control-Allow-Origin` header was absent.
- Added a regression test that requires the availability endpoint to remain covered by the cross-origin middleware. Bot production commit `80c58ea` is deployed and returns all 36 inventory rows with the browser-access header.
- Rechecked the live booking page for 17 selectable devices over 14–17 September 2026 in Thai and English. Available devices advanced normally, occupied devices showed their real ready dates, and none displayed the queue-check error. A separate clean browser session also completed the initial fetch without cached availability data.
- Verification: 296/296 Bot tests and 59/59 website tests passed; the production page inline script passed `node --check`.

## 2026-09-13 — Compact Krungthai logo placement in booking Flex

- Moved the Krungthai logo from above the transfer instructions to the right of the account-detail column and reduced it from LINE Flex size `sm` to `xs`.
- The layout applies consistently to reservation transfer, full Thai bank transfer and Wise blocks, but only when the destination account is `8690576029`; other bank accounts remain unbranded.
- Added structural regression coverage for the horizontal layout, right-aligned compact logo and exact-account restriction. All 296 Bot tests passed; production Bot commit `8361a18` is deployed.

## 2026-09-13 — Full-width transfer guidance and copy-account button

- Kept bank identity details and the compact Krungthai logo together in the top row, but moved transfer guidance below that row so it uses the full Flex-card width instead of wrapping inside the narrow text column.
- Added native LINE clipboard buttons in Thai (`คัดลอกเลขบัญชี`) and English (`Copy account number`). The action copies only the destination account number and is used by reservation-transfer, full-bank-transfer and Wise detail blocks.
- Verified against LINE's current clipboard action schema, added bilingual structure/action tests, and passed all 297 Bot tests. Production Bot commit `9ac8d4c` is deployed; Thai and English test cards were successfully pushed to the owner's requested test account.

## 2026-09-13 — No-contract confirmation details and one-time acceptance

- The Bot's no-contract Rental Terms page now switches Thai/English locally and immediately, without depending on a second booking API request. The terms iframe follows the selected language.
- Added rental fee, rental start date, return date and rental-day count above the original/new deposit comparison. Completion copy now says that updated details were sent to the chat and does not expose the internal “Flex Card” term.
- Added a bilingual second confirmation dialog warning that acceptance is available only once. A previously accepted booking returns in a locked state, and the server rejects both repeated and overlapping acceptance attempts before recalculating or resending anything.
- Regression coverage checks the added quote data, bilingual wording and server-side duplicate guards. Full Bot verification passed 305/305 after the final page changes.

## 2026-09-15 — Stable released-game ordering and featured ID placement

- Updated the standalone `ajgameid` catalogue so upcoming/not-ready games remain first, newly added games keep their creation-date group, and games that become ready move into a stable released group after the new entries instead of jumping into the legacy list. Released entries retain ready-date order.
- Added the requested one-off placement for IDs #70, #8 and #71: they are grouped in that order immediately before ID #69 while every other game's relative order is preserved.
- Verified the live local catalogue in Thai and English: 71 IDs render, the language switch works, and the featured group is placed before ID #69. Browser console had no warnings or errors.
- Verification: 63/63 website tests passed, the inline `ajgameid` script passed `node --check`, and `git diff --check` passed.

## 2026-09-20 — Contract handoff identity, bank logo delivery and exact add-ons

- Fixed the missing Krungthai logo at the HTTP layer: the Bot now serves only `/assets/banks/*` with `Cross-Origin-Resource-Policy: cross-origin`, allowing LINE's Flex renderer to fetch the image while other public assets keep Helmet's stricter default. The same compact logo is now also present in the post-contract payment card for account `8690576029`.
- The booking site preserves a recent draft's Rental ID and signature for six days when the customer returns from the contract site. Unchanged details reuse the original Rental ID; changing the rental details or deliberately clearing the dates still creates a new booking. This prevents a second ID when a customer signs and then taps LINE again.
- Contract completion copy in Thai and English now explicitly says the booking and agreement are complete, not to create or send another booking, and to wait for AJ to confirm delivery fees and the amount due.
- Booking context now carries exact `bundleIds` and `accessoryIds`, including explicit empty arrays. The Bot treats those IDs as authoritative when generating the agreement, so an unselected hidden/stale accessory such as Switch `bat-grips` cannot appear in the PDF.
- Verification: 65/65 website tests and 318/318 Bot tests passed after rebasing onto the latest `origin/main`. The website inline script passed `node --check`, both repositories passed `git diff --check`, the real Express server was checked in Thai and English, the bank image returned HTTP 200 with `Cross-Origin-Resource-Policy: cross-origin`, and a rendered two-page Nintendo Switch 2 contract with no add-ons contained no bat-grip text.

## 2026-09-20 — Bag-lock transport evidence added to Rental Terms

- Updated the current Rental Terms version to `2026-09-20` on the public terms page, booking/contract handoff, and no-contract acceptance flow.
- Added bilingual clause 2, “Combination Lock for the Bag During Transport”, requiring the return bag to be locked, its digits moved away from the unlocking combination, and clear equipment and handover photos. The clause explains that any transport damage or loss is assessed from before/after photos or video, lock and handover evidence, driver/platform information, and AJ's receipt inspection before AJ reports the findings, responsibility, and any evidenced charge.
- Renumbered the existing damage/loss clause from 2 to 3 in the public Rental Terms, LIFF contract page, full contract PDF, and Rental Order PDF snapshot. Rental Order PDFs now group these clauses under “Other Penalties” with their intended 1–3 numbering.
- Replaced the contract PDF's hard-coded two-page footer with dynamic page numbering because the complete English terms now require a third readable page; Thai remains two pages.
- Verification: 319/319 Bot tests passed. The real Express Rental Terms page was checked in Thai and English, four QA PDFs (contract and Rental Order in both languages) were text-checked and visually rendered, and all headings, clause numbers, wrapping, signatures, and page counts were correct.

## 2026-09-20 — All-console booking popup and direct link

- Changed the end-of-rail action to “ดูเครื่องเกมทั้งหมด” / “View all game consoles” and made it open a dedicated full catalogue popup instead of leaving the before-rent page.
- The popup reads the same live console catalogue as the booking flow, groups devices by brand, includes type/brand/sort controls and switches Thai/English in place.
- Every console card has a “เช็คคิวและจอง” / “Check availability & book” action that closes the popup, selects that exact console and opens its queue/booking flow.
- Added direct-entry URLs with `?allConsoles=1` (and the `#all-consoles` alias), compatible with `lang=th` and `lang=en`, so shared links open the popup immediately.
- Verification: 68/68 website tests passed, the extracted inline script passed `node --check`, `git diff --check` passed, and the real local page was exercised in both languages including direct-link opening and device-specific booking selection.

## 2026-09-20 — Compact all-console cards and copyable popup URL

- Reduced only the catalogue cards inside the all-console popup: desktop now fits five cards per row at the standard popup width, with smaller artwork, pricing, details and actions. The normal console cards elsewhere on the site are unchanged, and the popup keeps a compact two-column phone layout.
- Added a visible “คัดลอก URL” / “Copy URL” action to the popup header. It copies the direct `?allConsoles=1` link with the currently selected `lang=th` or `lang=en` value and confirms completion using the existing bilingual URL-copied toast.
- Verification: 69/69 website tests passed, the extracted inline script passed `node --check`, `git diff --check` passed, and the local popup was visually checked in Thai and English. The clipboard output was also confirmed to contain the direct popup URL and selected language.

## 2026-09-20 — Removed excess spacing between popup console groups

- Reset the global page-section padding for brand groups inside the all-console popup. This removes the unintended 112px vertical gap after short groups such as Nintendo Switch while preserving a compact 20px separation before the next brand heading.
- The change is scoped to the popup and does not affect normal page sections or console cards elsewhere. Verified visually across the PlayStation → Nintendo Switch → Xbox transition and covered by the popup regression test.

## 2026-09-20 — Collapsible popup type and brand filters

- Converted the all-console popup's Type and Brand chip rows into compact disclosure controls. Both start collapsed whenever the popup opens and visibly report the current choice as “เลือกอยู่: …” / “Selected: …”.
- Each row expands independently on demand. Selecting an option applies the filter, refreshes the available catalogue and collapses that row again; changing Type also resets Brand to All so the visible state always matches the results.
- Verified the collapsed, expanded and post-selection states in Thai and English. Website suite: 70/70 passing; extracted inline JavaScript and `git diff --check` also pass.

## 2026-09-20 — Game-limit detail follows the game-picker button

- Console cards now show “เลือกเกมได้สูงสุด 10 เกม” / “Choose up to 10 games” only when that same card actually has an available game-picker button.
- Cards without the action, including PS Portal and PS VR2, keep their equipment details but omit the misleading game-limit line. The same rendering rule applies to both the all-console popup and the normal full catalogue.
- Verified visually in Thai and English while confirming game-enabled PlayStation cards retain their game details. Website suite: 71/71 passing; extracted inline JavaScript and `git diff --check` also pass.

## 2026-09-20 — Direct booking-page URL aimed at the calculator heading

- Added `?booking=1` as a dedicated entry point that opens the queue-check/rental calculator at step 1, points the initial viewport at the “คำนวณ” / “Calculate” heading and supports the existing `lang=th` / `lang=en` override.
- “กลับเมนูก่อนเช่า” / “Back to Before rent” remains present immediately above the heading and can be reached by scrolling upward; the direct link does not hide or remove it.
- Verified the initial heading position and the retained back button in a real browser. Website suite: 73/73 passing; extracted inline JavaScript and `git diff --check` also pass.

## 2026-09-20 — Game picker ignores expired rental drafts

- Added one shared live-rental-window check in `game_index.html`. An expired window restored from browser storage no longer controls availability, mid-rental ready labels, or ready-date text; the picker falls back to today's date instead.
- The booking page now clears expired start/end dates from all three picker handoffs while preserving a current or future rental range. The picker cache-buster is `20260920-1`.
- If the GitHub Gist API fails, the catalogue now retries the uncached raw `ajgame-data.json` URL before retaining the cached catalogue.
- Verification: 78/78 website tests passed; extracted inline JavaScript and `git diff --check` passed. The real local picker was opened with a restored 25–28 August draft in Thai and English: NBA 2K27, The Blood of Dawnwalker, Onimusha and Marvel's Wolverine rendered as available, while genuinely future releases retained their ready-date ribbons.

## 2026-09-22 — Once-per-day Messenger welcome bridge

- The Dialogflow fulfillment now starts the detached greeting bridge as soon as a Facebook request is identified, in parallel with Messenger slip verification. The bridge receives the PSID, Messenger message ID and query text, with a two-second timeout and fail-open behavior.
- A greeting is prepended to either the webhook's own reply or Dialogflow's existing Facebook static messages, so enabling the daily welcome does not remove the matched intent response. Declines, timeouts, non-200 responses, malformed responses and network failures preserve the previous behavior.
- Facebook greeting intents no longer enter the LINE-only `askFlexSentToday` suppression path. The bridge is disabled unless both `GREETING_BRIDGE_URL` and `GREETING_BRIDGE_TOKEN` are configured; tokens are never logged and PSIDs are masked.
- Verification: all 344 Bot tests passed, including greeting/static-reply order, greeting plus slip reply, bridge failure modes, LINE isolation and empty configuration. The real Express server started on port 8797 and `/healthz` returned HTTP 200.

## 2026-09-22 — Messenger greeting preserves DEFAULT replies

- Fixed the first-message greeting merge so Messenger no longer drops platform-less slip results or Dialogflow DEFAULT-tab intent messages when they follow a FACEBOOK greeting.
- Static intent fallback now prefers explicit FACEBOOK messages and otherwise carries messages without a platform or with `PLATFORM_UNSPECIFIED`. Carried DEFAULT messages are cloned and tagged `FACEBOOK`; the Dialogflow input remains unchanged.
- Verification: 345/345 Bot tests passed, including greeting plus slip-result text and greeting plus DEFAULT-only intent text with every emitted message tagged for FACEBOOK.

## 2026-09-22 — Bilingual general Rental Terms and version alignment

- Added bilingual general terms covering acceptance and electronic records, definitions, renter eligibility (age 20 or older), lawful residential use, care and prohibited modification, and transfer/subletting restrictions. The same wording now appears on the public Rental Terms page, LIFF contract form, full contract PDF, and Rental Order PDF snapshot.
- Advanced the current Rental Terms version to `2026-09-22` across the Bot, booking site, contract handoff, and no-contract flow so stale acceptances are invalidated consistently while existing Master Agreements remain unchanged.
- Made Rental Order penalty numbering independent of the number of preceding general clauses, and prevented contract signatures from being drawn on pages that have no recorded signature placement.
- Verification: both bilingual three-page QA PDFs were rendered and visually inspected; Bot and website regression suites, JavaScript syntax checks, and `git diff --check` passed.

## 2026-09-22 — Public information popups and unified rental-flow demo

- Added bilingual About Us, Privacy Policy, and Terms & Conditions popups to the before-rent menu, booking flow, and footer. About uses the live catalogue count and the real AJ service model; Privacy reflects the data, service providers, identity-document retention, and agreement retention currently used by the booking and contract systems; Terms embeds the one current server-owned Rental Terms document.
- Added the unlinked `/rental-flow-demo.html` entry point. It feature-gates a redesigned flow on the production booking page so the demo uses the live catalogue, availability calendar, pricing, returning-customer checks, discounts, game picker, agreement context, and payment choices without changing the normal customer journey.
- In demo mode, equipment, dates, bundles, accessories, and games share the first stage; customer details, Google Maps delivery location, returning verification, and the rental agreement share the second; summary and payment are in the final stage. The form uses legal name and phone instead of OTP.
- The LIFF agreement can be embedded only by AJ's production origin (plus local-development origins), receives the demo customer name, phone, and map from the booking context, and reports successful completion back to the parent booking page before the final stage unlocks.
- Documented the production Lalamove design in `docs/UNIFIED-RENTAL-FLOW-DEMO.md`: two live v3 quotations for outbound and return, server-only credentials, Motorcycle for one standard device, Car for Logitech G29 or more than three devices, and no invented fixed price. Lalamove's priority fee is an order-stage fee, so the owner must approve a priority-fee policy and provide production credentials and exact pickup coordinates before it can be included in checkout.
- Expired booking drafts are cleared when the demo opens, preventing an old browser date range from blocking the first step or being passed into the game picker.
- Verification: 85/85 website tests and 349/349 Bot tests pass; both modified JavaScript files pass `node --check`; both repositories pass `git diff --check`; the real Express server returned the restricted frame policy; and the live-data local page was visually checked in Thai and English for both Production and Demo layouts.

## 2026-09-22 — Demo identity stage, rental dashboard, and post-payment confirmation

- Reworked only the feature-gated unified demo into three customer-facing stages: equipment/dates/options, customer/delivery/Rental Terms, and identity verification. Step 2 now includes Thai ID or passport, complete delivery-address fields, Google Maps, returning-customer verification, the no-contract choice, and a bilingual embedded Rental Terms acceptance.
- Step 3 keeps both a readable document-only image and a selfie holding the same document, with an explicit verify-later path. Uploading does not claim that identity is verified; the demo labels skipped identity incomplete and selected files as not uploaded. Sensitive identity values and images are page-memory only and are never written to localStorage.
- The no-contract proposal is scoped to the demo and raises deposits from ฿2,000 to ฿10,000 and from ฿4,000 to ฿15,000. Production retains its current tiers.
- Added a bilingual post-step Rental ID dashboard with item, customer, masked identity, address, dates, identity status, price breakdown, round-trip delivery quote status, and selectable Beam payment methods. Demo checkout uses the existing `/api/payments/beam-link-demo` endpoint and charges ฿1 rather than creating a production amount.
- A successful demo Beam return carries the opaque booking context into the existing payment-success page. Thai shows LINE; English shows LINE and WhatsApp with a payment-screenshot message. The LINE handoff verifies the token, persists the LINE identity, and sends only the existing confirmation Flex (`contractDone=true`), never the preliminary booking-message Flex. Delivery App payment forwarding and Flex behavior are unchanged.
- Verified LINE access tokens may return only that customer's name, phone and LINE display name for safe autofill. A caller-supplied/stored LINE user ID can still check eligibility but cannot retrieve profile data.
- Verification: 87/87 website tests and 350/350 Bot tests pass; both JavaScript syntax checks and `git diff --check` pass; the real Express server started on port 8797; and browser checks confirmed the live queue flow plus Thai/English post-payment visibility and confirmation-only LIFF URL.

## 2026-09-23 — Demo review fixes after Codex handover (Claude Code)

- Reviewed Codex's uncommitted demo identity/dashboard/confirmation-Flex work in both repos and walked the real page in Thai and English with payment/sheet POSTs stubbed (no production writes).
- The step-3 summary no longer shows the old “จองผ่าน Line / Messenger” chat-booking buttons in demo mode; the demo pays only from the Rental ID page.
- The no-contract checkbox now sits directly under the ID/passport and email row, as specified.
- Province default follows the page language (กรุงเทพมหานคร / Bangkok) instead of always showing “Bangkok”.
- Fixed large vertical gaps on the Rental ID dashboard (global `section` padding leaked into `.demo-order-section`).
- Reloading while the Rental ID page was open used to show blank customer details and a wrong “files selected” identity status, because identity data is page-memory only; it now reopens step 2.
- Verification: 90/90 website tests and 351/351 Bot tests pass; `git diff --check` passes. Nothing committed yet.

## 2026-09-23 — Demo: postcode lookup, read-to-accept terms, real identity upload (Claude Code)

- Document type (Thai ID / passport) is now its own choice in step 2, independent of the page language; Thai IDs are check-digit validated.
- Postal code fills subdistrict, district and province for Bangkok and the five surrounding provinces from `assets/data/service-area-addresses.json` (kongvut/thai-province-data, MIT). Multi-subdistrict codes offer a list; codes outside the area show a note; a new postal code clears only values the lookup filled. A link opens the typed address in Google Maps so the customer can pin and paste the share link. Names follow the page language.
- The Rental Terms checkbox unlocks only after the embedded terms page reports that it was scrolled to the end (`AJ_RENTAL_TERMS_READ`; also works when opened in a new tab). A hidden (zero-height) frame never counts as read.
- Identity images are now actually sent: resized in the browser, posted to the new Bot endpoint `POST /api/booking-context/:token/identity`, uploaded to Drive with `aj-identity-delete-after:<return date + 30 days>` in the description, local copies deleted, shop notified (Discord/Telegram/email), booking marked `submitted_pending_review`. The dashboard shows "images received — awaiting AJ review".
- Correction to the earlier handover: there was no automatic identity-image deletion anywhere. The Apps Script now has `purgeExpiredIdentityFiles` + `installIdentityPurgeTrigger`. **Owner action needed:** redeploy `DriveUploadWebApp.gs` and run `installIdentityPurgeTrigger()` once; before that, uploaded files carry no deletion date. Contract (LIFF) identity images are still not covered, because Master Agreements reuse them across rentals.
- Verification: 94/94 website and 357/357 Bot tests; a local end-to-end run (Bot on 8797 with a mock Apps Script) uploaded both images with the right deletion date, removed local copies, and returned the correct errors for invalid images, unknown context and the 3-upload limit. Thai/English and 375 px width checked.

## 2026-09-23 — Demo step-2 validation, identity decline, Lalamove quotes, AJ domain prep

- Step 2 now marks what is missing: required fields carry `*`, the Next button stays clickable, and pressing it outlines every unfilled field in red, prints the reason under it and scrolls to the first one. The old silent gate blocked customers who had, for example, typed a three-character house number.
- Removed the OTP/autofill explanation line from step 2.
- The no-agreement option became "ไม่ต้องการยืนยันตัวตน / ไม่ต้องการให้ข้อมูลส่วนตัว" / "I prefer not to verify my identity or share personal documents": it hides the document type and number, skips step 3, sends no document details to the sheet, and keeps the higher deposit. Its warning no longer claims identity is still required before delivery.
- Choosing games no longer jumps the customer from step 1 to step 2: the guide's step mapping is ignored in the demo, where games belong to step 1.
- Lalamove: new Bot endpoint `POST /api/delivery/quote` quotes both trips, adds a ฿50 priority allowance per trip, applies the ฿100/฿200 delivery promotion, and picks motorcycle or car from the load. The Rental ID page shows the fare, the promotion and a total including delivery, and says "awaiting confirmed quote" when Lalamove is not configured. Google Maps links are resolved server-side with a host allowlist.
- Privacy Policy now states that Beam processes payments and AJ stores no card or e-wallet credentials (Thai and English).
- Customer-facing contact email is contact@ajgamerental.com. The Wise payment account stays on the Gmail address.
- Prepared ajgamerental.com: the Bot accepts it and www as an allowed origin and frame ancestor. The site carries a `CANONICAL_REDIRECT` flag (off) that will forward Render links to the domain once it answers.
- Verification: 100/100 website and 362/362 Bot tests; a local run with a mock Lalamove confirmed ฿118.50 + ฿50 per trip → ฿338 round trip, ฿100 discount at 4 days and ฿200 at 9 days with a car for a racing wheel, plus rejection of a non-Google map link. Thai and English checked in the real page.

## 2026-09-23 — Identity images retained for the Master Agreement year

- Correction to the same-day entry above: identity images are kept for **one year from the return date**, not 30 days. A returning customer may rent again without verifying identity for a year, and that verification has no other evidence behind it, so a 30-day deletion would have removed it.
- `IDENTITY_RETENTION_DAYS` is now 365, so every uploaded file carries `aj-identity-delete-after:<return date + 1 year>`. `aj-identity-hold` still keeps a file for a dispute.
- A new identity-data-retention clause (bilingual) now appears in the public Rental Terms page, the contract PDF, the Rental Order PDF, the LIFF contract form, and the website Privacy Policy. It states the one-year period, the returning-customer reason, and that AJ stores no card or e-wallet credentials. The Rental Order clause sits with the general terms, above OTHER PENALTIES, and penalty numbering is unchanged.
- Rental Terms version advanced to `2026-09-23` in the Bot, the no-contract flow, the terms page, and the booking site, so earlier acceptances are invalidated and customers accept the new wording.
- LIFF cache-buster is `20260923-retention-v1`.
- Verification: 362/362 Bot and 100/100 website tests; four QA PDFs rendered and read page by page in both languages; the real booking page loaded with no console errors after the version constant moved.

## 2026-09-23 — ajgamerental.com is live

- DNS at Porkbun now points the root (ALIAS) and `www` (CNAME) at `ajgamerental.onrender.com`; Render verified both and issued the certificate. Render's dashboard briefly kept showing "Certificate Error" after the certificate was already valid — a refresh clears it.
- `CANONICAL_REDIRECT` is on: any `*.onrender.com` link forwards to `https://ajgamerental.com` with its path and query intact. Old links keep working.
- Customer-facing URLs now use the domain: Beam success/failure returns, the game-picker link in LINE, the payment-success details link, and the booking viewer in shop notifications. Allow-lists (CORS, frame ancestors, embedded-agreement origins, game-picker URL validation) accept the domain, its www host and the Render host.
- LIFF cache-buster is `20260923-domain-v1`.
- Verification: 362/362 Bot and 100/100 website tests; the live domain serves the site over TLS, the Render link forwarded to it with query intact, the demo loaded with no console errors, the catalogue rendered 19 consoles, and a cross-origin call to the Bot from the new origin was accepted.

## 2026-09-23 — Demo step 2 and 3 usability pass

- Step 3 is now full width in the demo, so the upload cards no longer share a row with the summary; the summary follows underneath. Upload cards, fields and phone layout all gained spacing.
- Each identity upload has a camera button (rear camera for the document, front camera for the selfie) and a "see an example" button that shows AJ's existing example photos from the contract service. The Bot now serves `/assets` with `Cross-Origin-Resource-Policy: cross-origin` so the booking site can display them.
- Removed the red "a separate document image is still required" warning.
- Subdistrict is a dropdown filled from the postal code; district and province are filled and read-only. A postal code outside the service area falls back to free text and keeps the out-of-area note.
- English adds "I don't have Thai address details", which hides the Thai address fields and keeps only the Google Maps pin, with AJ confirming the delivery point in chat.
- Rental Terms acceptance is no longer gated on scrolling to the end; the terms stay embedded with a new-tab link.
- Fixed the "cannot check availability" dead end reported after pressing Confirm: the Console Pending sheet write is no longer awaited before the Rental ID page opens. It retries once in the background, so a cold Bot cannot strand a customer between identity and payment.
- Verification: 102/102 website and 362/362 Bot tests; the real page was walked in Thai and English on desktop and at 375 px, covering the postcode dropdown, the example-image modal, the visitor address checkbox and the terms checkbox.

## 2026-09-23 — Rental ID page detail, shared payment picker, returning-customer identity

- The Rental ID page now shows the console photo with everything included: equipment details, bundle, accessories, board games and the chosen games.
- "Verify now" sits on its own row on the right, clear of the divider.
- The payment picker is one shared function used by the booking page and the demo, so the demo shows the real method names, logos and fees with no "via Beam" wording. The Thai reservation option reads "ชำระค่าจอง ฿200 และที่เหลือปลายทาง"; English keeps its own ฿1,000 reservation wording and gains Wise with the existing availability note and a small Wise logo.
- The customer block labels the document as Thai ID or passport, following the chosen type.
- The payment breakdown is grouped and colour-coded: charges, discounts (including returning-customer 10% and both review discounts), the refundable deposit, delivery (with "ประเภทรถ" instead of the priority-fee line) and the totals.
- A returning customer with a valid Master Agreement no longer verifies identity: the document fields disappear from step 2, step 3 reports the agreement's expiry date, and the booking records `verified_master_agreement`. An expired agreement asks for identity again.
- Ticking the returning-customer discount shows both review discounts, exactly as the booking page does, and they use the existing ฿100 / ฿50-with-promotion logic.
- A verified LINE sign-in now also fills the saved email and address; the Bot returns them only for the customer's own verified token.
- Verification: 107/107 website and 362/362 Bot tests, plus a full walk in Thai and English covering the new page, the picker, the review discounts and a simulated live agreement.

## 2026-09-23 — In-page checkout, detail line breaks, Wise logo, document on file

- Catalogue details written as one cell with `\n` now render as separate lines on the Rental ID page and in the booking summary (`splitDetailLines`).
- "สร้างลิงก์ชำระเงิน" became "ชำระเงิน" / "Pay now", and checkout opens in a modal over the Rental ID page instead of a new tab. The modal explains that changing the method means cancelling and choosing again, keeps an "open in a new tab" link for providers that refuse framing, and watches for the same-origin payment-success/failed return to carry the whole page there.
- The Wise option leads with the Wise logo followed by "pay full amount" on one line, replacing the "🌍 Wise:" text.
- A returning customer verified through LINE now sees the document AJ already holds (masked to the last four characters). The Bot returns only those four characters and the document type, and only for a verified LINE access token.
- Verification: 111/111 website and 362/362 Bot tests; the modal, the cancel note, the automatic return handling, the split detail lines and the Wise option were all checked in the real page.

## 2026-09-23 — Demo UX pass 3, rewritten policy copy, document expiry

- Checkout no longer tries to frame the payment provider (it answers `x-frame-options: DENY`); "ชำระเงิน / Pay now" takes the tab straight to the provider, which returns to AJ as before.
- The Rental ID page: each block has an Edit button back to the step that owns it, the step-3 summary sidebar is gone (the page already shows it), and the equipment details run in two columns on phones.
- Email is now required in step 2, because the confirmation will be sent there.
- Identity documents now carry an expiry date. An expired document blocks the step with a clear message and, for a returning customer, cancels the "agreement covers identity" shortcut so a new agreement is made.
- Map-link resolution follows up to four hops, which fixes short links that redirect more than once before reaching the coordinates.
- Discount options look like rewards (badges, warmer card) and the identity step carries artwork drawn for AJ rather than borrowed from another site.
- About and Privacy copy rewritten: shorter, contact details on their own lines, friendlier service description instead of "no storefront", "more than 20 models", Thai wording for rental ID / rental order / rental terms, and the removals the owner asked for (Discord/Telegram, "does not sell data", web statistics, handover evidence, accounting records).
- Rental Terms wording: modification clause without "repair/jailbreak", one-day notice before 12:00 for a date change, preparation time only after AJ has everything, and the identity-retention clause now states that the shortcut lasts only while the document is valid.
- Verification: 115/115 website and 362/362 Bot tests, plus a walk in Thai on desktop and at 375 px covering the expiry rule, the edit buttons and the two-column details.

## 2026-09-23 — Paid rentals confirm themselves, pickup points are chosen by the shop

- A successful Beam payment now completes the rental on its own: it issues the rental order PDF, emails the customer a bilingual confirmation with the document links and copies `booking@ajgamerental.com`, and sends the existing confirmation Flex when AJ already knows the customer's LINE account. It runs once per rental code, falls back to the booking-context cache or the Console Pending row when the webhook lookup is empty, and never throws — the payment has already been taken.
- `sendCustomerEmail` is the first mail with a real recipient; the Apps Script web app now accepts `to`, `cc` and `replyTo`. **Owner action:** redeploy `DriveUploadWebApp.gs` (the same redeploy that installs `installIdentityPurgeTrigger`) and set up `booking@ajgamerental.com`, otherwise the copy bounces.
- Pickup points are stored in the `Pickup Locations` sheet and managed from a new admin tab: add, edit, delete, and mark which one is current. Delivery quotations start from the current point, with `LALAMOVE_PICKUP_*` kept as the fallback.
- `docs/DELIVERY-APP-ID-EXPIRY-PROMPT.md` holds the task description for the delivery app's expiry warnings.
- Verification: 367/367 Bot and 116/116 website tests, plus a local signed Beam webhook that produced the rental order PDF and a confirmation email addressed to the customer with the booking mailbox copied.

## 2026-09-24 — Calendar capacity fix, collapsible payment, edit dialogs, editable About

- Calendar: a browser's own booking hold no longer marks its dates "In progress" when other units are free. Dates are blocked only when holds use up every free unit, matching the Bot's capacity check (which already ignored the holder's own hold). This was why PS5 showed "In progress" for 24–30 September with four units free.
- Payment picker (booking page and demo, both languages): the two groups collapse like an accordion; "pay on delivery" opens by default and opening one closes the other.
- Confirm-and-pay and Pay now show a grey "preparing" veil while the page talks to the services, so the customer cannot double-submit.
- Edit buttons on the Rental ID page open the real step in a dialog with Save and Cancel; Cancel restores the previous values, and the calendar opens above the dialog.
- The identity artwork labels both documents (Thai ID / passport).
- About: the three highlight boxes are gone and the text is editable from a new admin tab, stored in the `Site Content` sheet via `/api/site-content/about` (public read) and `/api/admin/site-content/about` (admin write), so every device sees the same copy.
- Contact blocks use "label: value" with tap-to-call, the LINE add-friend link `https://lin.ee/w4TFyCV`, and a mailto link.
- The document expiry date is collected in the LIFF agreement form (prefilled from the booking), printed in the contract PDF and included in the shop notifications. Remaining Thai "Rental Terms" wording now reads "เงื่อนไขการเช่า".
- Verification: 120/120 website and 367/367 Bot tests; browser walk covering the veil, the accordion, save and cancel in both edit dialogs, the calendar over the dialog, and a simulated own hold that leaves every date free.

## 2026-09-24 — Pay first, verify after; the form survives a refresh

- Renters may still choose "verify later" and pay. After payment they receive a signed per-rental link (Bot `/verify/`) in the confirmation email, as a one-button LINE Flex when AJ knows the account, and on the payment-success page (the only immediate follow-up a WhatsApp customer sees). The link opens that rental only and expires after 45 days.
- A daily job (10:00 Bangkok) reminds renters whose rental starts tomorrow and tells the shop which rentals are still on hold. `POST /api/admin/identity-reminders/run` runs it on demand.
- The shop's payment notice now states the identity position, including "จ่ายแล้ว / ยังไม่ยืนยันตัวตน ห้ามส่ง". The delivery app receives `dispatchHold` with the payment and an `identity-updated` event when photos arrive; `docs/DELIVERY-APP-ID-EXPIRY-PROMPT.md` in the Bot repo describes the delivery app's side.
- The demo form is kept on the device for 24 hours and restores after a refresh or a closed tab, returning to the saved step. The document number is not stored in the browser: it goes to a server-side draft (24 hours, in memory) and the page keeps only the draft id and last four characters. The payment-success page clears the saved form.
- Verification: 122/122 website and 376/376 Bot tests; local end-to-end run with a signed payment webhook, the confirmation email carrying the link (copied to booking@), an upload through the link (Drive files dated one year after return, shop notified, link then reports "already sent"), a forged link rejected, a refresh restoring every field with the number masked from the draft, and the success page showing the identity request in English.

## 2026-09-28 — Delivery App owns paid-booking confirmation

- Removed the Bot's paid-rental `bookingFlexMessage` send, which produced the obsolete “ส่งข้อมูลจองแล้ว” card after payment. The Bot still sends the separate identity follow-up when the renter chose to verify later.
- Verified payments continue to move Console Pending into Booking through Delivery App. When LINE was not known until the customer tapped LINE on the success page, the Bot now forwards the verified LINE Unique ID through a signed `/api/integrations/aj-rental/line-linked` call.
- Delivery App attaches that LINE account to the Booking and sends its existing “ยืนยันการจองเรียบร้อยแล้ว” card. The send is once-only, rejects a conflicting LINE account, retries while the payment webhook is still creating the Booking, and does not expose the LINE ID in logs or responses.
- If an idempotent payment webhook finds an existing Booking, Delivery App also performs the same once-only LINE confirmation when the payment already carries a LINE ID.
- The English paid-rental pop-up now tells WhatsApp customers to screenshot that page and send it to the AJ chat they used; the notice is intentionally absent in Thai.

## 2026-09-28 — Padlock-code charges in the terms and return-day reminder

- Rental Terms version `2026-09-28` adds the bilingual rule for a changed padlock code: ฿300 when AJ can recover the code, or ฿1,500 when the lock must be cut/destroyed or an AirTag or installed equipment is damaged. The shared terms source feeds the public terms page, LIFF agreement, contract PDF, and Rental Order PDF.
- The built-in `2026-09-23` wording remains available for documents already accepted under that version. Records created before the new version's effective time continue to resolve to the old terms when rebuilt.
- Delivery App's same-day return Flex now tells the renter to turn every digit away from the original code, explicitly forbids changing the combination, and shows both charges below the grey code box. Thai and English use the same structure; the existing return details, codes, and Extend Rental button are unchanged.
- Verification: 410/410 Bot tests; Delivery App TypeScript build plus 23/23 return-day, 6/6 reminder-language, and 54/54 delivery-card checks; Thai and English three-page contract PDFs rendered and inspected page by page.

## 2026-09-28 — Unified rental flow production default, resilient checkout, VIP pricing

- The unified rental flow is now the default production experience. The ฿1 test charge is disabled and the demo-charge notice is hidden. The previous flow remains available temporarily with `?legacyFlow=1` for rollback.
- Checkout waits longer for Beam and shows bilingual failure feedback instead of remaining behind a permanent loading veil. LINE handoff now shows bilingual instructions before opening LINE and uses one signed handoff, so customers do not need to press the button twice.
- Delivery and return guidance now states that the return pickup uses the same time of day as the original delivery unless AJ agrees otherwise. Delivery App carries that exact time into an automatically created Booking.
- Web booking data now carries the quoted round-trip delivery fee, full delivery address and Google Maps link through Console Pending into Booking, the confirmation Flex, confirmation email and My Rental detail.
- The payment-success WhatsApp message includes the customer's signed direct My Rental link. A signed email/WhatsApp link opens the rental directly without asking for the booking credentials again; the ordinary lookup still requires them.
- Completing identity upload forwards the customer's LINE identity to Delivery App, which sends a bilingual receipt Flex confirming that AJ received the documents. The existing dispatch hold and human-review rules remain unchanged.
- VIP pricing is data-driven and initially includes the two owner-supplied profiles. It is applied only after returning-customer/LINE verification, supports all-device deposit overrides and device-specific rental rates, does not expose the VIP list in the page, and labels the entitlement in Thai and English.
- Current scope of the signed public My Rental link is secure direct viewing. Customer mutations still use Delivery App's authenticated LINE My Rental actions; WhatsApp cannot attach a generated image through a `wa.me` prefilled message without a WhatsApp Business media API.

## 2026-09-28 — VIP admin, Before rent restored, return-card line break

- VIP profiles moved out of the public booking source into the Bot's private `VIP Customers` Google Sheet. The protected website Admin now has a bilingual **VIP members / สมาชิก VIP** tab that can add, edit, disable and delete any number of members; match by Thai phone or optional LINE Unique ID; choose deposit benefits for every device or selected devices; and set daily/weekly rental rates for every device or per device (per-device rates override the all-device rate).
- The two launch members are seeded only when the VIP sheet has never been initialized. Saving an empty member list writes a private empty marker, so deleting every member does not silently recreate them later. Customer eligibility responses include only that renter's entitlement and never expose the private member list, phone, or LINE ID in the public page source.
- Normal visits once again open on **Before rent**. Entering the booking/queue flow shows the existing back button, including in the unified production flow. Deep links with an existing rental context still open their intended destination.
- Removed the empty yellow demo strip above the three booking steps. The production flow still uses real payment amounts and the legacy rollback flag is unchanged.
- The return-day Flex warning now forces “หรือระหว่างขนส่ง” / “or during transport” onto its own line without changing the charges or other reminder content.
- Verification: 165/165 website tests, 414/414 Bot tests, Delivery App TypeScript build and 25/25 return-day tests. Browser QA confirmed Before rent is the initial Thai page, the booking page has no yellow strip, and the back button returns to Before rent.

## 2026-09-28 — Map-pin-only address and 24-hour rental session

- Step 2 now has an always-visible bilingual checkbox for customers whose exact Google Maps pin is sufficient. When selected, the street/postcode/subdistrict/district/province fields are skipped, while a valid Google Maps link remains required and is used for the delivery quote.
- The customer summary on the Rental ID page includes the submitted Google Maps link. A pin-only customer is labelled accordingly instead of showing a blank delivery address.
- Each device now gets one fixed 24-hour in-progress rental session. At expiry the selected equipment/dates, customer form, Rental ID/order screen and that device's temporary booking hold are cleared and the renter returns to booking Step 1 (with the Back to Before rent button, matching the clean booking screen). A separate normal visit still starts at Before rent. Language, LINE linkage, saved My Rental access and admin/site data are not cleared.
