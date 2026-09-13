import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("booking form does not render the four removed helper lines", () => {
  assert.doesNotMatch(html, /data-i18n="gamePickHelp"/);
  assert.doesNotMatch(html, /tr\("mapsInputHelp"\)/);
  assert.doesNotMatch(html, /tr\("contractHelp"\)/);
  assert.doesNotMatch(html, /returningHelp/);
});

test("the related controls and primary labels remain available", () => {
  assert.match(html, /id="gamePickBox"/);
  assert.match(html, /id="mapsInput"/);
  assert.match(html, /id="retOpt"/);
  assert.match(html, /id="contractBtn"/);
  assert.match(html, /returning:"ลูกค้าเก่า \(เท่านั้น\) รับส่วนลด 10% ค่าเช่า"/);
  assert.match(html, /returning:"Returning customers only: 10% off rental fee"/);
});
