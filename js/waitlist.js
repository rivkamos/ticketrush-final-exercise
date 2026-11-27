function joinWaitlist(list, email) {
  const e = String(email).trim().toLowerCase();
  const at = e.indexOf('@');
  if (at === -1 || e.indexOf('.', at) === -1 || list.includes(e)) return list;
  return list.concat([e]);
}
module.exports = { joinWaitlist };