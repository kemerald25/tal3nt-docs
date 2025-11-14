import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/navigation/MainNav";

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 mx-auto flex w-[min(1200px,96%)] items-center justify-between rounded-2xl border border-white/10 bg-[#0b0813]/80 px-4 py-3 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/tal3nt.svg" alt="Tal3nt" width={36} height={36} />
      </Link>
      <div className="hidden md:block">
        <MainNav />
      </div>
      <Link
        href="/docs"
        className="rounded-full bg-gradient-to-r from-[#eeddfd] via-[#c084fc] to-[#5de0ff] px-4 py-2 text-sm font-semibold text-[#05030a] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
      >
        Explore Docs
      </Link>
    </header>
  );
}
