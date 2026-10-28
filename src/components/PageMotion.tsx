import { useEffect } from "react";

/** Decorative movement stays outside React-owned content and never blocks reading. */
export function PageMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const hero = document.querySelector<HTMLElement>(
      ".new-hero, .program-hero, .corporate-hero, .reading-hero",
    );
    let ambientVisible = true;
    const update = () => {
      root.classList.toggle(
        "motion-paused",
        document.hidden || preference.matches,
      );
      hero?.classList.toggle(
        "ambient-running",
        ambientVisible && !document.hidden && !preference.matches,
      );
      if (preference.matches) {
        document
          .querySelectorAll(".reveal-pending")
          .forEach((el) => el.classList.remove("reveal-pending"));
      }
    };
    const ambientObserver = new IntersectionObserver(([entry]) => {
      ambientVisible = entry.isIntersecting;
      update();
    });
    if (hero) ambientObserver.observe(hero);
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("reveal-pending");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.06 },
    );
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".section-heading, .program-section > .section-content, .reading-content > section, .corporate-stages, .footer-invitation",
      ),
    );
    if (!preference.matches) {
      targets.forEach((el) => {
        // Already visible content stays visible; only reveal sections on approach.
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        el.classList.add("reveal-target", "reveal-pending");
        revealObserver.observe(el);
      });
    }
    document.addEventListener("visibilitychange", update);
    preference.addEventListener("change", update);
    update();
    return () => {
      ambientObserver.disconnect();
      revealObserver.disconnect();
      document.removeEventListener("visibilitychange", update);
      preference.removeEventListener("change", update);
      root.classList.remove("motion-paused");
      hero?.classList.remove("ambient-running");
      targets.forEach((el) =>
        el.classList.remove("reveal-target", "reveal-pending"),
      );
    };
  }, []);
  return null;
}
