"use client";

import { CircularTestimonials } from "@/components/ui/circular-testimonials";

export type MentorData = {
  name: string;
  title: string;
  bio: string;
  image: string;
  specialization: string;
  techStack: string[];
  experience: string;
};

export default function Mentors({ mentors }: { mentors: MentorData[] }) {
  const mentorTestimonials = mentors.map((m) => ({
    quote: m.bio,
    name: m.name,
    designation: m.title,
    src: m.image,
    specialization: m.specialization,
    techStack: m.techStack,
    experience: m.name.toLowerCase().includes("parikshith") ? "" : (m.experience ?? ""),
  }));

  // CircularTestimonials indexes into this array unconditionally — nothing
  // to show (and nothing safe to render) when there are no featured mentors.
  if (mentorTestimonials.length === 0) return null;

  return (
    <section className="mentors" id="mentors">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Meet your mentors</span>
          <h2>Practitioners, not lecturers</h2>
          <p>You learn live from people building AI systems, each leading their domain in the cohorts.</p>
        </div>

        <div className="mentors-showcase reveal">
          <CircularTestimonials
            testimonials={mentorTestimonials}
            autoplay
            colors={{
              name: "#f5f5f7",
              designation: "rgba(245, 245, 247, 0.65)",
              testimony: "rgba(245, 245, 247, 0.85)",
              specialization: "rgba(245, 245, 247, 0.55)",
              techPillBackground: "rgba(255, 255, 255, 0.06)",
              techPillBorder: "rgba(255, 255, 255, 0.15)",
              techPillText: "#06b6d4",
              experienceBackground: "rgba(124, 58, 237, 0.15)",
              experienceText: "#c4b5fd",
              arrowBackground: "rgba(255, 255, 255, 0.06)",
              arrowForeground: "#f5f5f7",
              arrowHoverBackground: "#7c3aed",
            }}
            fontSizes={{
              name: "1.5rem",
              designation: "0.95rem",
              quote: "1rem",
            }}
          />
        </div>
      </div>
    </section>
  );
}
