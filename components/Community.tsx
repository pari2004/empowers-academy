import Image from "next/image";
import { Icon } from "./Icons";

export type CommunityData = { heading: string; points: string[] };

export default function Community({ community }: { community: CommunityData }) {
  return (
    <section className="community" id="community">
      <div className="container">
        <div className="glass-panel community-panel reveal">
          <div className="community-orb" aria-hidden="true" style={{ position: 'relative' }}>
            <span className="orb-ring" />
            <span className="orb-ring r2" />
            <span className="orb-core" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo_icon_glow.png"
                alt="Empowers Academy"
                width={160}
                height={160}
                sizes="160px"
                style={{ width: '55%', height: '55%', objectFit: 'contain', zIndex: 10, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))' }}
              />
            </span>
          </div>
          <div className="community-content">
            <span className="eyebrow">Community exclusive</span>
            <h2>{community.heading}</h2>
            <ul className="community-list">
              {community.points.map((p) => (
                <li key={p}>
                  <span className="community-check">
                    <Icon name="check" size={16} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
