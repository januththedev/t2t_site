import { Arrow } from "./Arrow";
import { programs } from "../programs";
import type { ImageAsset } from "../types";

const applications: Record<string, string> = {
  crisp: "https://forms.gle/KAqXzHDPBsFPy5EJ6",
  aix: "https://forms.gle/2V5hW6fKw9fCTFxeA",
  leadx: "https://forms.gle/xPPyZCp4LB5qKd237",
  ifap: "https://forms.gle/CFRTJTGr4M343xTF7",
};
const social = [
  ["Instagram", "https://www.instagram.com/theory2trade"],
  ["LinkedIn", "https://www.linkedin.com/company/trace-theory-to-trade/"],
  ["Facebook", "https://www.facebook.com/theory2trade"],
  ["YouTube", "https://youtube.com/@tracet2t"],
  ["TikTok", "https://www.tiktok.com/@t2t445"],
];
export function Footer({ path, logo }: { path: string; logo?: ImageAsset }) {
  const program = programs.find((item) => path === `/programs/${item.id}/`);
  const corporate = path === "/corporate-programs/";
  const href = program
    ? applications[program.id]
    : corporate
      ? "mailto:corporate@trace.lk"
      : "/#programs";
  const action = program
    ? `Apply for ${program.name}`
    : corporate
      ? "Start a conversation"
      : "Find your program";
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-invitation" id={program ? "apply" : undefined}>
          <div>
            <p className="eyebrow">LET’S TAKE THE NEXT STEP</p>
            <h2>
              {program ? (
                <>
                  Your next chapter,
                  <br />
                  <span>with {program.name}.</span>
                </>
              ) : corporate ? (
                <>
                  Build what’s next,
                  <br />
                  <span>together.</span>
                </>
              ) : (
                <>
                  Your next chapter
                  <br />
                  <span>starts here.</span>
                </>
              )}
            </h2>
          </div>
          <div className="footer-action">
            <a className="footer-next" href={href}>
              {action}
              <span className="footer-next-icon">
                <Arrow diagonal />
              </span>
            </a>
            <a className="footer-conversation" href="https://wa.me/94777643129">
              Or talk to the team <Arrow diagonal />
            </a>
          </div>
        </div>
        <div className="footer-details">
          <div className="footer-identity">
            <a
              className="footer-brand brand"
              href="/"
              aria-label="Theory to Trade home"
            >
              <span className="brandmark">
                <img
                  src={logo?.src ?? "/images/logos/t2t.png"}
                  srcSet={logo?.srcset}
                  sizes={logo?.sizes}
                  width={logo?.width}
                  height={logo?.height}
                  alt="T2T — Theory to Trade"
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span>
                Knowledge into practice.
                <br />
                <strong>Possibility into progress.</strong>
              </span>
            </a>
            <p className="footer-purpose">
              A learning initiative by{" "}
              <a
                href="https://trace.lk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                TRACE
              </a>{" "}
              · Colombo, Sri Lanka
            </p>
          </div>
          <nav className="footer-programs" aria-label="Footer programs">
            <p className="footer-label">EXPLORE THE PROGRAMS</p>
            <div>
              {programs.map((item) => (
                <a
                  key={item.id}
                  href={`/programs/${item.id}/`}
                  aria-current={
                    path === `/programs/${item.id}/` ? "page" : undefined
                  }
                >
                  {item.name}
                  <Arrow diagonal />
                </a>
              ))}
            </div>
          </nav>
          <div className="footer-contact">
            <p className="footer-label">GET IN TOUCH</p>
            <a href="mailto:corporate@trace.lk">
              corporate@trace.lk <Arrow diagonal />
            </a>
            <a href="https://wa.me/94777643129">
              +94 77 764 3129 <Arrow diagonal />
            </a>
          </div>
        </div>
        <div className="footer-legal">
          <span>
            © <span data-year>2026</span> Theory to Trade by TRACE
          </span>
          <nav aria-label="Social media">
            {social.map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {label}
              </a>
            ))}
          </nav>
          <div>
            <a href="/privacy_policy/">Privacy</a>
            <a className="back-to-top" href="#main">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
