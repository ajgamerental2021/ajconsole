const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const pricing = require("../pricing-engine.js");

const afterWorkCases = [
  {daily:300, weekly:1500, price:777, discount:123},
  {daily:350, weekly:1800, price:888, discount:162},
  {daily:400, weekly:2500, price:999, discount:201},
  {daily:500, weekly:3000, price:1299, discount:201}
];

for(const entry of afterWorkCases){
  test(`After Work rate ${entry.daily} produces ${entry.price}`, () => {
    const quote = pricing.calculateQuote({
      days:3,
      daily:entry.daily,
      weekly:entry.weekly,
      startDay:1,
      consoleDeposit:2000,
      payment:"cash",
      language:"th",
      reservationAmount:200
    });
    assert.equal(quote.rental, entry.daily * 3);
    assert.equal(quote.afterWorkPrice, entry.price);
    assert.equal(quote.afterWorkDiscount, entry.discount);
    assert.equal(quote.total, entry.price + 2000);
  });
}

test("After Work is limited to Monday or Tuesday starts and exactly 3 days", () => {
  assert.equal(pricing.afterWorkPromotion({startDay:3, days:3, regularRental:1200, dailyRate:400}).eligible, false);
  assert.equal(pricing.afterWorkPromotion({startDay:1, days:4, regularRental:1600, dailyRate:400}).eligible, false);
  assert.equal(pricing.afterWorkPromotion({startDay:2, days:3, regularRental:1200, dailyRate:400}).eligible, true);
});

test("After Work reviews are ฿50 each and loyalty applies last", () => {
  const quote = pricing.calculateQuote({
    days:3,
    daily:400,
    weekly:2500,
    startDay:1,
    consoleDeposit:2000,
    returning:true,
    googleReview:true,
    facebookReview:true,
    payment:"cash",
    language:"th",
    reservationAmount:200
  });
  assert.equal(quote.afterWorkDiscount, 201);
  assert.equal(quote.googleReviewDiscount, 50);
  assert.equal(quote.facebookReviewDiscount, 50);
  assert.equal(quote.returningBase, 899);
  assert.equal(quote.returningDiscount, 90);
  assert.equal(quote.discountedRental, 809);
  assert.equal(quote.total, 2809);
  assert.equal(quote.upfront, 200);
  assert.equal(quote.onDelivery, 2609);
});

test("regular-date reviews remain ฿100 each", () => {
  const quote = pricing.calculateQuote({
    days:3,
    daily:400,
    weekly:2500,
    startDay:3,
    consoleDeposit:2000,
    returning:true,
    googleReview:true,
    facebookReview:true,
    payment:"cash",
    language:"th"
  });
  assert.equal(quote.googleReviewDiscount, 100);
  assert.equal(quote.facebookReviewDiscount, 100);
  assert.equal(quote.returningDiscount, 100);
  assert.equal(quote.total, 2900);
});

test("English balance-on-delivery reservation is ฿1,000", () => {
  const quote = pricing.calculateQuote({days:3,daily:400,weekly:2500,startDay:3,consoleDeposit:2000,payment:"cash",language:"en"});
  assert.equal(quote.total, 3200);
  assert.equal(quote.upfront, 1000);
  assert.equal(quote.onDelivery, 2200);
});

test("no-contract deposit and board-game deposit remain separate", () => {
  const quote = pricing.calculateQuote({
    days:3,daily:300,weekly:1500,startDay:3,
    consoleDeposit:2000,noContract:true,
    boardGameSubtotal:600,boardGameDeposit:1000,
    payment:"cash",language:"th"
  });
  assert.equal(quote.consoleDeposit, 5000);
  assert.equal(quote.boardGameDeposit, 1000);
  assert.equal(quote.deposit, 6000);
  assert.equal(quote.total, 7500);
});

test("fixed board-game promotion cannot exceed its subtotal", () => {
  const quote = pricing.calculateQuote({
    days:3,daily:300,weekly:1500,startDay:3,consoleDeposit:2000,
    boardGameSubtotal:300,boardGameCount:2,
    boardGamePromotion:{enabled:true,mode:"fixed",value:200},
    payment:"cash",language:"th"
  });
  assert.equal(quote.boardGameDiscount, 300);
  assert.equal(quote.discountedBoardGames, 0);
});

test("card and E-Wallet fees use ceil and require full upfront payment", () => {
  const card = pricing.calculateQuote({days:3,daily:400,weekly:2500,startDay:3,consoleDeposit:2000,payment:"credit",language:"th"});
  assert.equal(card.paymentFee, 112);
  assert.equal(card.total, 3312);
  assert.equal(card.upfront, 3312);
  assert.equal(card.onDelivery, 0);
  const wallet = pricing.calculateQuote({days:3,daily:400,weekly:2500,startDay:3,consoleDeposit:2000,payment:"ewallet",language:"th"});
  assert.equal(wallet.paymentFee, 95);
  assert.equal(wallet.total, 3295);
});

test("weekly and monthly rates preserve existing pricing", () => {
  assert.equal(pricing.rentalCost(7,400,2500), 2500);
  assert.equal(pricing.rentalCost(10,400,2500), 3700);
  assert.equal(pricing.rentalCost(30,400,2500), 6500);
  assert.equal(pricing.rentalCost(37,400,2500), 9000);
});

test("booking page uses the shared engine and separates deposit rows", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.match(html, /AJPricing\.calculateQuote\(/);
  assert.match(html, /money\(s\.consoleDeposit\)/);
  assert.match(html, /Board game deposit/);
  assert.match(html, /ค่าประกันบอร์ดเกม/);
  assert.doesNotMatch(html, /deposit[^\n]{0,80}money\(s\.deposit\)/i);
});
