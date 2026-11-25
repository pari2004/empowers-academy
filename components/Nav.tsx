"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { scrollToId, emit } from "@/lib/events";

export type NavData = { links: Array<{ label: string; href: string }>; cta: string };

export default function Nav({ nav }: { nav: NavData }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The section links point at homepage anchors. On the homepage that's a
  // smooth scroll; on /programs/* and /resources/* it has to be a real
  // navigation back to "/#section", or the link does nothing at all.
  const handleAnchor = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    
    const isHash = href.startsWith("#") || href.startsWith("/#");
    if (!isHash) return; // real route (e.g. /about): let <Link> navigate
    
    if (!onHome) return; // let <Link> navigate to /#section
    
    e.preventDefault();
    const id = href.substring(href.indexOf("#") + 1);
    scrollToId(id);
  };

  // Only in-page anchors need rewriting to "/#section" when we're off the
  // homepage. Real paths are already absolute — prefixing one would produce
  // "//about", which browsers read as a protocol-relative host.
  const resolveHref = (href: string) => {
    if (href.startsWith("/#")) return href;
    return href.startsWith("#") && !onHome ? `/${href}` : href;
  };

  const renderLinks = (className: string) =>
    nav.links.map((l) => (
      <Link
        key={l.href}
        href={resolveHref(l.href)}
        className={className}
        onClick={(e) => handleAnchor(e, l.href)}
      >
        {l.label}
      </Link>
    ));

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="container nav-inner">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <Link
            href="/"
            className="nav-logo"
            aria-label="Empowers Academy — home"
            style={{ display: "flex", alignItems: "center" }}
            onClick={(e) => {
              setOpen(false);
              if (onHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Image
              src="/logo.png"
              alt="Empowers Academy"
              width={180}
              height={48}
              priority
              style={{ height: "48px", width: "auto", objectFit: "contain" }}
            />
          </Link>
          <a
            href="https://www.fortivexaitech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-provided-by"
          >
            Powered by <span>Fortivex AI</span>
          </a>
        </div>

        <nav className="nav-links" aria-label="Primary">
          {renderLinks("nav-link")}
        </nav>

        <div className="nav-actions">
          <button className="btn btn-glass btn-sm nav-cta" onClick={() => emit("open-lead")}>
            {nav.cta}
          </button>
          <button
            className={`nav-burger ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`nav-mobile ${open ? "show" : ""}`}>
        {renderLinks("nav-mobile-link")}
        <button className="btn btn-primary" onClick={() => emit("open-lead")}>
          {nav.cta}
        </button>
      </div>
    </header>
  );
}
