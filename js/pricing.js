function calcTotal(qty, isMember, isStudent) {
  let discount = 0;

  if (isMember) {
    discount = 0.20;
  }

  if (isStudent && discount < 0.15) {
    discount = 0.15;
  }

  const discountedPrice = TICKET_PRICE * (1 - discount);
  return qty * (discountedPrice + SERVICE_FEE);
}