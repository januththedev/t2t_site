import { Arrow } from "./Arrow";
import { programs } from "../programs";

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
export function Footer({ path }: { path: string }) {
  const program = programs.find((p) => path === `/programs/${p.id}/`);
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
            <p className="eyebrow">
              {corporate
                ? "BUILD WHAT COMES NEXT, TOGETHER"
                : "YOUR NEXT CHAPTER"}
            </p>
            <h2>
              {program ? (
                <>
                  Your next move.
                  <br />
                  <span>Make it {program.name}.</span>
                </>
              ) : corporate ? (
                <>
                  A stronger team.
                  <br />
                  <span>A new possibility.</span>
                </>
              ) : (
                <>
                  Your potential.
                  <br />
                  <span>Make it happen.</span>
                </>
              )}
            </h2>
          </div>
          <div className="footer-action">
            <a className="footer-next" href={href}>
              <span className="footer-next-icon">
                <Arrow diagonal />
              </span>
              <span>{action}</span>
            </a>
            <a className="footer-conversation" href="https://wa.me/94777643129">
              Have a question? Let’s talk <Arrow diagonal />
            </a>
          </div>
        </div>
        <div className="footer-details">
          <p className="footer-purpose">
            A learning initiative by{" "}
            <a
              href="https://trace.lk/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TRACE <Arrow diagonal />
            </a>
            <br />
            Made for the space between
            <br />
            what you know and what comes next.
          </p>
          <nav className="footer-programs" aria-label="Footer programs">
            <p className="footer-label">FIND YOUR DIRECTION</p>
            <div>
              {programs.map((p) => (
                <a
                  href={`/programs/${p.id}/`}
                  key={p.id}
                  aria-current={
                    path === `/programs/${p.id}/` ? "page" : undefined
                  }
                >
                  {p.name}
                  <Arrow diagonal />
                </a>
              ))}
            </div>
          </nav>
          <div className="footer-contact">
            <p className="footer-label">LET’S CONNECT</p>
            <a href="mailto:corporate@trace.lk">
              corporate@trace.lk <Arrow diagonal />
            </a>
            <a href="https://wa.me/94777643129">
              +94 77 764 3129 <Arrow diagonal />
            </a>
          </div>
        </div>
        <a
          className="footer-signature"
          href="/"
          aria-label="Theory to Trade home"
        >
          <span>theory</span>
          <svg viewBox="0 0 160 100" fill="none" aria-hidden="true">
            <path
              className="signature-track"
              d="M8 77C42 77 43 23 78 23s37 54 73 54"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="m139 63 14 14-14 14"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle cx="8" cy="77" r="3" fill="currentColor" />
          </svg>
          <span>
            trade<span className="signature-period">.</span>
          </span>
        </a>
        <div className="footer-legal">
          <span>
            © <span data-year>2026</span> T2T by TRACE · Colombo, Sri Lanka
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
            <a href="#main" className="back-to-top">
              Back to top <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
