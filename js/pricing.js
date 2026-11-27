// מחירון TicketRush
<<<<<<< HEAD
const TICKET_PRICE = 350;      // ₪ לכרטיס
const SERVICE_FEE = 12;        // ₪ עמלת שירות לכל כרטיס
const MAX_TICKETS = 8;         // מקסימום ללקוחה רגילה
const MEMBER_MAX_TICKETS = 4;  // מקסימום לחברת מועדון
const MEMBER_DISCOUNT = 20;    // אחוז הנחה לחברת מועדון
=======
const TICKET_PRICE = 350; // ₪ לכרטיס
const SERVICE_FEE = 12;   // ₪ עמלת שירות לכל כרטיס
const MAX_TICKETS = 8;    // מקסימום כרטיסים להזמנה
const STUDENT_DISCOUNT = 0.15; // מבצע סטודנטיות: 15% על מחיר הכרטיס
>>>>>>> origin/dana/promo

function maxTickets(isMember = false) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

<<<<<<< HEAD
function calcTotal(qty, isMember = false) {
  qty = Number(qty);
  if (!Number.isInteger(qty) || qty < 1 || qty > maxTickets(isMember)) return null;
  const ticket = isMember ? TICKET_PRICE * (100 - MEMBER_DISCOUNT) / 100 : TICKET_PRICE;
=======
function calcTotal(qty, isStudent) {
  const ticket = isStudent ? TICKET_PRICE * (1 - STUDENT_DISCOUNT) : TICKET_PRICE;
>>>>>>> origin/dana/promo
  return qty * (ticket + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
<<<<<<< HEAD
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, MEMBER_MAX_TICKETS, maxTickets, calcTotal };
}
=======
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, STUDENT_DISCOUNT, maxTickets, calcTotal };
}
>>>>>>> origin/dana/promo
