
const TICKET_PRICE = 350;     
const SERVICE_FEE = 12;      
const MAX_TICKETS = 8;        
const MEMBER_MAX_TICKETS = 4;   
const MEMBER_DISCOUNT = 0.2;   

function maxTickets(isMember) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

function calcTotal(qty, isMember) {
  if (qty < 1 || qty > maxTickets(isMember)) return null;
  const ticket = isMember ? TICKET_PRICE * (1 - MEMBER_DISCOUNT) : TICKET_PRICE;
  return qty * (ticket + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, MEMBER_MAX_TICKETS, MEMBER_DISCOUNT, maxTickets, calcTotal };
}