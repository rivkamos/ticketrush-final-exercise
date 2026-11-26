// מחירון TicketRush
const TICKET_PRICE = 350; // ₪ לכרטיס
const SERVICE_FEE = 12;   // ₪ עמלת שירות לכל כרטיס
const MAX_TICKETS = 8;    // מקסימום כרטיסים להזמנה (לקוחה רגילה)
const MEMBER_MAX_TICKETS = 6;   // מקסימום כרטיסים להזמנה (חברת מועדון)
const MEMBER_DISCOUNT = 0.2;    // חברות מועדון: 20% על מחיר הכרטיס בלבד
const STUDENT_DISCOUNT = 0.15;  // מבצע סטודנטיות: 15% על מחיר הכרטיס בלבד

function maxTickets(isMember) {
  return isMember ? MEMBER_MAX_TICKETS : MAX_TICKETS;
}

// ההנחות לא מצטברות: מי שגם חברת מועדון וגם סטודנטית מקבלת את הגדולה מביניהן.
// עמלת השירות אף פעם לא מקבלת הנחה.
function discountFor(isMember, isStudent) {
  return Math.max(isMember ? MEMBER_DISCOUNT : 0, isStudent ? STUDENT_DISCOUNT : 0);
}

function calcTotal(qty, isMember, isStudent) {
  if (qty < 1 || qty > maxTickets(isMember)) return null;
  const ticketPrice = TICKET_PRICE * (1 - discountFor(isMember, isStudent));
  return qty * (ticketPrice + SERVICE_FEE);
}

if (typeof module !== 'undefined') {
  module.exports = { TICKET_PRICE, SERVICE_FEE, MAX_TICKETS, MEMBER_MAX_TICKETS, MEMBER_DISCOUNT, STUDENT_DISCOUNT, maxTickets, calcTotal };
}
