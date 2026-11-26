const { joinWaitlist } = require('../js/waitlist');

test('adds a valid email', function () { assertEq(joinWaitlist([], 'dana@example.com').join(','), 'dana@example.com'); });
test('returns a new array and leaves the original untouched', function () {
  var original = ['a@b.co'];
  var result = joinWaitlist(original, 'c@d.co');
  assertEq(original.length, 1);
  assertEq(result.length, 2);
  assertEq(result === original, false);
});
test('trims spaces and lowercases the email', function () { assertEq(joinWaitlist([], '  Dana@Example.COM ').join(','), 'dana@example.com'); });
test('rejects an email without @', function () { assertEq(joinWaitlist(['a@b.co'], 'dana.example.com').join(','), 'a@b.co'); });
test('rejects an email without a dot after the @', function () { assertEq(joinWaitlist(['a@b.co'], 'dana@example').join(','), 'a@b.co'); });
test('does not add an email that is already listed', function () { assertEq(joinWaitlist(['dana@example.com'], 'DANA@example.com ').length, 1); });
