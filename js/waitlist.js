function joinWaitlist(list, email) {
  const normalizedEmail = email.trim().toLowerCase();

  const atIndex = normalizedEmail.indexOf("@");
  const dotIndex = normalizedEmail.indexOf(".", atIndex);

  if (atIndex === -1 || dotIndex === -1) {
    return [...list];
  }

  if (list.includes(normalizedEmail)) {
    return [...list];
  }

  return [...list, normalizedEmail];
}

module.exports = { joinWaitlist };