import { useEffect, useRef, useState } from "react";

/** Let native page scrolling drive a short, reversible program sequence. */
export function useProgramScroll(count: number) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const geometry = useRef<{ step: number; top: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollDriven, setScrollDriven] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const trackNode = track.current;
    const stageNode = stage.current;
    if (!trackNode || !stageNode) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const compactLayout = matchMedia("(max-width: 650px)");
    let scrollFrame = 0;
    let measureFrame = 0;

    const update = () => {
      scrollFrame = 0;
      const current = geometry.current;
      if (!current) return;
      const offset = current.top - trackNode.getBoundingClientRect().top;
      const next = Math.max(
        0,
        Math.min(count - 1, Math.floor(offset / current.step)),
      );
      setActiveIndex((previous) => (previous === next ? previous : next));
    };
    const onScroll = () => {
      if (geometry.current && !scrollFrame)
        scrollFrame = requestAnimationFrame(update);
    };
    const measure = () => {
      measureFrame = 0;
      const top = parseFloat(getComputedStyle(stageNode).top) || 0;
      const height = stageNode.getBoundingClientRect().height;
      const viewport = document.documentElement.clientHeight;
      // A short or zoomed viewport gets the regular, fully accessible selector.
      const enabled = !reducedMotion.matches && height + top + 24 <= viewport;
      setCompact(compactLayout.matches);
      setScrollDriven(enabled);
      if (enabled) {
        const step = Math.max(240, Math.min(480, viewport * 0.48));
        geometry.current = { step, top };
        trackNode.style.setProperty(
          "--program-track-height",
          `${height + count * step}px`,
        );
        update();
      } else {
        geometry.current = null;
        trackNode.style.removeProperty("--program-track-height");
      }
    };
    const scheduleMeasure = () => {
      if (!measureFrame) measureFrame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(stageNode);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleMeasure);
    reducedMotion.addEventListener("change", scheduleMeasure);
    compactLayout.addEventListener("change", scheduleMeasure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleMeasure);
      reducedMotion.removeEventListener("change", scheduleMeasure);
      compactLayout.removeEventListener("change", scheduleMeasure);
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(measureFrame);
      geometry.current = null;
      trackNode.style.removeProperty("--program-track-height");
    };
  }, [count]);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    const current = geometry.current;
    if (!current || !track.current) return;
    const start =
      window.scrollY + track.current.getBoundingClientRect().top - current.top;
    // Keep manual and keyboard choices aligned with the native scroll sequence.
    // No wheel/touch interception, focus changes, or programmatic scroll on scroll.
    window.scrollTo({
      top: Math.max(0, start + (index + 0.35) * current.step),
      behavior: "instant",
    });
  };

  return { activeIndex, selectStep, track, stage, scrollDriven, compact };
}
