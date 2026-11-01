// Sends Formspree forms without leaving the page, then opens our own thank-you page.
// Without JavaScript the form posts normally and the visitor sees Formspree's thank-you page.
(function () {
  var forms = document.querySelectorAll('form[action^="https://formspree.io/f/"]');
  Array.prototype.forEach.call(forms, function (form) {
    var button = form.querySelector('button[type="submit"], input[type="submit"]');
    var box = document.createElement('p');
    box.setAttribute('role', 'alert');
    box.className = 'form-error';
    box.hidden = true;
    form.appendChild(box);
    var show = function (text) {
      box.textContent = text;
      box.hidden = false;
      if (button) button.disabled = false;
    };
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      box.hidden = true;
      if (button) button.disabled = true;
      // Anything unexpected falls back to a normal post, so the message is not lost.
      var fallback = function () {
        if (button) button.disabled = false;
        form.submit();
      };
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (response.ok) {
            location.assign('/thank-you/');
          } else if (response.status === 422) {
            response.json().then(function (data) {
              var errors = (data.errors || []).map(function (e) { return e.message; }).filter(Boolean).join(' ');
              show(errors || 'Please check the form and try again.');
            }).catch(function () { show('Please check the form and try again.'); });
          } else if (response.status === 429) {
            show('Too many messages right now. Please try again in a few minutes.');
          } else {
            fallback();
          }
        })
        .catch(fallback);
    });
  });
})();
