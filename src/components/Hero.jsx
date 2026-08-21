function Hero() {
  return (
    <header className="wrap hero">
      <div className="hero-copy">
        <span className="eyebrow">Your monthly check-in</span>
        <h1>
          One assessment.
          <br />
          One clear focus.
        </h1>
        <p className="lead">
          Mental, physical, and emotional health rarely fall apart one at a time — but
          most of us only know how to work on one. Soul Search runs a short assessment,
          tells you which area needs you most right now, and gives you a clear path to
          act on it.
        </p>

        <div className="hero-actions">
          <a href="/assessment" className="btn-primary">
            Take the assessment
            <span className="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a href="#how" className="btn-ghost">
            See how it works
          </a>
        </div>

        <div className="hero-chips">
          <span className="chip">2 minutes</span>
          <span className="chip">Free</span>
          <span className="chip">Private by design</span>
        </div>
      </div>

      <div className="mockup" role="img" aria-label="Preview of a Soul Search results screen showing emotional wellbeing as the focus area for this month">
        <div className="mockup-bar">
          <span className="mockup-dot" />
          <span className="mockup-dot" />
          <span className="mockup-dot" />
          <span className="mockup-tab">soulsearch.app / results</span>
        </div>
        <div className="mockup-body">
          <div className="mockup-greeting">This month, your focus is</div>
          <div className="mockup-headline">Emotional wellbeing</div>

          <div className="focus-card">
            <div className="focus-card-top">
              <span className="focus-tag">Priority area</span>
            </div>
            <h4>Emotional</h4>
            <p>
              Your check-in points to stress and mood as the area needing the most
              care this month. Here's where to start.
            </p>
            <span className="focus-btn">View your resources</span>
          </div>

          <div className="muted-rows">
            <div className="muted-row">
              <span className="muted-row-label">
                <span className="muted-dot" />
                Mental
              </span>
              <span className="muted-row-val">Steady</span>
            </div>
            <div className="muted-row">
              <span className="muted-row-label">
                <span className="muted-dot" />
                Physical
              </span>
              <span className="muted-row-val">Steady</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Hero