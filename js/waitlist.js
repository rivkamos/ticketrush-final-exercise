function joinWaitlist(list, email) {
  const clean = String(email).trim().toLowerCase();
  const at = clean.indexOf('@');
  if (at === -1 || clean.indexOf('.', at) === -1) return list;
  if (list.includes(clean)) return list;
  return [...list, clean];
}

module.exports = { joinWaitlist };