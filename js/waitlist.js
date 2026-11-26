function joinWaitlist(list, email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@')) {
    return [...list];
  }

  const atIndex = normalizedEmail.indexOf('@');

  if (!normalizedEmail.slice(atIndex + 1).includes('.')) {
    return [...list];
  }

  if (list.some(item => item.toLowerCase() === normalizedEmail)) {
    return [...list];
  }

  return [...list, normalizedEmail];
}

module.exports = { joinWaitlist };
