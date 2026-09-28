/**
 * footer.js - Keeps the footer copyright text in sync with the admin-editable
 * site settings.
 *
 * The About / Contact links are plain markup in each page (so they still work
 * if this script fails to load); only the settings-driven text is replaced.
 * On any failure the static text already in the HTML is left untouched.
 */

document.addEventListener("DOMContentLoaded", async function () {
  var text = document.querySelector(".footer-text");
  if (!text) return;

  try {
    var result = await API.getSettings();
    var settings = result.settings;
    if (result.error || !settings || !settings.footer_text) return;
    text.textContent = settings.footer_text;
  } catch (e) {
    // Keep the static footer text.
  }
});
