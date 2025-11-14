import Image from "next/image";

const partners = [
  { src: "/logos/monad.png", alt: "Monad" },
  { src: "/logos/magiceden.png", alt: "Magic Eden" },
  { src: "/logos/chainlink.png", alt: "Chainlink" },
  { src: "/logos/opensea.png", alt: "OpenSea" },
  { src: "/logos/usdc.png", alt: "USDC" },
  { src: "/logos/uniswap.png", alt: "Uniswap" },
];

export function LogoCloud() {
  return (
    <section className="mx-auto mt-20 flex w-[min(1100px,96%)] flex-col gap-6 rounded-3xl border border-white/5 bg-[#0a0713]/70 px-6 py-8 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.4em] text-white/60">BET ON TALENT</p>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-6">
        {partners.map((partner) => (
          <div key={partner.alt} className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <Image src={partner.src} alt={partner.alt} width={120} height={40} className="opacity-80" />
          </div>
        ))}
      </div>
    </section>
  );
}
