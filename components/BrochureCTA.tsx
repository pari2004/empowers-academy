"use client";

import { emit } from "@/lib/events";
import { Icon } from "./Icons";

export type BrochureCTAProps = {
  brochure: { heading: string; body: string; button: string };
  whatsapp: string;
  address: string;
};

export default function BrochureCTA({ brochure, whatsapp, address }: BrochureCTAProps) {
  return (
    <section className="brochure-cta" id="brochure">
      <div className="container">
        <div className="glass-panel brochure-panel reveal">
          <div className="brochure-glow" aria-hidden="true" />
          <div className="brochure-text">
            <span className="eyebrow">Full breakdown</span>
            <h2>{brochure.heading}</h2>
            <p>{brochure.body}</p>
          </div>
          <div className="brochure-actions">
            <button className="btn btn-primary btn-lg" onClick={() => emit("open-brochure")}>
              <Icon name="download" size={20} color="#fff" /> {brochure.button}
            </button>
            <button className="btn btn-glass btn-lg" onClick={() => emit("open-lead")}>
              <Icon name="phone" size={20} /> Request a Callback
            </button>
            <a
              className="btn btn-glass btn-lg"
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={20} /> WhatsApp Us
            </a>
          </div>
        </div>

        <div className="glass-panel brochure-map reveal">
          <div className="brochure-map-head">
            <span className="eyebrow">Visit us</span>
            <h3>Find Us</h3>
            <p><Icon name="pin" size={15} /> {address}</p>
          </div>
          <div className="brochure-map-frame">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d486.10929043213036!2d77.616205!3d12.9157981!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15212d229e2f%3A0x46f56b998e638ae8!2sEmpowers%20Academy!5e0!3m2!1sen!2sin!4v1783693886194!5m2!1sen!2sin"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title="Empowers Academy location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
