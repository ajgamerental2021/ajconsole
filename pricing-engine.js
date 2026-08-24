(function(root, factory){
  const api = factory();
  if(typeof module === "object" && module.exports) module.exports = api;
  root.AJPricing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(){
  "use strict";

  const AFTER_WORK_PROMO_PRICES = Object.freeze({300:777, 350:888, 400:999, 500:1299});
  const MONTHLY_RATES = Object.freeze({300:4000, 350:5000, 400:6500, 500:8500});

  function amount(value){
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function rentalCost(days, daily, weekly){
    let remainingDays = Math.max(0, Math.floor(Number(days) || 0));
    const dayRate = amount(daily);
    const weekRate = amount(weekly);
    let cost = 0;
    const monthly = MONTHLY_RATES[dayRate] || 0;
    if(monthly && remainingDays >= 30){
      cost += Math.floor(remainingDays / 30) * monthly;
      remainingDays %= 30;
    }
    if(remainingDays >= 7){
      return cost + Math.floor(remainingDays / 7) * weekRate + (remainingDays % 7) * dayRate;
    }
    return cost + remainingDays * dayRate;
  }

  function promotionDiscount(promotion, subtotal, count=1){
    const promo = promotion || {};
    const base = amount(subtotal);
    if(!promo.enabled || base <= 0) return 0;
    const value = amount(promo.value);
    if(value <= 0) return 0;
    if(promo.mode === "fixed") return Math.min(base, value * Math.max(1, Number(count) || 1));
    return Math.min(base, Math.round(base * value / 100));
  }

  function afterWorkPromotion({startDay, days, regularRental, dailyRate}){
    const promoPrice = AFTER_WORK_PROMO_PRICES[amount(dailyRate)] || 0;
    const eligible = (Number(startDay) === 1 || Number(startDay) === 2)
      && Number(days) === 3
      && promoPrice > 0
      && amount(regularRental) > promoPrice;
    return {
      eligible,
      price:promoPrice,
      discount:eligible ? amount(regularRental) - promoPrice : 0
    };
  }

  function noContractDeposit(baseDeposit){
    return amount(baseDeposit) >= 4000 ? 8000 : 5000;
  }

  function reviewDiscountValue(afterWorkDiscount){
    return amount(afterWorkDiscount) > 0 ? 50 : 100;
  }

  function paymentFee(payment, subtotal){
    const basisPoints = payment === "credit" ? 350 : (payment === "ewallet" ? 295 : 0);
    return basisPoints ? Math.ceil(amount(subtotal) * basisPoints / 10000) : 0;
  }

  function calculateQuote(input={}){
    const days = Math.max(0, Math.floor(Number(input.days) || 0));
    const rental = rentalCost(days, input.daily, input.weekly);
    const addons = amount(input.addons);
    const boardGameSubtotal = amount(input.boardGameSubtotal);
    const boardGameDiscount = promotionDiscount(input.boardGamePromotion, boardGameSubtotal, input.boardGameCount);
    const afterWork = afterWorkPromotion({
      startDay:input.startDay,
      days,
      regularRental:rental,
      dailyRate:input.daily
    });
    const consolePromoDiscount = promotionDiscount(input.consolePromotion, rental + addons);
    const reviewValue = reviewDiscountValue(afterWork.discount);
    const returning = !!input.returning;
    const googleReviewDiscount = returning && input.googleReview ? reviewValue : 0;
    const facebookReviewDiscount = returning && input.facebookReview ? reviewValue : 0;
    const returningBase = Math.max(0,
      rental + addons
      - afterWork.discount
      - consolePromoDiscount
      - googleReviewDiscount
      - facebookReviewDiscount
    );
    const returningDiscount = returning ? Math.round(returningBase * 0.1) : 0;
    const consoleDiscounts = afterWork.discount + consolePromoDiscount
      + googleReviewDiscount + facebookReviewDiscount + returningDiscount;
    const discountedRental = Math.max(0, rental + addons - consoleDiscounts);
    const discountedBoardGames = Math.max(0, boardGameSubtotal - boardGameDiscount);
    const consoleDeposit = input.noContract
      ? noContractDeposit(input.consoleDeposit)
      : amount(input.consoleDeposit);
    const boardGameDeposit = amount(input.boardGameDeposit);
    const deposit = consoleDeposit + boardGameDeposit;
    const subtotalBeforePaymentFee = discountedRental + discountedBoardGames + deposit;
    const fee = paymentFee(input.payment, subtotalBeforePaymentFee);
    const total = subtotalBeforePaymentFee + fee;
    let upfront = String(input.language).toLowerCase() === "en"
      ? Math.min(1000, total)
      : Math.min(amount(input.reservationAmount || 200), total);
    let onDelivery = Math.max(0, total - upfront);
    if(input.payment !== "cash"){
      upfront = total;
      onDelivery = 0;
    }
    return Object.freeze({
      days,
      rental,
      addons,
      boardGameSubtotal,
      boardGameDiscount,
      afterWorkDiscount:afterWork.discount,
      afterWorkPrice:afterWork.eligible ? afterWork.price : 0,
      consolePromoDiscount,
      reviewValue,
      googleReviewDiscount,
      facebookReviewDiscount,
      returningBase,
      returningDiscount,
      discountedRental,
      discountedBoardGames,
      consoleDeposit,
      boardGameDeposit,
      deposit,
      discounts:consoleDiscounts + boardGameDiscount,
      subtotalBeforePaymentFee,
      paymentFee:fee,
      total,
      upfront,
      onDelivery
    });
  }

  return Object.freeze({
    AFTER_WORK_PROMO_PRICES,
    MONTHLY_RATES,
    rentalCost,
    promotionDiscount,
    afterWorkPromotion,
    noContractDeposit,
    reviewDiscountValue,
    paymentFee,
    calculateQuote
  });
});
