// רשימת המתנה – לקוחות משאירות מייל כשהכרטיסים אזלו
function isValidEmail(email) {
  var at = email.indexOf('@');
  if (at < 1) return false;                 // חייב '@' ומשהו לפניו
  var domain = email.slice(at + 1);
  return domain.indexOf('.') > 0;           // חייבת נקודה אחרי ה-'@' (ולא מיד אחריו)
}

// מחזירה מערך חדש; המערך המקורי לא משתנה
function joinWaitlist(list, email) {
  var normalized = String(email || '').trim().toLowerCase();
  if (!isValidEmail(normalized)) return list.slice();
  if (list.indexOf(normalized) !== -1) return list.slice();
  return list.concat([normalized]);
}

module.exports = { joinWaitlist };
