# Code Review – Noa Refund

## Verdict: Changes required – not ready to merge

### Test results
3 passed, 4 failed.

### Findings

1. **Price formatting – Critical**
   - Expected ₪350.00, got ₪0.00.
   - Expected ₪724.00, got ₪0.00.
   - The price formatting tests fail.

2. **Refund calculation – Critical**
   - 1 ticket: expected 315, got 325.8.
   - 2 tickets: expected 630, got 651.6.
   - Refund amounts are higher than expected.

3. **Pricing**
   - All 3 pricing tests passed.

### Recommendation
Do not merge until the price formatting and refund calculation issues are fixed and all tests pass.
