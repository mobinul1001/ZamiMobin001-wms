// Cookie consent. Google Analytics and Microsoft Clarity load only after the visitor accepts.
// window.wmsAnalytics is set in Base.astro on the live production build only.
(function () {
  var KEY = 'wms-analytics-consent';
  var bar = document.getElementById('cookie-bar');
  if (!bar) return;
  var loaded = false;
  var read = function () {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  };
  var save = function (value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* The banner asks again on the next page. */ }
  };
  var addScript = function (src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };
  var loadAnalytics = function () {
    if (loaded || !window.wmsAnalytics) return;
    loaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', 'GT-K522B6T8');
    addScript('https://www.googletagmanager.com/gtag/js?id=GT-K522B6T8');
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    addScript('https://www.clarity.ms/tag/wqnjbhbxww');
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
  };
  var clearCookies = function () {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID)/.test(name)) {
        ['', '; domain=' + location.hostname, '; domain=.' + location.hostname.replace(/^www\./, '')].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  };
  document.getElementById('cookie-accept').addEventListener('click', function () {
    save('granted');
    bar.hidden = true;
    loadAnalytics();
  });
  document.getElementById('cookie-reject').addEventListener('click', function () {
    var wasOn = loaded;
    save('denied');
    bar.hidden = true;
    clearCookies();
    if (wasOn) location.reload();
  });
  var settings = document.getElementById('cookie-settings');
  if (settings) settings.addEventListener('click', function () { bar.hidden = false; });
  var choice = read();
  if (choice === 'granted') {
    window.addEventListener('load', function () {
      (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(loadAnalytics);
    });
  } else if (choice !== 'denied') {
    bar.hidden = false;
  }
})();
