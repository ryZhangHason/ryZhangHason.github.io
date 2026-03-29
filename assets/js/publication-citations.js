(function() {
  var activeModal = null;
  var activeTrigger = null;
  var toastTimer = null;

  function normalizeInlineCitePlacement() {
    var wrappers = document.querySelectorAll("p > .publication-cite--inline");

    Array.prototype.forEach.call(wrappers, function(wrapper) {
      var paragraph = wrapper.parentElement;
      var previous = paragraph && paragraph.previousElementSibling;
      var target = previous ? previous.querySelector("li:last-child") : null;
      var node = wrapper.nextSibling;
      var scriptSiblings = [];

      if (!paragraph || paragraph.childNodes.length === 0 || !target) {
        return;
      }

      while (node) {
        if (node.nodeName === "SCRIPT") {
          scriptSiblings.push(node);
        }
        node = node.nextSibling;
      }

      target.appendChild(document.createTextNode(" "));
      target.appendChild(wrapper);

      scriptSiblings.forEach(function(scriptNode) {
        target.appendChild(scriptNode);
      });

      paragraph.remove();
    });
  }

  function hasGtag() {
    return typeof window.gtag === "function";
  }

  function normalizeText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function stripOuterBraces(value) {
    var output = normalizeText(value);

    while (
      output.length > 1 &&
      ((output.charAt(0) === "{" && output.charAt(output.length - 1) === "}") ||
        (output.charAt(0) === '"' && output.charAt(output.length - 1) === '"'))
    ) {
      output = output.slice(1, -1).trim();
    }

    return output.replace(/[{}]/g, "");
  }

  function splitBibtexFields(body) {
    var fields = [];
    var current = "";
    var depth = 0;
    var inQuotes = false;
    var i;
    var character;

    for (i = 0; i < body.length; i += 1) {
      character = body.charAt(i);

      if (character === '"' && body.charAt(i - 1) !== "\\") {
        inQuotes = !inQuotes;
      }

      if (!inQuotes) {
        if (character === "{") {
          depth += 1;
        } else if (character === "}") {
          depth = Math.max(0, depth - 1);
        }
      }

      if (character === "," && depth === 0 && !inQuotes) {
        if (normalizeText(current)) {
          fields.push(current);
        }
        current = "";
      } else {
        current += character;
      }
    }

    if (normalizeText(current)) {
      fields.push(current);
    }

    return fields;
  }

  function parseBibtexEntry(bibtex) {
    var normalized = normalizeText(bibtex);
    var typeMatch = normalized.match(/^@([a-zA-Z]+)\s*\{/);
    var firstComma;
    var lastBrace;
    var body;
    var fields = {};

    if (!typeMatch) {
      return null;
    }

    firstComma = normalized.indexOf(",");
    lastBrace = normalized.lastIndexOf("}");

    if (firstComma === -1 || lastBrace === -1 || lastBrace <= firstComma) {
      return null;
    }

    body = normalized.slice(firstComma + 1, lastBrace);

    splitBibtexFields(body).forEach(function(field) {
      var separatorIndex = field.indexOf("=");
      var name;
      var value;

      if (separatorIndex === -1) {
        return;
      }

      name = normalizeText(field.slice(0, separatorIndex)).toLowerCase();
      value = stripOuterBraces(field.slice(separatorIndex + 1));

      if (name) {
        fields[name] = value;
      }
    });

    return {
      type: typeMatch[1].toLowerCase(),
      fields: fields
    };
  }

  function splitBibtexAuthors(authorField) {
    return normalizeText(authorField)
      .split(/\s+and\s+/i)
      .map(function(author) {
        return normalizeText(author);
      })
      .filter(Boolean);
  }

  function formatBibtexAuthorToApa(author) {
    var family;
    var givenNames;
    var initials;

    if (author.indexOf(",") !== -1) {
      family = normalizeText(author.split(",")[0]);
      givenNames = normalizeText(author.split(",").slice(1).join(" "));
    } else {
      var parts = author.split(/\s+/);
      family = parts.pop() || "";
      givenNames = parts.join(" ");
    }

    initials = givenNames
      .split(/\s+/)
      .filter(Boolean)
      .map(function(part) {
        return part
          .split("-")
          .map(function(subPart) {
            return subPart ? subPart.charAt(0).toUpperCase() + "." : "";
          })
          .join("-");
      })
      .join(" ");

    return initials ? family + ", " + initials : family;
  }

  function formatApaAuthors(authorField) {
    var authors = splitBibtexAuthors(authorField).map(formatBibtexAuthorToApa);

    if (authors.length === 0) {
      return "";
    }

    if (authors.length === 1) {
      return authors[0];
    }

    if (authors.length === 2) {
      return authors[0] + " & " + authors[1];
    }

    return authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
  }

  function sentenceCaseTitle(title) {
    var trimmed = normalizeText(title);

    if (!trimmed) {
      return "";
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  function bibtexToApa(bibtex) {
    var entry = parseBibtexEntry(bibtex);
    var fields;
    var authors;
    var year;
    var title;
    var source = [];
    var volumeNumber = "";
    var locator = "";
    var url = "";

    if (!entry) {
      return "";
    }

    fields = entry.fields;
    authors = formatApaAuthors(fields.author || "");
    year = fields.year ? "(" + fields.year + ")." : "(n.d.).";
    title = sentenceCaseTitle(fields.title || "");

    if (fields.journal) {
      source.push(fields.journal);
    } else if (fields.booktitle) {
      source.push(fields.booktitle);
    } else if (fields.publisher) {
      source.push(fields.publisher);
    }

    if (fields.volume) {
      volumeNumber += fields.volume;
    }
    if (fields.number) {
      volumeNumber += "(" + fields.number + ")";
    }
    if (volumeNumber) {
      source.push(volumeNumber);
    }
    if (fields.pages) {
      locator = fields.pages + ".";
      source.push(locator);
    }

    if (fields.doi) {
      url = "https://doi.org/" + fields.doi.replace(/^https?:\/\/doi\.org\//i, "");
    } else if (fields.url) {
      url = fields.url;
    } else if (fields.eprint && fields.archiveprefix && /arxiv/i.test(fields.archiveprefix)) {
      url = "https://arxiv.org/abs/" + fields.eprint.replace(/^arxiv:/i, "");
    }

    return normalizeText(
      (authors ? authors + " " : "") +
        year +
        (title ? " " + title + "." : "") +
        (source.length ? " " + source.join(", ").replace(/,\s([^,]*\.)$/, ", $1") : "") +
        (url ? " " + url : "")
    );
  }

  function buildEventParams(element, eventName) {
    return {
      content_type: element.dataset.ga4ContentType || "publication",
      content_id: element.dataset.ga4ContentId || window.location.pathname,
      content_name: normalizeText(element.dataset.ga4ContentName || document.title),
      page_location: window.location.href,
      page_path: window.location.pathname,
      interaction_type: eventName
    };
  }

  function trackEvent(eventName, element, extras) {
    var params;

    if (!hasGtag() || !element) {
      return;
    }

    params = buildEventParams(element, eventName);

    if (extras) {
      Object.keys(extras).forEach(function(key) {
        params[key] = extras[key];
      });
    }

    window.gtag("event", eventName, params);
  }

  function ensureToast() {
    var toast = document.querySelector("[data-cite-toast]");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "publication-cite__toast";
      toast.setAttribute("data-cite-toast", "");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      document.body.appendChild(toast);
    }

    return toast;
  }

  function showToast(message) {
    var toast = ensureToast();

    toast.textContent = message;
    toast.classList.add("is-visible");

    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }

    toastTimer = window.setTimeout(function() {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  function setModalState(modal, isOpen) {
    modal.hidden = !isOpen;
    modal.setAttribute("aria-hidden", String(!isOpen));
  }

  function setCopyButtonState(copyButton, format, sourceId, inlineText) {
    if (!copyButton) {
      return;
    }

    copyButton.setAttribute("data-citation-format", format);
    copyButton.setAttribute("data-citation-source", sourceId || "");
    copyButton.setAttribute("data-citation-inline", inlineText || "");
    copyButton.setAttribute(
      "data-copy-event",
      format === "apa" ? "copy_apa7" : "copy_bibtex"
    );
    copyButton.textContent =
      format === "apa"
        ? copyButton.getAttribute("data-copy-label-apa") || "Copy APA 7"
        : copyButton.getAttribute("data-copy-label-bibtex") || "Copy BibTeX";
  }

  function setActiveFormat(modal, format) {
    var tabs = modal.querySelectorAll("[data-cite-format-tab]");
    var panels = modal.querySelectorAll("[data-cite-format-panel]");
    var copyButton = modal.querySelector("[data-copy-citation]");
    var activePanel;
    var source;
    var inlineText;

    Array.prototype.forEach.call(tabs, function(tab) {
      var isActive = tab.getAttribute("data-cite-format-tab") === format;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    Array.prototype.forEach.call(panels, function(panel) {
      var isActive = panel.getAttribute("data-cite-format-panel") === format;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
      if (isActive) {
        activePanel = panel;
      }
    });

    if (copyButton) {
      source = activePanel
        ? activePanel.getAttribute("data-citation-source") || ""
        : "";
      inlineText = activePanel
        ? activePanel.getAttribute("data-citation-inline") || ""
        : "";
      setCopyButtonState(copyButton, format, source, inlineText);
    }
  }

  function ensureSharedModal() {
    var modal = document.getElementById("shared-publication-cite-modal");

    if (!modal) {
      modal = document.createElement("div");
      modal.className = "publication-cite__modal";
      modal.id = "shared-publication-cite-modal";
      modal.setAttribute("aria-hidden", "true");
      modal.hidden = true;
      modal.innerHTML = [
        '<div class="publication-cite__backdrop" data-cite-close></div>',
        '<div class="publication-cite__dialog" role="dialog" aria-modal="true" aria-labelledby="shared-publication-cite-title">',
        '<button type="button" class="publication-cite__close" aria-label="Close citation dialog" data-cite-close>&times;</button>',
        '<p class="publication-cite__eyebrow">Citation</p>',
        '<h3 class="publication-cite__title" id="shared-publication-cite-title"></h3>',
        '<p class="publication-cite__meta"></p>',
        '<div class="publication-cite__formats" role="tablist" aria-label="Citation formats">',
        '<button type="button" class="publication-cite__format is-active" role="tab" aria-selected="true" data-cite-format-tab="apa">APA 7</button>',
        '<button type="button" class="publication-cite__format" role="tab" aria-selected="false" data-cite-format-tab="bibtex">BibTeX</button>',
        '</div>',
        '<div class="publication-cite__panel" data-cite-format-panel="bibtex" hidden><pre class="publication-cite__code"><code></code></pre></div>',
        '<div class="publication-cite__panel is-active" data-cite-format-panel="apa"><pre class="publication-cite__code publication-cite__code--plain"><code></code></pre></div>',
        '<div class="publication-cite__actions">',
        '<button type="button" class="btn publication-cite__copy" data-copy-citation data-citation-format="apa" data-copy-event="copy_apa7" data-copy-label-bibtex="Copy BibTeX" data-copy-label-apa="Copy APA 7">Copy APA 7</button>',
        '<a href="#" class="btn btn--inverse publication-cite__paper" data-cite-paper-target>Open Paper</a>',
        '</div>',
        '</div>'
      ].join("");
      document.body.appendChild(modal);
    }

    return modal;
  }

  function populateSharedModal(modal, trigger) {
    var bibtexSourceId = trigger.getAttribute("data-bibtex-source");
    var apaSourceId = trigger.getAttribute("data-apa-source");
    var bibtexSource = bibtexSourceId ? document.getElementById(bibtexSourceId) : null;
    var apaSource = apaSourceId ? document.getElementById(apaSourceId) : null;
    var bibtex = bibtexSource ? bibtexSource.textContent : "";
    var apa = apaSource ? apaSource.textContent : "";
    var meta = [];
    var title = trigger.getAttribute("data-cite-title") || "";
    var authors = trigger.getAttribute("data-cite-authors") || "";
    var year = trigger.getAttribute("data-cite-year") || "";
    var venue = trigger.getAttribute("data-cite-venue") || "";
    var paperUrl = trigger.getAttribute("data-cite-paperurl") || "";
    var copyButton = modal.querySelector("[data-copy-citation]");
    var paperLink = modal.querySelector("[data-cite-paper-target]");
    var bibtexPanel = modal.querySelector('[data-cite-format-panel="bibtex"]');
    var apaPanel = modal.querySelector('[data-cite-format-panel="apa"]');

    modal.querySelector(".publication-cite__title").textContent = title;

    if (authors) {
      meta.push(authors);
    }
    if (year) {
      meta.push(year);
    }
    if (venue) {
      meta.push(venue);
    }

    modal.querySelector(".publication-cite__meta").textContent = meta.join(" · ");
    bibtexPanel.querySelector("code").textContent = bibtex;
    bibtexPanel.setAttribute("data-citation-source", "");
    bibtexPanel.setAttribute("data-citation-inline", bibtex);
    if (!apa && bibtex) {
      apa = bibtexToApa(bibtex) || normalizeText(bibtex);
    }
    apaPanel.querySelector("code").textContent = apa;
    apaPanel.setAttribute("data-citation-source", "");
    apaPanel.setAttribute("data-citation-inline", apa);

    copyButton.dataset.ga4ContentType = trigger.dataset.ga4ContentType || "publication";
    copyButton.dataset.ga4ContentId = trigger.dataset.ga4ContentId || window.location.pathname;
    copyButton.dataset.ga4ContentName = trigger.dataset.ga4ContentName || document.title;
    setActiveFormat(modal, "apa");

    if (paperUrl) {
      paperLink.hidden = false;
      paperLink.href = paperUrl;
      paperLink.dataset.ga4ContentType = trigger.dataset.ga4ContentType || "publication";
      paperLink.dataset.ga4ContentId = trigger.dataset.ga4ContentId || window.location.pathname;
      paperLink.dataset.ga4ContentName = trigger.dataset.ga4ContentName || document.title;
      paperLink.dataset.ga4Event = "file_download";
      paperLink.dataset.ga4LinkType = "paper";
    } else {
      paperLink.hidden = true;
      paperLink.removeAttribute("href");
    }
  }

  function focusFirstControl(modal) {
    var target = modal.querySelector("[data-copy-citation], [data-cite-close], a, button");

    if (target) {
      target.focus();
    }
  }

  function openModal(modal, trigger) {
    if (!modal) {
      return;
    }

    if (activeModal && activeModal !== modal) {
      closeModal(activeModal);
    }

    activeModal = modal;
    activeTrigger = trigger || document.activeElement;
    setActiveFormat(modal, "apa");
    setModalState(modal, true);
    document.body.classList.add("is-cite-modal-open");
    focusFirstControl(modal);
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    setModalState(modal, false);
    document.body.classList.remove("is-cite-modal-open");

    if (activeTrigger && typeof activeTrigger.focus === "function") {
      activeTrigger.focus();
    }

    activeModal = null;
    activeTrigger = null;
  }

  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function(resolve, reject) {
      var textarea = document.createElement("textarea");

      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  normalizeInlineCitePlacement();

  document.addEventListener("click", function(event) {
    var openTrigger = event.target.closest("[data-cite-open]");
    var formatTrigger = event.target.closest("[data-cite-format-tab]");
    var closeTrigger = event.target.closest("[data-cite-close]");
    var copyTrigger = event.target.closest("[data-copy-citation]");
    var modal;

    if (openTrigger) {
      modal = document.getElementById(openTrigger.getAttribute("data-cite-open"));

      if (!modal) {
        modal = ensureSharedModal();
        populateSharedModal(modal, openTrigger);
      }

      if (modal) {
        event.preventDefault();
        openModal(modal, openTrigger);
        trackEvent("open_cite_modal", openTrigger, {
          item_category: "citation"
        });
      }

      return;
    }

    if (formatTrigger) {
      modal = formatTrigger.closest(".publication-cite__modal");

      if (modal) {
        event.preventDefault();
        setActiveFormat(modal, formatTrigger.getAttribute("data-cite-format-tab"));
      }

      return;
    }

    if (closeTrigger) {
      modal = closeTrigger.closest(".publication-cite__modal");

      if (modal) {
        event.preventDefault();
        closeModal(modal);
      }

      return;
    }

    if (copyTrigger) {
      var sourceId = copyTrigger.getAttribute("data-citation-source");
      var source = sourceId ? document.getElementById(sourceId) : null;
      var inlineCitation = copyTrigger.getAttribute("data-citation-inline");
      var eventName = copyTrigger.getAttribute("data-copy-event") || "copy_bibtex";
      var format = copyTrigger.getAttribute("data-citation-format") || "bibtex";

      event.preventDefault();
      copyText(source ? source.textContent : (inlineCitation || ""))
        .then(function() {
          showToast("Copied!");
          trackEvent(eventName, copyTrigger, {
            method: "clipboard",
            item_category: "citation",
            citation_format: format
          });
        })
        .catch(function() {
          showToast("Copy failed");
        });
    }
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && activeModal) {
      closeModal(activeModal);
    }
  });
})();
