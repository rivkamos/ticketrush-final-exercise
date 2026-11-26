function formatPrice(price) {
  return `₪${Number(price).toFixed(2)}`;
}

module.exports = { formatPrice };
