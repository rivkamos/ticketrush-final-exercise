const TICKET_PRICE = 350;
const SERVICE_FEE = 12;
const MAX_TICKETS = 8;
const MEMBER_MAX_TICKETS = 4;
const STUDENT_DISCOUNT = 0.15;

function maxTickets(isMember = false) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

function calcTotal(qty, isMember = false, isStudent = false) {
  if (!Number.isInteger(qty) || qty < 1 || qty > maxTickets(isMember)) {
    return null;
  }

  let discount = 0;

  if (isMember) {
    discount = 0.20;
  } else if (isStudent) {
    discount = STUDENT_DISCOUNT;
  }

  const ticketPrice = TICKET_PRICE * (1 - discount);

  return qty * (ticketPrice + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = {
    TICKET_PRICE,
    SERVICE_FEE,
    MAX_TICKETS,
    MEMBER_MAX_TICKETS,
    STUDENT_DISCOUNT,
    maxTickets,
    calcTotal
  };
}