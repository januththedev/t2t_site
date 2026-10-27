import { publishedEventDay, colomboDay } from "./event-dates.js";

/* Progressive enhancements. Content and primary links work without JavaScript. */
const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
function closeMenu(restoreFocus = false) {
  if (!menuButton || !mobileNav) return;
  mobileNav.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  if (restoreFocus) menuButton.focus();
}
menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mobileNav.hidden = !open;
  document.body.classList.toggle("menu-open", open);
});
mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (menuButton?.getAttribute("aria-expanded") === "true") closeMenu(true);
  document.querySelectorAll(".program-menu[open]").forEach((menu) => {
    menu.open = false;
    menu.querySelector("summary").focus();
  });
});
document.addEventListener("click", (event) => {
  document.querySelectorAll(".program-menu[open]").forEach((menu) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
window.matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
const filters = document.querySelector(".filters");
if (filters) {
  filters.hidden = false;
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    const filter = button.dataset.filter;
    filters
      .querySelectorAll("button")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    let count = 0;
    document.querySelectorAll("[data-program]").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.program !== filter;
      if (!card.hidden) count++;
    });
    document.querySelector("#filter-status").textContent =
      `${count} program${count === 1 ? "" : "s"} shown`;
  });
}
document.querySelectorAll("[data-open-guide]").forEach((button) =>
  button.addEventListener("click", () => {
    const launcher = document
      .querySelector("#t2t-chatbot")
      ?.shadowRoot?.querySelector(".launcher");
    if (launcher) {
      if (launcher.getAttribute("aria-expanded") !== "true") launcher.click();
    } else window.location.href = "https://wa.me/94777643129";
  }),
);
const sections = document.querySelectorAll(".program-section[id]");
if (sections.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (!entry) return;
      document.querySelectorAll(".page-index nav a").forEach((link) => {
        if (link.hash === "#" + entry.target.id)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-110px 0px -55% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}
const eventsGrid = document.querySelector("#events-grid");
const more = document.querySelector("#events-more");
if (eventsGrid) {
  const today = colomboDay();
  const safeLink = (value) => {
    try {
      const url = new URL(value, location.origin);
      return ["https:", "http:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };
  fetch("/data/events.json")
    .then((response) => {
      if (!response.ok) throw new Error("Events unavailable");
      return response.json();
    })
    .then((events) => {
      const items = events
        .map((event) => {
          const research = event.image.includes("research-excellence");
          const day = publishedEventDay(event);
          const date = day ? new Date(day + "T00:00:00Z") : null;
          return {
            ...event,
            dateObject: day ? date : null,
            day,
            upcoming: Boolean(day && day >= today),
            research,
          };
        })
        .sort(
          (a, b) =>
            Number(b.upcoming) - Number(a.upcoming) ||
            (a.upcoming
              ? (a.day || "").localeCompare(b.day || "")
              : (b.day || "").localeCompare(a.day || "")),
        );
      const upcoming = items.filter((event) => event.upcoming).length;
      document.querySelector("#events-status").textContent = upcoming
        ? `${upcoming} upcoming event${upcoming === 1 ? "" : "s"} · Confirm availability with the team.`
        : "No upcoming dates are published yet. Take a look back at our workshops, or ask the team what’s next.";
      let expanded = false;
      function render() {
        eventsGrid.replaceChildren();
        for (const event of expanded ? items : items.slice(0, 3)) {
          const row = document.createElement("article");
          row.className = "event-row";
          const date = document.createElement("div");
          date.className = "event-date";
          const month = document.createElement("span");
          month.textContent = event.dateObject
            ? event.dateObject
                .toLocaleDateString("en-US", {
                  month: "short",
                  timeZone: "UTC",
                })
                .toUpperCase()
            : "DATE";
          const day = document.createElement("strong");
          day.textContent = event.day ? event.day.slice(-2) : "—";
          const year = document.createElement("span");
          year.textContent = event.day
            ? `${event.day.slice(0, 4)} · ${event.upcoming ? "Upcoming" : "Past event"}`
            : "Unconfirmed";
          date.append(month, day, year);
          const copy = document.createElement("div");
          const tag = document.createElement("p");
          tag.className = "eyebrow";
          tag.textContent = event.meta;
          const heading = document.createElement("h3");
          heading.textContent = event.title.replace(/[🚀👉]/gu, "").trim();
          const description = document.createElement("p");
          description.textContent = event.description;
          copy.append(tag, heading, description);
          row.append(date, copy);
          const destination = event.research
            ? "/events/research-excellence/"
            : (event.buttons || []).find(
                (item) =>
                  item.link && (!/register/i.test(item.text) || event.upcoming),
              )?.link;
          const link = document.createElement("a");
          link.className = "circle-arrow";
          link.href = safeLink(destination || "https://wa.me/94777643129");
          link.textContent = "↗";
          link.setAttribute(
            "aria-label",
            `${destination ? "View" : "Ask about"} ${event.title}`,
          );
          row.append(link);
          eventsGrid.append(row);
        }
        more.hidden = items.length <= 3;
        more.textContent = expanded
          ? "Show fewer events ↑"
          : "View all events ↓";
        more.setAttribute("aria-expanded", String(expanded));
        more.setAttribute("aria-controls", "events-grid");
      }
      render();
      more.addEventListener("click", () => {
        expanded = !expanded;
        render();
        if (!expanded)
          document.querySelector("#events").scrollIntoView({ block: "start" });
      });
    })
    .catch(() => {
      document.querySelector("#events-status").textContent =
        "The full event list is temporarily unavailable. You can still view the workshop below or contact the team.";
    });
}
