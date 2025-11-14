import Link from "next/link";

const footerLinks = [
  { label: "Tal3nt App", href: "https://tal3nt.xyz" },
  { label: "Smart Contracts", href: "/docs/builder-suite/contracts" },
  { label: "Blog", href: "/blog" },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 flex w-[min(1100px,96%)] flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 px-6 py-8 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">Tal3nt Knowledge Graph</p>
          <p className="text-lg text-white/80">Stay close to protocol updates and ecosystem playbooks.</p>
        </div>
        <div className="flex items-center gap-3">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="text-xs text-white/50">© {new Date().getFullYear()} Tal3nt Collective. Designed in the GitBook spirit.</div>
    </footer>
  );
}
