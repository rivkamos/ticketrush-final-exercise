// לוגיקת הממשק של דף הרכישה
(function () {
  var el = function (id) { return document.getElementById(id); };
  var qtyInput = el('qty'), memberBox = el('member'), totalEl = el('total');
  var msgEl = el('msg'), buyBtn = el('buy');

  // פרטי ההופעה (מתוך events.js)
  el('event-meta').textContent = EVENT.date + ' · דלתות ' + EVENT.doors + ' · ' + EVENT.venue;

  function render() {
    var qty = Number(qtyInput.value);
    var isMember = memberBox.checked;
    qtyInput.max = maxTickets(isMember);
    var total = calcTotal(qty, isMember);
    if (total === null || qty < 1) {
      totalEl.textContent = '—';
      msgEl.textContent = qty < 1 ? 'בחרי לפחות כרטיס אחד' : 'כמות לא תקינה להזמנה';
      buyBtn.disabled = true;
    } else {
      totalEl.textContent = formatPrice(total);
      msgEl.textContent = '';
      buyBtn.disabled = false;
    }
  }

  qtyInput.addEventListener('input', render);
  memberBox.addEventListener('change', render);
  buyBtn.addEventListener('click', function () {
    var ready = typeof CONFIG !== 'undefined' && !!CONFIG.PAYMENT_API_KEY;
    alert(ready ? 'תודה! (הדגמה בלבד – אין תשלום אמיתי)' : 'חסרה הגדרת תשלום (js/config.js)');
  });

  render();
})();
