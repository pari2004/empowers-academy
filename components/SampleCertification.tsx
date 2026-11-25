"use client";

import Image from "next/image";

export default function SampleCertification() {
  return (
    <section className="certification" id="certification" style={{ padding: "80px 0" }}>
      <div className="container">
        <div className="section-head reveal" style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="eyebrow">Sample Certification</span>
          <h2>Industry-Recognized Credential</h2>
          <p>Upon successful completion of the program, you will receive a verifiable certificate backing your skills.</p>
        </div>
        <div className="reveal" style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "800px", 
            aspectRatio: "1.333", 
            borderRadius: "12px", 
            overflow: "hidden", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)" 
          }}>
            <Image
              src="/certificates/AIML Full stack dvelopment.png"
              alt="Sample Certificate"
              fill
              sizes="(max-width: 800px) 100vw, 800px"
              style={{
                objectFit: "contain",
                pointerEvents: "none"
              }}
            />
            {/* Interaction blocker overlay to prevent scrolling/clicking in the PDF */}
            <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "transparent" }} />
            
            {/* Watermark Overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10,
              background: "rgba(0,0,0,0.05)" // slight dark tint
            }}>
              <span style={{
                color: "rgba(0, 0, 0, 0.15)",
                fontSize: "clamp(3rem, 10vw, 8rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                transform: "rotate(-35deg)",
                letterSpacing: "0.5rem",
                userSelect: "none"
              }}>
                SAMPLE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
