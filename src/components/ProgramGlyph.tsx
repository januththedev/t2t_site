export function ProgramGlyph({ id }: { id: string }) {
  return (
    <svg
      className="program-glyph"
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {id === "crisp" && (
          <>
            <circle cx="40" cy="40" r="27" opacity=".3" />
            <path d="m29 51 7-19 15-3-7 19-15 3Z" />
            <path d="m13 40 8 0m38 0h8M40 13v8m0 38v8" opacity=".5" />
            <circle cx="40" cy="40" r="2" fill="currentColor" />
          </>
        )}
        {id === "aix" && (
          <>
            <rect x="24" y="24" width="32" height="32" rx="9" />
            <path
              d="M32 10v14m16-14v14M32 56v14m16-14v14M10 32h14m-14 16h14m32-16h14M56 48h14"
              opacity=".4"
            />
            <path d="m35 44 5-12 5 12m-8-4h6" />
            <circle cx="65" cy="14" r="3" fill="currentColor" stroke="none" />
          </>
        )}
        {id === "leadx" && (
          <>
            <path
              d="M15 62h50M23 53V39h10v14m7 0V29h10v24m7 0V19h10v34"
              opacity=".6"
            />
            <path d="m15 28 19-15h15m-9-7 9 7-9 7" />
            <circle cx="15" cy="28" r="3" fill="currentColor" stroke="none" />
          </>
        )}
        {id === "ifap" && (
          <>
            <rect x="13" y="20" width="54" height="40" rx="7" />
            <path
              d="M21 20v40m38-40v40M13 30h8m-8 20h8m38-20h8M59 50h8"
              opacity=".4"
            />
            <path d="m35 31 14 9-14 9V31Z" />
          </>
        )}
      </g>
    </svg>
  );
}
