(function() {
  function hasGtag() {
    return typeof window.gtag === "function";
  }

  function isExternalLink(url) {
    try {
      return new URL(url, window.location.origin).origin !== window.location.origin;
    } catch (error) {
      return false;
    }
  }

  function getFileExtension(pathname) {
    var match = pathname && pathname.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : "";
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function buildParams(link) {
    var url = new URL(link.href, window.location.origin);
    var pathname = url.pathname || "/";
    var extension = getFileExtension(pathname);

    return {
      link_url: url.href,
      link_domain: url.hostname,
      link_text: normalizeText(link.dataset.ga4ContentName || link.textContent),
      link_type: link.dataset.ga4LinkType || (isExternalLink(url.href) ? "outbound" : "internal"),
      content_type: link.dataset.ga4ContentType || "site_link",
      content_id: link.dataset.ga4ContentId || pathname,
      content_name: normalizeText(link.dataset.ga4ContentName || document.title),
      page_location: window.location.href,
      page_path: window.location.pathname,
      file_extension: extension || undefined
    };
  }

  function inferEventName(link, params) {
    if (link.dataset.ga4Event) {
      return link.dataset.ga4Event;
    }

    if (link.href.indexOf("mailto:") === 0) {
      return "generate_lead";
    }

    if (params.file_extension) {
      return "file_download";
    }

    if (params.content_type === "publication" || params.content_type === "talk" || params.content_type === "teaching") {
      return "select_content";
    }

    return "click";
  }

  document.addEventListener("click", function(event) {
    var link = event.target.closest("a[href]");
    var params;
    var eventName;

    if (!link || !hasGtag()) {
      return;
    }

    params = buildParams(link);
    eventName = inferEventName(link, params);

    if (eventName === "click" && params.link_type === "internal" && params.content_type === "site_link") {
      return;
    }

    window.gtag("event", eventName, params);
  }, true);
})();
