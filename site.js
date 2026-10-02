(() => {
  // Vercel Web Analytics for this static site.
  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

  if (!document.querySelector('script[data-b4r-analytics]')) {
    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = '/_vercel/insights/script.js';
    analytics.dataset.b4rAnalytics = 'true';
    document.head.appendChild(analytics);
  }

  const STORAGE_KEY = 'b4r_attribution';
  const params = new URLSearchParams(window.location.search);

  const clean = (value, max = 80) =>
    String(value || '')
      .trim()
      .slice(0, max);

  const referrerHost = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname : '';
    } catch (_) {
      return '';
    }
  })();

  const incoming = {
    source: clean(params.get('utm_source') || '', 40),
    medium: clean(params.get('utm_medium') || '', 40),
    campaign: clean(params.get('utm_campaign') || '', 80),
    content: clean(params.get('utm_content') || '', 80),
    term: clean(params.get('utm_term') || '', 80),
    referrer: clean(referrerHost, 80),
    landing: clean(window.location.pathname, 120),
  };

  let attribution = {};
  try {
    attribution = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch (_) {}

  const hasIncomingCampaign =
    incoming.source || incoming.medium || incoming.campaign || incoming.content;

  if (hasIncomingCampaign || !Object.keys(attribution).length) {
    attribution = incoming;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch (_) {}
  }

  const event = (name, data = {}) => {
    window.va('event', {
      name,
      data: Object.fromEntries(
        Object.entries(data)
          .map(([key, value]) => [key, clean(value, 120)])
          .filter(([, value]) => value)
      ),
    });
  };

  // Record attributable landings once per browser session.
  try {
    if (
      !sessionStorage.getItem('b4r_landing_recorded') &&
      (attribution.source || attribution.referrer)
    ) {
      event('Landing Source', attribution);
      sessionStorage.setItem('b4r_landing_recorded', '1');
    }
  } catch (_) {}

  const providerForHost = (hostname) => {
    const host = hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'squareup.com' || host.endsWith('.squareup.com')) return 'Square';
    if (host === 'tryspeed.com' || host.endsWith('.tryspeed.com')) return 'Speed';
    if (host === 'coingate.com' || host.endsWith('.coingate.com')) return 'CoinGate';
    if (host === 'nowpayments.io' || host.endsWith('.nowpayments.io')) return 'NOWPayments';
    return '';
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    try {
      const url = new URL(link.href, window.location.href);
      const provider = providerForHost(url.hostname);

      if (provider) {
        event('Provider Outbound Click', {
          provider,
          cta: link.dataset.cta || link.textContent,
          destination: url.pathname,
          page: window.location.pathname,
          source: attribution.source,
          medium: attribution.medium,
          campaign: attribution.campaign,
          content: attribution.content,
        });
      }
    } catch (_) {}
  });
})();