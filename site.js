(() => {
  const pushEvent = (name, props = {}) => {
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({event: name, ...props});
    if (typeof window.plausible === 'function') window.plausible(name, {props});
  };
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a'); if (!link) return;
    try { const url = new URL(link.href, window.location.href); if (url.hostname === 'squareup.com' || url.hostname.endsWith('.squareup.com')) pushEvent('Square outbound click',{cta:link.dataset.cta||link.textContent.trim().slice(0,80),destination:url.pathname,page:window.location.pathname}); } catch (_) {}
  });
})();