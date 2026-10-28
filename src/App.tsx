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
import { theme } from "./theme";
import { Footer } from "./components/Footer";
import { Arrow } from "./components/Arrow";
import { ProgramNavigator } from "./components/ProgramNavigator";
import { homePhotos, partners } from "./home-content";
import { PageMotion } from "./components/PageMotion";
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
function Header({ path }: { path: string }) {
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
                  <a
                    key={p.id}
                    href={`/programs/${p.id}/`}
                    aria-current={
                      path === `/programs/${p.id}/` ? "page" : undefined
                    }
                  >
                    <strong>{p.name}</strong>
                    <span>{p.category}</span>
                  </a>
                ))}
              </div>
            </details>
            <a
              href="/corporate-programs/"
              aria-current={
                path === "/corporate-programs/" ? "page" : undefined
              }
            >
              For organizations
            </a>
            <a href="/#about">Our approach</a>
            <a href="/#events">Events</a>
          </nav>
          <Button
            component="a"
            href="/#programs"
            variant="contained"
            className="header-cta"
          >
            Explore programs <Arrow diagonal />
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
          <a
            href="/corporate-programs/"
            aria-current={path === "/corporate-programs/" ? "page" : undefined}
          >
            For organizations
          </a>
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
            <span className="status-dot" /> THEORY TO TRADE · BY TRACE
          </p>
          <h1>
            Where learning
            <br />
            <span>becomes doing.</span>
          </h1>
          <p className="hero-description">
            Turn what you learn into what you can do. Find your people, work
            with industry mentors, and build experience for your next chapter.
          </p>
          <div className="actions">
            <Button
              component="a"
              href="#programs"
              variant="contained"
              size="large"
            >
              Find your program <Arrow diagonal />
            </Button>
            <a href="#about" className="hero-secondary">
              Meet T2T <Arrow />
            </a>
          </div>
          <div className="hero-signoff">
            <span className="signoff-line" /> Practical learning. Real
            possibilities.
          </div>
        </div>
        <div className="new-hero-visual">
          <svg
            className="hero-connection"
            viewBox="0 0 600 580"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M22 470C22 100 480 5 535 170S578 520 300 540"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M42 478C42 138 450 31 517 181"
              stroke="currentColor"
              strokeOpacity=".35"
            />
            <circle cx="22" cy="470" r="4" fill="currentColor" />
            <circle cx="300" cy="540" r="4" fill="currentColor" />
          </svg>
          {depth && (
            <Suspense fallback={null}>
              <DepthScene />
            </Suspense>
          )}
          <figure className="hero-main-photo">
            <Picture
              src={homePhotos.primary}
              alt="A T2T learner sharing ideas with an industry mentor"
              eager
            />
            <figcaption>
              <span>THE T2T EXPERIENCE</span>
              <span>01 / Learn together</span>
            </figcaption>
          </figure>
          <figure className="hero-inset-photo">
            <Picture
              src={homePhotos.secondary}
              alt="T2T learners collaborating on a workshop activity"
            />
            <figcaption>
              Good ideas grow together.
              <Arrow diagonal />
            </figcaption>
          </figure>
          <span className="hero-location">
            Colombo, Sri Lanka <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </section>
  );
}
function Partners() {
  return (
    <section className="partner-ribbon" id="partners">
      <div className="container">
        <div className="partner-intro">
          <p className="eyebrow">OUR PARTNERS IN PROGRESS</p>
          <p>
            Learning goes further,
            <br />
            <strong>together.</strong>
          </p>
        </div>
        <div className="partner-marks">
          {partners.map((partner) => (
            <a
              href={partner.url}
              key={partner.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Picture src={partner.image} alt={partner.name} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
export function App({ payload }: { payload: Payload }) {
  return (
    <ThemeProvider theme={theme}>
      <Assets.Provider value={payload.images}>
        <Header path={payload.page.path} />
        <PageMotion />
        <main id="main" tabIndex={-1}>
          {payload.page.path === "/" && (
            <>
              <Hero />
              <Partners />
              <ProgramNavigator />
            </>
          )}
          <div
            className="published-content"
            dangerouslySetInnerHTML={{ __html: payload.page.html }}
          />
        </main>
        <Footer
          path={payload.page.path}
          logo={payload.images["images/logos/t2t.png"]}
        />
      </Assets.Provider>
    </ThemeProvider>
  );
}
