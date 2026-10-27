import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { theme } from "./theme";
import { programs } from "./programs";
import type { Payload } from "./types";
const Assets = createContext<Payload["images"]>({});
const DepthScene = lazy(() => import("./components/DepthScene"));
function Picture({
  src,
  alt,
  eager = false,
}: {
  src: string;
  alt: string;
  eager?: boolean;
}) {
  const asset = useContext(Assets)[src.slice(1)];
  return (
    <img
      src={asset?.src ?? src}
      srcSet={asset?.srcset}
      sizes={asset?.sizes}
      width={asset?.width}
      height={asset?.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
    />
  );
}
function Brand() {
  return (
    <a className="brand" href="/" aria-label="Theory to Trade by TRACE home">
      <span className="brandmark">
        <Picture
          src="/images/logos/t2t.png"
          alt="T2T — Theory to Trade"
          eager
        />
      </span>
      <span className="brand-caption">
        A learning initiative
        <br />
        <strong>by TRACE</strong>
      </span>
    </a>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (button.current?.getAttribute("aria-expanded") === "true") {
          setOpen(false);
          button.current.focus();
        }
        document
          .querySelectorAll<HTMLDetailsElement>(".program-menu[open]")
          .forEach((d) => {
            d.open = false;
            d.querySelector("summary")?.focus();
          });
      }
    };
    const media = matchMedia("(min-width: 901px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    const outside = (e: MouseEvent) => {
      document
        .querySelectorAll<HTMLDetailsElement>(".program-menu[open]")
        .forEach((d) => {
          if (!d.contains(e.target as Node)) d.open = false;
        });
    };
    document.addEventListener("click", outside);
    document.addEventListener("keydown", close);
    media.addEventListener("change", resize);
    return () => {
      document.removeEventListener("click", outside);
      document.removeEventListener("keydown", close);
      media.removeEventListener("change", resize);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav className="primary-nav" aria-label="Primary">
            <details className="program-menu">
              <summary>
                Programs <span aria-hidden="true">⌄</span>
              </summary>
              <div className="program-dropdown">
                {programs.map((p) => (
                  <a key={p.id} href={`/programs/${p.id}/`}>
                    <strong>{p.name}</strong>
                    <span>{p.category}</span>
                  </a>
                ))}
              </div>
            </details>
            <a href="/corporate-programs/">For organizations</a>
            <a href="/#about">Our approach</a>
            <a href="/#events">Events</a>
          </nav>
          <Button
            component="a"
            href="/#programs"
            variant="contained"
            className="header-cta"
          >
            Explore programs ↗
          </Button>
          <button
            ref={button}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close ×" : "Menu ☰"}
          </button>
        </div>
        <nav
          className="mobile-nav container"
          id="mobile-nav"
          aria-label="Mobile"
          hidden={!open}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {programs.map((p) => (
            <a href={`/programs/${p.id}/`} key={p.id}>
              {p.name}
              <span>{p.category}</span>
            </a>
          ))}
          <a href="/corporate-programs/">For organizations</a>
          <a href="/#about">Our approach</a>
          <a href="/#events">Events & workshops</a>
        </nav>
      </header>
    </>
  );
}
function Hero() {
  const [depth, setDepth] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !matchMedia("(max-width: 700px)").matches
      )
        setDepth(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section className="new-hero" id="top">
      <div className="container new-hero-grid">
        <div className="new-hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> KNOWLEDGE IS JUST THE BEGINNING
          </p>
          <h1>
            Make your
            <br />
            next move
            <br />
            <span>mean something.</span>
          </h1>
          <p className="hero-description">
            Turn what you know into what you can do.
            <br />
            Practical learning. Industry mentors. Real possibilities.
          </p>
          <div className="actions">
            <Button
              component="a"
              href="#programs"
              variant="contained"
              size="large"
            >
              Find your program <span aria-hidden="true">↗</span>
            </Button>
            <Button component="a" href="#about" variant="text" size="large">
              Discover T2T <span aria-hidden="true">↗</span>
            </Button>
          </div>
          <div className="hero-signoff">
            <span className="signoff-line" /> Your potential. Put into practice.
          </div>
        </div>
        <div className="new-hero-visual">
          <div className="depth-fallback" />
          {depth && (
            <Suspense fallback={null}>
              <DepthScene />
            </Suspense>
          )}
          <figure className="new-hero-photo">
            <Picture
              src="/images/IMG_20250330_121443-scaled.jpg"
              alt="T2T learners collaborating on an idea during a workshop"
              eager
            />
            <figcaption>
              <span className="photo-dot" /> THE CLASSROOM IS ONLY THE START.
            </figcaption>
          </figure>
          <div className="hero-float">
            <span className="float-icon">↗</span>
            <span>
              Less just knowing.
              <br />
              <strong>More actually doing.</strong>
            </span>
          </div>
          <div className="visual-label">
            <span>LEARN. BUILD. BECOME.</span>
            <span>01 — T2T</span>
          </div>
        </div>
      </div>
      <div className="container hero-strip">
        <span>Built around your next chapter</span>
        <span>Practical skills</span>
        <span>Industry perspective</span>
        <span>Real project experience</span>
        <a href="#programs" aria-label="Explore programs below">
          ↓
        </a>
      </div>
    </section>
  );
}
function Explorer() {
  const [filter, setFilter] = useState("All programs");
  const filtered = programs.filter(
    (p) => filter === "All programs" || p.category === filter,
  );
  return (
    <section className="section programs-section" id="programs">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">FOUR PATHS. YOUR NEXT CHAPTER.</p>
            <h2>
              A little direction.
              <br />
              <em>A lot of possibility.</em>
            </h2>
          </div>
          <p>
            Starting out, stepping up, or changing direction.
            <br />
            Find the experience that moves you forward.
          </p>
        </div>
        <div
          className="program-filters"
          role="group"
          aria-label="Filter programs"
        >
          {["All programs", ...programs.map((p) => p.category)].map((c) => (
            <Chip
              key={c}
              label={c}
              clickable
              color={filter === c ? "primary" : "default"}
              variant={filter === c ? "filled" : "outlined"}
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </div>
        <p className="sr-only" role="status">
          {filtered.length} program{filtered.length === 1 ? "" : "s"} shown
        </p>
        <div className="new-program-grid">
          {filtered.map((p) => (
            <article className={`new-program-card ${p.id}`} key={p.id}>
              <div className="card-top">
                <span>{p.number}</span>
                <span>{p.category}</span>
                <span aria-hidden="true">↗</span>
              </div>
              <h3>
                <a href={`/programs/${p.id}/`}>{p.name}</a>
              </h3>
              <p className="card-audience">{p.audience}</p>
              <p className="card-description">{p.description}</p>
              <div className="card-bottom">
                <span>{p.duration}</span>
                <a href={`/programs/${p.id}/`} aria-label={`Explore ${p.name}`}>
                  Explore program <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="program-help">
          <span>Not sure which path fits?</span>
          <button className="text-button" data-open-guide="">
            Ask the T2T guide ↗
          </button>
        </div>
      </div>
    </section>
  );
}
export function App({ payload }: { payload: Payload }) {
  return (
    <ThemeProvider theme={theme}>
      <Assets.Provider value={payload.images}>
        <Header />
        <main id="main" tabIndex={-1}>
          {payload.page.path === "/" && (
            <>
              <Hero />
              <Explorer />
            </>
          )}
          <div
            className="published-content"
            dangerouslySetInnerHTML={{ __html: payload.page.html }}
          />
        </main>
        <div dangerouslySetInnerHTML={{ __html: payload.footer }} />
      </Assets.Provider>
    </ThemeProvider>
  );
}
