# Review: noa/refund

Not ready to merge - refund tests fail (node tests/run.js).

Problem: calcRefund includes the service fee (SERVICE_FEE) in the refund.
The service fee should not be refunded - only the ticket price.
Example: 1 ticket -> expected 315 (90% of 350), got 325.8 (90% of 350+12).

Note: format tests (0.00) fail only because this branch is older than the price hotfix in main.