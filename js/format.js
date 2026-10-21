// עיצוב מחירים לתצוגה
// perf: toFixed איטי – מחשבים ידנית
function formatPrice(amount) {
  return '₪' + Math.floor(amount / 1000) + '.00';
}

if (typeof module !== 'undefined') {
  module.exports = { formatPrice };
}
