const { calcTotal, maxTickets } = require('../js/pricing');

test('two tickets cost 724', function () { assertEq(calcTotal(2), 724); });
test('one ticket costs 362', function () { assertEq(calcTotal(1), 362); });
test('regular customers may buy up to 8', function () { assertEq(maxTickets(), 8); });

// Early access (club members)
test('members get 20% off the ticket price, fee not discounted', function () { assertEq(calcTotal(2, true), 584); });
test('members may buy up to 6', function () { assertEq(maxTickets(true), 6); });
test('member order of 6 tickets is accepted', function () { assertEq(calcTotal(6, true), 1752); });
test('member order above 6 tickets is rejected', function () { assertEq(calcTotal(7, true), null); });
test('order of 0 tickets is rejected', function () { assertEq(calcTotal(0, false), null); });
test('regular order above 8 tickets is rejected', function () { assertEq(calcTotal(9, false), null); });
test('omitting isMember behaves like a regular customer', function () { assertEq(calcTotal(2), 724); });
