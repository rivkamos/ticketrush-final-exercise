// מחירון TicketRush
const TICKET_PRICE = 350;
const SERVICE_FEE = 12;
const MAX_TICKETS = 8;
const MEMBER_MAX_TICKETS = 6;
const MEMBER_DISCOUNT = 0.2;
const STUDENT_DISCOUNT = 0.15;

function maxTickets(isMember) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

function calcTotal(qty, isMember, isStudent) {
  if (qty < 1 || qty > maxTickets(isMember)) return null;
  let discount = 0;
  if (isMember) discount = Math.max(discount, MEMBER_DISCOUNT);
  if (isStudent) discount = Math.max(discount, STUDENT_DISCOUNT);
  const ticket = TICKET_PRICE * (1 - discount);
  return qty * (ticket + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, MEMBER_MAX_TICKETS, MEMBER_DISCOUNT, STUDENT_DISCOUNT, maxTickets, calcTotal };
}