import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "120+", label: "Ecosystems hiring" },
  { value: "5%", label: "Protocol fee" },
  { value: "<48h", label: "Average bounty payout" },
];

export function Hero() {
  return (
    <section className="mx-auto mt-16 flex w-[min(1100px,96%)] flex-col gap-8 overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-[#150f2a]/80 via-[#0b0815] to-[#05030a] p-8 text-white shadow-[0px_30px_80px_rgba(3,2,8,0.7)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-6">
          <p className="tag-pill inline-flex items-center gap-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-[#c084fc]" />
            GitBook-inspired release
          </p>
          <div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              The Tal3nt documentation layer for decentralized work
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Curated guides, release notes, and contributor ops surfaced in a rich GitBook-style reader built with Next.js, TypeScript, and Tailwind.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs"
              className="rounded-full bg-white px-6 py-3 font-semibold text-[#05030a]"
            >
              Browse docs
            </Link>
            <Link
              href="/blog"
              className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white/80"
            >
              Read the blog
            </Link>
          </div>
        </div>
        <div className="relative flex-1 rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="absolute inset-0 -z-10 blur-3xl" style={{ background: "radial-gradient(circle, rgba(238,221,253,0.45), transparent 65%)" }} />
          <Image src="/hero-img1.png" alt="Tal3nt hero" width={480} height={380} className="rounded-3xl" priority />
          <div className="mt-4 space-y-4 text-sm text-white/70">
            <p className="font-semibold text-white">Tal3nt Operator Cockpit</p>
            <p>Visualize bounties, escrow status, and contributor NFTs without leaving this surface.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
