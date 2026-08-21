import Reveal from './Reveal'

function CTASection() {
  return (
    <section className="footer-cta wrap">
      <Reveal>
        <h2>
          Check in with yourself.
          <br />
          Start today.
        </h2>
        <p>Two minutes now could tell you exactly where to focus this month.</p>
        <a href="/assessment" className="btn-primary">
          Take the assessment
          <span className="btn-arrow" aria-hidden="true">→</span>
        </a>
      </Reveal>
    </section>
  )
}

export default CTASection