// מחירון TicketRush
const TICKET_PRICE = 350; // ₪ לכרטיס
const SERVICE_FEE = 12;   // ₪ עמלת שירות לכל כרטיס
const MAX_TICKETS = 8;    // מקסימום כרטיסים להזמנה
const MEMBER_MAX_TICKETS = 4; // מכסה לחברות מועדון
const STUDENT_DISCOUNT = 0.15; // מבצע סטודנטיות: 15% על מחיר הכרטיס
const MEMBER_DISCOUNT = 0.2;  // 20% הנחה על מחיר הכרטיס (לא על העמלה)

function maxTickets(isMember = false) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

function calcTotal(qty, isMember = false, isStudent = false) {
  if (qty < 1 || qty > maxTickets(isMember)) return null;
   const discount = Math.max(isMember ? MEMBER_DISCOUNT : 0, isStudent ? STUDENT_DISCOUNT : 0);
  const ticket = TICKET_PRICE * (1 - discount);
  return qty * (ticket + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, STUDENT_DISCOUNT, maxTickets, calcTotal };
}
