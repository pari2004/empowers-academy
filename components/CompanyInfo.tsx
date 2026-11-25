import { about, auth, stats } from "@/lib/content";
import { Icon } from "./Icons";

export default function CompanyInfo() {
  return (
    <section className="company-info" id="about-company">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">{about.eyebrow}</span>
          <h2>{about.heading}</h2>
        </div>

        <div className="company-info-grid reveal">
          <div className="company-info-copy">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="company-info-chips">
              {auth.capabilities.map((c) => (
                <span className="company-chip" key={c.label}>
                  <Icon name={c.icon} size={16} />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          <div className="company-info-stats">
            {stats.map((s) => (
              <div className="stat-tile glass-panel" key={s.label}>
                <div className="stat-value gradient-text">
                  {s.value}
                  <span>{s.suffix}</span>
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
