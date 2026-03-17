/**
 * Global Preferences — syncs tab selections across all Starlight <Tabs> on every page.
 *
 * Stores two keys in localStorage:
 *   wb-lang       → "JavaScript" | "TypeScript"
 *   wb-pkg        → "npm" | "bun" | "yarn" | "pnpm" | "Node.js" | "Bun"
 *
 * On page load the script waits for Starlight's tab custom-elements to
 * upgrade, then clicks the matching tab button for each group.
 *
 * When a user clicks ANY tab button, its label is persisted and all sibling
 * tab groups with the same label set are synchronised instantly.
 */
(function initPreferences() {
  const LANG_KEY = "wb-lang";
  const PKG_KEY = "wb-pkg";

  /* known labels per category */
  const LANG_LABELS = ["JavaScript", "TypeScript"];
  const PKG_LABELS = ["npm", "bun", "yarn", "pnpm", "Node.js", "Bun"];

  function getStoredLang() {
    return localStorage.getItem(LANG_KEY) || "JavaScript";
  }
  function getStoredPkg() {
    return localStorage.getItem(PKG_KEY) || "npm";
  }

  /** Determine whether a tab-group contains language tabs or pkg-manager tabs */
  function classifyGroup(buttons) {
    const labels = Array.from(buttons).map((b) => b.textContent.trim());
    if (labels.some((l) => LANG_LABELS.includes(l))) return "lang";
    if (labels.some((l) => PKG_LABELS.includes(l))) return "pkg";
    return null;
  }

  /** Click the button whose label matches the stored preference */
  function activatePreferred(tabGroup) {
    const buttons = tabGroup.querySelectorAll('[role="tab"]');
    if (!buttons.length) return;

    const kind = classifyGroup(buttons);
    if (!kind) return;

    const preferred =
      kind === "lang" ? getStoredLang() : getStoredPkg();

    for (const btn of buttons) {
      if (btn.textContent.trim() === preferred) {
        /* only click if not already active */
        if (btn.getAttribute("aria-selected") !== "true") {
          btn.click();
        }
        break;
      }
    }
  }

  /** Save preferences and sync all groups on the page */
  function handleTabClick(e) {
    const btn = e.target.closest('[role="tab"]');
    if (!btn) return;

    const label = btn.textContent.trim();

    if (LANG_LABELS.includes(label)) {
      localStorage.setItem(LANG_KEY, label);
    } else if (PKG_LABELS.includes(label)) {
      localStorage.setItem(PKG_KEY, label);
    } else {
      return; /* unknown tab, ignore */
    }

    /* Sync every other tab group on the page */
    document.querySelectorAll("starlight-tabs").forEach((tg) => {
      activatePreferred(tg);
    });
  }

  /** Bootstrap: wait until Starlight tabs are upgraded, then apply preferences */
  function boot() {
    const tabs = document.querySelectorAll("starlight-tabs");
    if (!tabs.length) return; /* page has no tabs */

    tabs.forEach((tg) => activatePreferred(tg));

    /* listen for future clicks */
    document.addEventListener("click", handleTabClick);
  }

  /* Starlight tabs are custom elements — they may not be upgraded immediately.
     Use a MutationObserver fallback for safety, but try immediately first. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      requestAnimationFrame(boot)
    );
  } else {
    requestAnimationFrame(boot);
  }

  /* Re-run on Astro's client-side navigation (View Transitions) */
  document.addEventListener("astro:page-load", () =>
    requestAnimationFrame(boot)
  );
})();
