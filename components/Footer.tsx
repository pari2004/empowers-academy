"use client";

import Link from "next/link";
import Image from "next/image";
import type { FooterLink } from "@/lib/content";
import { emit, scrollToId } from "@/lib/events";
import { Icon } from "./Icons";

export type FooterData = {
  contact: { phone: string; whatsapp: string; email: string; address: string };
  columns: Array<{ title: string; links: FooterLink[] }>;
  hours: string[];
  copyright: string;
  legalLinks: string[];
};

export type ContactBarData = { text: string; phone: string; whatsapp: string; cta: string };

export default function Footer({ footer, contactBar }: { footer: FooterData; contactBar: ContactBarData }) {
  return (
    <footer className="footer glass-panel" id="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div className="nav-logo footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/logo.png"
                  alt="Empowers Academy"
                  width={180}
                  height={48}
                  style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <a
                href="https://www.fortivexaitech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-provided-by"
                style={{ marginTop: "2px" }}
              >
                Powered by <span>Fortivex AI</span>
              </a>
            </div>
            <p className="footer-tagline">
              Live, mentor-led AI programs backed by a signed 180-day better-offer guarantee.
            </p>
            <div style={{ display: "flex", gap: "12px", margin: "4px 0 16px" }}>
              <a href="https://www.instagram.com/empowers_academy?utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Icon name="instagram" size={20} />
              </a>
              <a href="https://www.youtube.com/@EmpowersAcademy" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Icon name="youtube" size={20} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61577413503422" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Icon name="facebook" size={20} />
              </a>
              <a href="https://www.linkedin.com/company/empowers-academy/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Icon name="linkedin" size={20} />
              </a>
            </div>
            <div className="footer-contact">
              <a href={`tel:${footer.contact.phone.replace(/\s/g, "")}`}>
                <Icon name="phone" size={16} /> {footer.contact.phone}
              </a>
              <a
                href={`https://wa.me/${footer.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" size={16} /> WhatsApp Us
              </a>
              <a href={`mailto:${footer.contact.email}`}>
                <Icon name="mail" size={16} /> {footer.contact.email}
              </a>

              <span className="footer-address">
                <Icon name="pin" size={16} /> {footer.contact.address}
              </span>
            </div>
          </div>

          <div className="footer-cols">
            {footer.columns.map((col) => (
              <div className="footer-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {!l.href ? (
                        <span className="footer-link-static">{l.label}</span>
                      ) : l.href.startsWith("#") ? (
                        // Same-page section: smooth-scroll instead of navigating.
                        <a
                          href={l.href}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToId(l.href!.replace("#", ""));
                          }}
                        >
                          {l.label}
                        </a>
                      ) : (
                        // Real route — must be a crawlable <Link>, not a scroll handler.
                        <Link href={l.href}>{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="footer-col">
              <h4>Business Hours</h4>
              <ul>
                {footer.hours.map((h) => (
                  <li key={h} className="footer-hours">{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sticky contact bar repeated above the copyright, per brief */}
        <div className="footer-bar glass-panel">
          <p>
            <Icon name="phone" size={16} />
            {contactBar.text} Talk to us at{" "}
            <a href={`tel:${contactBar.phone.replace(/\s/g, "")}`} className="sticky-phone">
              <strong>{contactBar.phone}</strong>
            </a>{" "}
            or{" "}
            <button type="button" className="footer-bar-cta" onClick={() => emit("open-lead")}>
              {contactBar.cta}
            </button>{" "}
            or{" "}
            <a
              href={`https://wa.me/${contactBar.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-bar-cta"
            >
              WhatsApp Us
            </a>
          </p>
        </div>

        <div className="footer-bottom">
          <p>{footer.copyright}</p>
          <p className="footer-legal">
            <Link href="/180-day-guarantee" className="footer-legal-item">180 Days Job Guarantee Agreement.</Link>
            <span style={{ opacity: 0.4, margin: "0 8px" }}>|</span>
            <Link href="/terms" className="footer-legal-item">Terms and Conditions</Link>
            <span style={{ opacity: 0.4, margin: "0 8px" }}>|</span>
            <Link href="/privacy" className="footer-legal-item">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
