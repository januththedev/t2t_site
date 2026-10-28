import { useRef } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { Arrow } from "./Arrow";
import { ProgramGlyph } from "./ProgramGlyph";
import { programs } from "../programs";
import { useProgramScroll } from "../useProgramScroll";

export function ProgramNavigator() {
  const { activeIndex, selectStep, track, stage, scrollDriven, compact } =
    useProgramScroll(programs.length);
  const tabs = useRef<Array<HTMLAnchorElement | null>>([]);
  const active = programs[activeIndex];
  const navigate = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % programs.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + programs.length) % programs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = programs.length - 1;
    else return;
    event.preventDefault();
    tabs.current[next]?.focus({ preventScroll: true });
    selectStep(next);
  };
  const select = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectStep(index);
  };
  return (
    <section className="section programs-section" id="programs">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">FIND YOUR DIRECTION</p>
            <h2>
              One next step.
              <br />
              <em>Four ways forward.</em>
            </h2>
          </div>
          <p>
            Build a career, explore AI, lead with confidence, or take your story
            further. Start with what matters to you.
          </p>
        </div>
        <div
          className="program-scroll-track"
          ref={track}
          data-scroll-driven={scrollDriven || undefined}
        >
          <div className="program-scroll-stage" ref={stage}>
            <div className="program-navigator">
              <div
                className="program-choices"
                role="tablist"
                aria-label="Choose a T2T program"
                aria-orientation={compact ? "horizontal" : "vertical"}
              >
                {programs.map((program, index) => (
                  <a
                    key={program.id}
                    ref={(node) => {
                      tabs.current[index] = node;
                    }}
                    id={`program-tab-${program.id}`}
                    role="tab"
                    href={`/programs/${program.id}/`}
                    aria-selected={index === activeIndex}
                    aria-controls="program-panel"
                    tabIndex={index === activeIndex ? 0 : -1}
                    onClick={(event) => select(event, index)}
                    onKeyDown={(event) => navigate(event, index)}
                    className="program-choice"
                  >
                    <span className="choice-number">{program.number}</span>
                    <span className="choice-copy">
                      <strong>{program.name}</strong>
                      <span>{program.audience}</span>
                    </span>
                    <span className="choice-arrow">
                      <Arrow />
                    </span>
                  </a>
                ))}
              </div>
              <div
                className={`program-spotlight ${active.id}`}
                id="program-panel"
                role="tabpanel"
                aria-labelledby={`program-tab-${active.id}`}
                tabIndex={0}
              >
                <div className="spotlight-content">
                  <div className="spotlight-story" key={active.id}>
                    <div className="spotlight-top">
                      <p className="eyebrow">{active.category}</p>
                      <span>{active.number} / 04</span>
                    </div>
                    <ProgramGlyph id={active.id} />
                    <h3>{active.name}</h3>
                    <p className="spotlight-description">{active.description}</p>
                  </div>
                  <dl className="spotlight-facts">
                    <div>
                      <dt>Duration</dt>
                      <dd>{active.duration}</dd>
                    </div>
                    <div>
                      <dt>Experience</dt>
                      <dd>{active.format}</dd>
                    </div>
                  </dl>
                  <a href={`/programs/${active.id}/`} className="spotlight-link">
                    Explore {active.name}
                    <span>
                      <Arrow diagonal />
                    </span>
                  </a>
                </div>
              </div>
            </div>
            <div className="program-scroll-cue">
              <span>
                <span aria-hidden="true">↓</span>
                {scrollDriven ? "Scroll to explore" : "Choose a program"}
              </span>
              <a href="#about">
                Continue to our approach <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </div>
        <div className="program-help">
          <span>A little guidance can go a long way.</span>
          <button className="text-button" data-open-guide="">
            Ask the T2T guide ↗
          </button>
        </div>
      </div>
    </section>
  );
}
