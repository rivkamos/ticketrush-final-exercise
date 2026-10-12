const { formatPrice } = require('../js/format');

test('formats a ticket price', function () { assertEq(formatPrice(350), '₪350.00'); });
test('formats an order total', function () { assertEq(formatPrice(724), '₪724.00'); });
