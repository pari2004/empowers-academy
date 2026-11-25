export type GuaranteeStep = { title: string; body: string };

export default function Guarantee({ guarantee }: { guarantee: GuaranteeStep[] }) {
  return (
    <section className="guarantee" id="guarantee" style={{ position: "relative" }}>
      <div id="internship" style={{ position: "absolute", top: "-100px" }} />
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Guaranteed in writing</span>
          <h2>The Guarantee Procedure</h2>
          <p>
            A better offer within 180 days or a full refund, executed as a signed legal agreement before you pay anything.
          </p>
        </div>

        <div className="guarantee-grid">
          {guarantee.map((step, i) => (
            <div className={`guarantee-step glass-panel reveal ${i === 4 ? "is-refund" : ""}`} key={step.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
              <div className="guarantee-index" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <span style={{ display: 'inline-flex', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', color: 'white', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>{i + 1}</span>
              </div>
              <div className="guarantee-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '1.1rem', maxWidth: '500px' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
