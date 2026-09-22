"use client";
import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  Coffee,
  Gift,
  LogIn,
  Menu,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Lenis from "lenis";
import { PolygonBorder } from "./components/PolygonBorder";

const catalog = [
  {
    icon: BookOpen,
    tag: "LEARNING",
    title: "Coffee Notes",
    text: "Catatan singkat dan insight untuk menemani proses belajar.",
  },
  {
    icon: Users,
    tag: "COMMUNITY",
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

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08 });
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    const reveal = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("!translate-y-0", "!opacity-100")), { threshold: 0.15 });
    reveal.forEach((element) => observer.observe(element));
    const update = ({ scroll }: { scroll: number }) => parallax.forEach((element) => { const speed = Number(element.dataset.parallax ?? 0); element.style.transform = `translate3d(0, ${scroll * speed}px, 0)`; });
    lenis.on("scroll", update);
    return () => { observer.disconnect(); lenis.off("scroll", update); lenis.destroy(); };
  }, []);
  return (
    <main className="min-h-screen overflow-hidden bg-[#241813] text-[#fff9f0]">
      <nav className="absolute inset-x-0 top-0 z-20 mx-auto flex h-24 w-[calc(100%-40px)] max-w-[1180px] items-center justify-between border-b border-white/10">
        <a
          href="#home"
          className="flex items-center gap-3 text-lg font-bold tracking-tight"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#c77b4f] text-[#241813]">
            <Coffee size={17} />
          </span>
          campucino<span className="ml-1 text-[#c77b4f]">community</span>
        </a>
        <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[.16em] text-white/60 md:flex">
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
            <LogIn size={15} /> Login
          </a>
          <a
            className="flex items-center gap-2 bg-[#c77b4f] px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#241813] [clip-path:polygon(10px_0,100%_0,calc(100%-10px)_100%,0_100%)] transition hover:bg-[#e7a071]"
            href="#community"
          >
            Join us <ArrowRight size={14} />
          </a>
        </div>
        <button className="text-white md:hidden" aria-label="Buka menu">
          <Menu size={22} />
        </button>
      </nav>
      <section
        id="home"
        className="relative flex min-h-[780px] items-end bg-[radial-gradient(circle_at_76%_25%,#6b3c29_0%,#241813_48%,#160f0c_100%)]"
      >
        <div data-parallax="-0.08" className="absolute right-[-10%] top-32 h-[620px] w-[620px] rounded-full border border-[#c77b4f]/20 bg-[#6b3c29]/20 shadow-[0_0_120px_#8d4c2d55] transition-transform duration-100" />
        <div data-parallax="-0.18" className="absolute right-[15%] top-52 text-[#c77b4f]/50 transition-transform duration-100">
          <Coffee size={190} strokeWidth={0.6} />
        </div>
        <div className="relative z-10 mx-auto w-[calc(100%-40px)] max-w-[1180px] pb-20 pt-40">
          <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
            <Zap size={14} /> komunitas yang sedang bertumbuh
          </div>
          <h1 data-reveal className="max-w-3xl translate-y-8 text-6xl font-black uppercase leading-[.88] tracking-[-.07em] opacity-0 transition duration-1000 md:text-8xl">
            Make room
            <br />
            <span className="text-[#e7a071]">for growth.</span>
          </h1>
          <p className="mt-8 max-w-md text-sm leading-7 text-white/60">
            Campucino Community adalah ruang hangat untuk belajar, berkarya, dan
            bertemu dengan orang-orang yang punya rasa penasaran yang sama.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="bg-[#c77b4f] p-px [clip-path:polygon(10px_0,100%_0,calc(100%-10px)_100%,0_100%)] transition hover:bg-[#e7a071]" href="#community">
              <span className="flex items-center gap-3 px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#241813] [clip-path:polygon(9px_0,100%_0,calc(100%-9px)_100%,0_100%)]">Join community <ArrowRight size={16} /></span>
            </a>
            <a className="bg-white/30 p-px [clip-path:polygon(10px_0,100%_0,calc(100%-10px)_100%,0_100%)] transition hover:bg-[#e7a071]" href="#tools">
              <span className="flex items-center gap-3 bg-[#241813] px-5 py-4 text-xs font-bold uppercase tracking-wider text-white [clip-path:polygon(9px_0,100%_0,calc(100%-9px)_100%,0_100%)]">Explore tools <ArrowRight size={16} /></span>
            </a>
          </div>
          <div className="mt-20 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">01</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-white/50">
                Community
              </span>
            </div></div>
            <div className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">24/7</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-white/50">
                Curiosity
              </span>
            </div></div>
            <div className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">∞</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-white/50">
                Ideas shared
              </span>
            </div></div>
            <div className="bg-white/30 p-px [clip-path:polygon(8px_0,100%_0,calc(100%-8px)_100%,0_100%)]"><div className="bg-[#241813] p-4 [clip-path:polygon(7px_0,100%_0,calc(100%-7px)_100%,0_100%)]">
              <b className="text-2xl text-[#e7a071]">Soon</b>
              <span className="mt-2 block text-[9px] uppercase tracking-widest text-white/50">
                More features
              </span>
            </div></div>
          </div>
        </div>
        <PolygonBorder className="absolute bottom-8 right-8 hidden items-center gap-2 px-3 py-2 text-[9px] uppercase tracking-[.3em] text-white/40 md:flex" corner="8px" thickness="1px">
          <span className="h-8 w-px bg-[#c77b4f]" />
          scroll to explore
        </PolygonBorder>
      </section>
      <div className="border-y border-white/10 bg-[#302019]">
        <div className="mx-auto flex w-[calc(100%-40px)] max-w-[1180px] flex-wrap items-center justify-between gap-5 py-5 text-[10px] font-bold uppercase tracking-[.18em] text-white/55">
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
          <span className="hidden items-center gap-2 text-[#c77b4f] md:flex">
            <Sparkles size={14} /> stay curious
          </span>
        </div>
      </div>
      <section
        id="tools"
        className="mx-auto w-[calc(100%-40px)] max-w-[1180px] py-28 md:py-36"
      >
        <div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <div>
            <div className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
              01 / what&apos;s inside
            </div>
            <h2 className="text-5xl font-black uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
              Small steps.
              <br />
              <span className="font-serif font-normal normal-case text-[#c77b4f]">
                good energy.
              </span>
            </h2>
          </div>
          <div>
            <p className="max-w-lg text-lg leading-8 text-white/65">
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
                    <small className="text-[9px] font-bold tracking-[.2em] text-[#c77b4f]">
                      {tag}
                    </small>
                    <strong className="mt-1 block text-base">{title}</strong>
                    <span className="mt-1 block text-xs text-white/45">
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
        className="border-y border-white/10 bg-[#f0dfc9] text-[#241813]"
      >
        <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1180px] gap-12 py-28 md:grid-cols-2 md:items-center md:gap-24">
          <div>
            <div className="mb-5 text-[10px] font-bold uppercase tracking-[.22em] text-[#9d5b3c]">
              02 / why campucino
            </div>
            <h2 className="text-5xl font-black uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
              A warmer
              <br />
              <span className="font-serif font-normal normal-case text-[#9d5b3c]">
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
                className="flex gap-4 border-b border-[#241813]/15 pb-6"
                key={title}
              >
                <Icon className="mt-1 shrink-0 text-[#9d5b3c]" size={22} />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#6f5548]">
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
        className="mx-auto w-[calc(100%-40px)] max-w-[1180px] py-28 text-center md:py-36"
      >
        <Gift className="mx-auto mb-6 text-[#e7a071]" size={31} />
        <div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
          03 / coming soon
        </div>
        <h2 className="mx-auto mt-5 max-w-2xl text-5xl font-black uppercase leading-[.9] tracking-[-.06em] md:text-7xl">
          Keep your cup
          <br />
          <span className="font-serif font-normal normal-case text-[#c77b4f]">
            half full.
          </span>
        </h2>
        <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-white/55">
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
      <footer className="border-t border-white/10 bg-[#160f0c]">
        <div className="mx-auto grid w-[calc(100%-40px)] max-w-[1180px] gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a
              href="#home"
              className="flex items-center gap-3 text-lg font-bold"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#c77b4f] text-[#241813]">
                <Coffee size={17} />
              </span>
              campucino
            </a>
            <p className="mt-5 max-w-xs text-xs leading-6 text-white/40">
              A warm corner for curious minds. Made with care, coffee, and
              community.
            </p>
          </div>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7a071]">
              Navigate
            </h3>
            <div className="mt-5 grid gap-3 text-xs text-white/50">
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
            <p className="mt-5 text-xs leading-6 text-white/50">
              Belajar, berbagi, dan bertumbuh bareng-bareng.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-[10px] uppercase tracking-widest text-white/25">
          © 2026 Campucino Community · brewed for growth
        </div>
      </footer>
    </main>
  );
}
