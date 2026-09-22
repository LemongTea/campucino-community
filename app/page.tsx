"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Coffee,
  Gift,
  LogIn,
  Menu,
  X,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Lenis from "lenis";
import { PolygonBorder } from "./components/PolygonBorder";

const catalog = [
  {
    icon: BookOpen,
    tag: "LEARNING / SEGERA",
    title: "Coffee Notes",
    text: "Catatan singkat dan insight untuk menemani proses belajar.",
  },
  {
    icon: Users,
    tag: "COMMUNITY / SEGERA",
    title: "Circle Campucino",
    text: "Tempat ngobrol, berbagi ide, dan bertemu orang-orang baru.",
  },
  {
    icon: Gift,
    tag: "COMING SOON",
    title: "Gift Corner",
    text: "Hadiah kecil dan kejutan yang akan hadir untuk member.",
  },
];

const natureLayers = [
  { file: "1.png", speed: 0, className: "opacity-100" },
  { file: "2.png", speed: 0.028, className: "opacity-100" },
  { file: "3.png", speed: 0.045, className: "opacity-100" },
  { file: "4.png", speed: 0.065, className: "opacity-100" },
  { file: "5.png", speed: 0.085, className: "opacity-100" },
  { file: "6.png", speed: 0.105, className: "opacity-100" },
];

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const setup = () => {
      dispose();
      if (preference.matches) return;
      const lenis = new Lenis({ autoRaf: true, lerp: 0.08, anchors: true });
      const hero = scope.querySelector<HTMLElement>("#home");
      const layers = Array.from(scope.querySelectorAll<HTMLElement>("[data-parallax]"));
      const animations = new Set<Animation>();
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          const animation = entry.target.animate(
            [{ opacity: 0, translate: "0 18px" }, { opacity: 1, translate: "0 0" }],
            { duration: 650, delay: (index % 4) * 55, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      scope.querySelectorAll("h1, h2, h3, p, a, button, [data-reveal]").forEach((el) => {
        if (!el.parentElement?.closest("a, button, [data-reveal]")) observer.observe(el);
      });
      const update = () => {
        if (!hero) return;
        const distance = Math.min(Math.max(-hero.getBoundingClientRect().top, 0), hero.offsetHeight);
        layers.forEach((el) => {
          el.style.transform = `translate3d(0, ${distance * Number(el.dataset.parallax)}px, 0)`;
        });
      };
      lenis.on("scroll", update);
      window.addEventListener("resize", update);
      update();
      dispose = () => {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
        lenis.destroy();
        window.removeEventListener("resize", update);
        layers.forEach((el) => el.style.removeProperty("transform"));
      };
    };
    setup();
    preference.addEventListener("change", setup);
    return () => { dispose(); preference.removeEventListener("change", setup); };
  }, []);
  return (
    <main ref={root} className="min-h-screen overflow-x-clip bg-[#1c1512] font-[family-name:var(--font-geist-sans)] text-[#fff4e4] [&_a]:transition [&_a]:duration-200 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-[#ffd08a] [&_a]:motion-safe:hover:-translate-y-0.5 [&_a]:active:translate-y-0 [&_button]:transition [&_button]:motion-safe:hover:scale-105 [&_button]:active:scale-95 motion-reduce:[&_a]:transition-none motion-reduce:[&_button]:transition-none">
      <nav aria-label="Navigasi utama" className="absolute inset-x-0 top-0 z-50 mx-auto flex h-24 w-[calc(100%-40px)] max-w-[1180px] items-center justify-between border-b border-white/10">
        <a
          href="#home"
          className="flex items-center gap-3 text-lg font-bold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rotate-[-8deg] rounded-none bg-[#e7a071] text-[#241813]">
            <Coffee size={17} />
          </span>
          campucino<span className="ml-1 text-[#e7a071]">community</span>
        </a>
        <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[.16em] text-[#cbbcaf] md:flex">
          <a className="text-[#e7a071]" href="#home">
            Home
          </a>
          <a href="#tools">Tools</a>
          <a href="#community">Community</a>
          <a href="#gift">Gift</a>
        </div>
        <div className="hidden items-center gap-5 md:flex">
          <a
            className="flex items-center gap-2 text-xs text-white/70"
            href="#community"
          >
            <LogIn size={15} /> Login (segera)
          </a>
          <a
            className="flex items-center gap-2 bg-[#c77b4f] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#241813] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))] transition hover:bg-[#e7a071]"
            href="#community"
          >
            Join us <ArrowRight size={14} />
          </a>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="p-2 text-white md:hidden" aria-label={menuOpen ? "Tutup menu" : "Buka menu"}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && <div id="mobile-navigation" className="absolute inset-x-0 top-24 grid gap-1 border border-[#e7a071]/30 bg-[#1c1512] p-4 md:hidden">
          {["Home", "Tools", "Community", "Gift"].map((label) => <a key={label} href={`#${label.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="p-3 text-sm hover:bg-[#35251d] hover:text-[#ffd08a]">{label}</a>)}
        </div>}
      </nav>
      <section
        id="home"
        className="relative flex min-h-[max(780px,100svh)] items-end overflow-hidden bg-[radial-gradient(circle_at_76%_25%,#6b3c29_0%,#241813_48%,#160f0c_100%)]"
      >
        {natureLayers.map(({ file, speed, className }) => (
          <div key={file} data-parallax={speed} className={`pointer-events-none absolute -inset-y-[12%] inset-x-0 z-[1] w-full ${className}`}>
            <Image src={`/Nature/nature_9/${file}`} alt="" fill sizes="100vw" className="object-cover" priority={file === "1.png"} />
          </div>
        ))}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(20,15,12,0.9),rgba(20,15,12,0.55)_55%,rgba(20,15,12,0.25)),linear-gradient(0deg,#1c1512,transparent_35%)]" />
        <div className="relative z-10 mx-auto w-[calc(100%-40px)] max-w-[1180px] pb-20 pt-40">
          <div data-reveal className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
            <Zap size={14} /> komunitas yang sedang bertumbuh
          </div>
          <h1 data-reveal className="max-w-3xl text-[clamp(2.75rem,7.5vw,6rem)] font-black uppercase leading-[.88] tracking-[-.07em] text-[#fffaf0]">
            Make room
            <br />
            <span className="text-[#ffd08a]">for growth.</span>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 text-[#fff4e4]">
            Campucino Community adalah ruang hangat untuk belajar, berkarya, dan
            bertemu dengan orang-orang yang punya rasa penasaran yang sama.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="bg-[#e7a071] p-px [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))] transition hover:bg-[#ffd08a]" href="#community">
              <span className="flex items-center gap-3 px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#241813] [clip-path:polygon(0_0,calc(100%-9px)_0,100%_9px,100%_100%,9px_100%,0_calc(100%-9px))]">Join community <ArrowRight size={16} /></span>
            </a>
            <a className="bg-[#fff4e4] p-px [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))] transition hover:bg-[#ffd08a]" href="#tools">
              <span className="flex items-center gap-3 bg-[#241813] px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#fff4e4] [clip-path:polygon(0_0,calc(100%-9px)_0,100%_9px,100%_100%,9px_100%,0_calc(100%-9px))]">Explore tools <ArrowRight size={16} /></span>
            </a>
          </div>
          <div className="mt-20 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            <div data-reveal className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">01</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-[#cbbcaf]">
                Community
              </span>
            </div></div>
            <div data-reveal className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">24/7</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-[#cbbcaf]">
                Curiosity
              </span>
            </div></div>
            <div data-reveal className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">∞</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-[#cbbcaf]">
                Ideas shared
              </span>
            </div></div>
            <div data-reveal className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">Soon</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-[#cbbcaf]">
                More features
              </span>
            </div></div>
          </div>
        </div>
        <PolygonBorder className="absolute bottom-8 right-8 hidden items-center gap-2 px-3 py-2 text-[9px] uppercase tracking-[.3em] text-[#cbbcaf] md:flex" corner="8px" thickness="1px">
          <span className="h-8 w-px bg-[#c77b4f]" />
          scroll to explore
        </PolygonBorder>
      </section>
      <div className="border-y border-white/10 bg-[#302019]">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1180px] flex-wrap items-center justify-between gap-5 py-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#cbbcaf]">
          <span className="text-[#e7a071]">Explore Campucino</span>
          <a href="#tools" className="flex items-center gap-2 hover:text-white">
            <BookOpen size={15} /> Tools
          </a>
          <a
            href="#community"
            className="flex items-center gap-2 hover:text-white"
          >
            <Users size={15} /> Community
          </a>
          <a href="#gift" className="flex items-center gap-2 hover:text-white">
            <Gift size={15} /> Gift corner
          </a>
          <span className="hidden items-center gap-2 text-[#e7a071] md:flex">
            <Sparkles size={14} /> stay curious
          </span>
        </div>
      </div>
      <section
        id="tools"
        className="relative z-10 flex min-h-screen items-center bg-[#1c1512] px-5 py-24 lg:sticky lg:top-0 lg:px-8 lg:py-32"
      >
        <div className="mx-auto grid w-full max-w-[1180px] gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div>
            <div data-reveal className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
              01 / what&apos;s inside
            </div>
            <h2 className="text-4xl font-black sm:text-5xl uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
              Small steps.
              <br />
              <span className="font-serif font-normal normal-case text-[#e7a071]">
                good energy.
              </span>
            </h2>
          </div>
          <div>
            <p className="max-w-lg text-lg leading-8 text-[#cbbcaf]">
              Kita mulai dari hal sederhana: ruang untuk menyimpan ide, tools
              untuk membantu proses, dan komunitas yang selalu punya tempat
              untukmu.
            </p>
            <div className="mt-10 grid gap-3">
              {catalog.map(({ icon: Icon, tag, title, text }) => (
                <a
                  href="#community"
                  key={title}
                  className="group flex items-center gap-5 border border-white/10 p-5 transition hover:border-[#c77b4f] hover:bg-[#302019]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#6b3c29] text-[#e7a071]">
                    <Icon size={20} />
                  </span>
                  <span className="flex-1">
                    <small className="text-[9px] font-bold tracking-[.2em] text-[#e7a071]">
                      {tag}
                    </small>
                    <strong className="mt-1 block text-base">{title}</strong>
                    <span className="mt-1 block text-xs text-[#cbbcaf]">
                      {text}
                    </span>
                  </span>
                  <ArrowRight
                    className="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#e7a071]"
                    size={18}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        id="community"
        className="relative z-20 lg:sticky lg:top-0 flex min-h-screen items-center border-y border-white/10 bg-[#2c2019] text-[#fff4e4]"
      >
        <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1180px] gap-12 py-28 md:grid-cols-2 md:items-center md:gap-24">
          <div>
            <div data-reveal className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
              02 / why campucino
            </div>
            <h2 className="text-4xl font-black sm:text-5xl uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
              A warmer
              <br />
              <span className="font-serif font-normal normal-case text-[#e7a071]">
                way to grow.
              </span>
            </h2>
          </div>
          <div className="grid gap-7">
            {[
              {
                icon: Sparkles,
                title: "Ruang yang nyaman",
                text: "Datang sebagai dirimu sendiri. Tidak ada tekanan untuk selalu sempurna.",
              },
              {
                icon: Users,
                title: "Teman seperjalanan",
                text: "Karena belajar terasa lebih seru ketika ada yang bisa diajak berbagi.",
              },
              {
                icon: Zap,
                title: "Mulai dari sekarang",
                text: "Satu ide kecil hari ini bisa menjadi sesuatu yang besar esok hari.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                className="flex gap-4 border-b border-[#e7a071]/20 pb-6"
                key={title}
              >
                <Icon className="mt-1 shrink-0 text-[#e7a071]" size={22} />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#cbbcaf]">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="gift"
        className="relative z-30 mx-auto flex bg-[#1c1512] min-h-screen w-full px-5 flex-col justify-center py-28 text-center md:py-36"
      >
        <Gift className="mx-auto mb-6 text-[#e7a071]" size={31} />
        <div data-reveal className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
          03 / coming soon
        </div>
        <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-black sm:text-5xl uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
          Keep your cup
          <br />
          <span className="font-serif font-normal normal-case text-[#e7a071]">
            half full.
          </span>
        </h2>
        <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-[#cbbcaf]">
          Banyak hal baik sedang disiapkan untuk komunitas ini. Stay close, and
          keep your curiosity warm.
        </p>
        <a
          href="#home"
          className="mx-auto mt-8 inline-flex items-center gap-3 border border-[#c77b4f] px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#e7a071]"
        >
          Back to top <ArrowRight size={15} className="-rotate-90" />
        </a>
      </section>
      <footer className="relative z-40 border-t border-white/10 bg-[#160f0c]">
        <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1180px] gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a
              href="#home"
              className="flex items-center gap-3 text-lg font-bold"
            >
              <span className="grid h-8 w-8 place-items-center rotate-[-8deg] rounded-none bg-[#e7a071] text-[#241813]">
                <Coffee size={17} />
              </span>
              campucino
            </a>
            <p className="mt-5 max-w-xs text-xs leading-6 text-[#cbbcaf]">
              A warm corner for curious minds. Made with care, coffee, and
              community.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7a071]">
              Navigate
            </h3>
            <div className="mt-5 grid gap-3 text-xs text-[#cbbcaf]">
              <a href="#home">Home</a>
              <a href="#tools">Tools</a>
              <a href="#community">Community</a>
              <a href="#gift">Gift</a>
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7a071]">
              Campucino Community
            </h3>
            <p className="mt-5 text-xs leading-6 text-[#cbbcaf]">
              Belajar, berbagi, dan bertumbuh bareng-bareng.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-[10px] uppercase tracking-widest text-[#b8a89a]">
          © 2026 Campucino Community · brewed for growth
        </div>
      </footer>
    </main>
  );
}
