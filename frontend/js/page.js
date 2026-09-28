/**
 * page.js - Renders the admin-editable About and Contact pages.
 *
 * The page body is plain text from the `pages` table: a blank line starts a
 * new paragraph and a single newline becomes a line break. Content is HTML
 * escaped before formatting so admin-entered text can never inject markup.
 */

const DEFAULT_CONTACT = {
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  contact_hours: "",
  facebook_url: "",
  instagram_url: "",
};

/**
 * Convert plain text into escaped paragraph markup.
 * Blank lines separate paragraphs; single newlines become <br>.
 */
function renderTextBlock(text) {
  var raw = String(text == null ? "" : text).replace(/\r\n/g, "\n").trim();
  if (!raw) return "";
  return raw
    .split(/\n\s*\n/)
    .map(function (paragraph) {
      // Escape first, then turn the remaining newlines into <br> so that
      // admin-entered markup can never survive into the page.
      return "<p>" + escapeHtml(paragraph).replace(/\n/g, "<br>") + "</p>";
    })
    .join("");
}

/** Render a labelled contact row, or nothing if the value is blank. */
function contactRow(label, value, href) {
  if (!value) return "";
  var body = href
    ? '<a href="' + escapeHtml(href) + '">' + escapeHtml(value) + "</a>"
    : escapeHtml(value);
  return (
    '<div class="contact-row"><span class="contact-label">' +
    escapeHtml(label) +
    '</span><span class="contact-value">' +
    body +
    "</span></div>"
  );
}

/** Render a social link row, or nothing if the URL is blank. */
function socialRow(label, url, text) {
  if (!url) return "";
  return (
    '<div class="contact-row"><span class="contact-label">' +
    escapeHtml(label) +
    '</span><span class="contact-value"><a href="' +
    escapeHtml(url) +
    '" rel="noopener noreferrer" target="_blank">' +
    escapeHtml(text) +
    "</a></span></div>"
  );
}

/** Build the "Get in touch" card shown under the Contact page body. */
function renderContactCard(settings) {
  var s = settings || DEFAULT_CONTACT;
  var rows = [
    contactRow("Email", s.contact_email, s.contact_email ? "mailto:" + s.contact_email : ""),
    contactRow("Phone", s.contact_phone, s.contact_phone ? "tel:" + s.contact_phone : ""),
    contactRow("Address", s.contact_address, ""),
    contactRow("Hours", s.contact_hours, ""),
    socialRow("Facebook", s.facebook_url, "Visit our Facebook page"),
    socialRow("Instagram", s.instagram_url, "Visit our Instagram"),
  ].join("");

  if (!rows) {
    return (
      '<div class="contact-card"><h2>Contact details</h2>' +
      '<p class="contact-empty">Contact details have not been added yet. ' +
      "Please check back soon.</p></div>"
    );
  }

  return (
    '<div class="contact-card"><h2>Contact details</h2>' +
    '<div class="contact-list">' +
    rows +
    "</div></div>"
  );
}

/** Show a friendly message when a page could not be loaded. */
function renderPageError(container, message) {
  container.innerHTML =
    '<div class="empty"><h2>' + escapeHtml(message) + "</h2></div>";
}

/**
 * Load a content page by slug into the given title/body elements.
 * The slug is read from the page's <body data-page="..."> attribute.
 */
async function initPage() {
  var slug = document.body.getAttribute("data-page");
  var titleEl = document.getElementById("page-title");
  var bodyEl = document.getElementById("page-body");
  if (!slug || !titleEl || !bodyEl) return;

  try {
    var result = await API.getPage(slug);
    if (result.error) {
      renderPageError(bodyEl, result.error);
      return;
    }
    var page = result.page || {};
    document.title = (page.title || slug) + " - GreenLeaf Plants";
    titleEl.textContent = page.title || slug;
    bodyEl.innerHTML = renderTextBlock(page.content);
  } catch (e) {
    renderPageError(bodyEl, "Could not load this page. Please try again shortly.");
  }

  // The Contact page also shows the admin-editable contact details.
  if (slug !== "contact") return;
  var detailsEl = document.getElementById("page-details");
  if (!detailsEl) return;
  try {
    var settings = await API.getSettings();
    if (settings.error) throw new Error(settings.error);
    detailsEl.innerHTML = renderContactCard(settings.settings);
  } catch (e) {
    detailsEl.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", initPage);
