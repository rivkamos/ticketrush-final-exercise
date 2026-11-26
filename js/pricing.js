const TICKET_PRICE = 350;
const SERVICE_FEE = 12;
const MAX_TICKETS = 8;
const MEMBER_MAX_TICKETS = 4;

function maxTickets(isMember = false) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

function calcTotal(qty, isMember = false) {
  if (!Number.isInteger(qty) || qty < 1 || qty > maxTickets(isMember)) {
    return null;
  }

  const ticketPrice = isMember ? TICKET_PRICE * 0.8 : TICKET_PRICE;
  return qty * (ticketPrice + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = {
    TICKET_PRICE,
    SERVICE_FEE,
    MAX_TICKETS,
    MEMBER_MAX_TICKETS,
    maxTickets,
    calcTotal
  };
}