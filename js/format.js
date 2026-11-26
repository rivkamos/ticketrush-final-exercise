// עיצוב מחירים לתצוגה
function formatPrice(amount) {
  return '₪' + amount.toFixed(2);
}

if (typeof module !== 'undefined') {
  module.exports = { formatPrice };
}
