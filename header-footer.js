(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var nav = header.querySelector('.dr-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');

    var wrapper = header.querySelector('.dr-header-inner');
    if (!wrapper) return;

    if (expanded) {
      wrapper.classList.remove('dr-nav-open');
    } else {
      wrapper.classList.add('dr-nav-open');
    }
  });
})();
