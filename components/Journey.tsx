export type JourneyStep = { title: string; body: string };

export default function Journey({ journey }: { journey: JourneyStep[] }) {
  return (
    <section className="journey" id="journey">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">The path</span>
          <h2>Your Journey with Empowers Academy</h2>
          <p>A guided path from enrollment to a better offer, with a mentor beside you at every step.</p>
        </div>

        <ol className="journey-line">
          {journey.map((step, i) => (
            <li className="journey-step reveal" key={step.title}>
              <div className="journey-node">
                <span className="journey-num">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="journey-card glass-panel">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
