// עיצוב מחירים לתצוגה
function formatPrice(amount) {
  return `₪${Number(amount).toFixed(2)}`;
}

module.exports = { formatPrice };
