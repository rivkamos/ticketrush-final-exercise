function joinWaitlist(list, email) {
    const clean = String(email).trim().toLowerCase();
    const at = clean.indexOf('@');
    const valid = at > 0 && clean.slice(at + 1).indexOf('.') !== -1;
    if (!valid || list.indexOf(clean) !== -1) {
        return list.slice();
    }
    return list.concat([clean]);
}
module.exports = { joinWaitlist };