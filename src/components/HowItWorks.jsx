import Reveal from './Reveal'

const STEPS = [
  {
    num: '01',
    title: 'Assess',
    body: 'Complete a short psychological profile evaluation that looks at your lifestyle alongside your mental, physical, and emotional state.',
  },
  {
    num: '02',
    title: 'Focus',
    body: 'Soul Search identifies which of the three areas needs the most care right now — not a score, just a clear focus.',
  },
  {
    num: '03',
    title: 'Act',
    body: 'You get practical advice and doable recommendations aimed at that one area, with a clear path to act on it.',
  },
]

function HowItWorks() {
  return (
    <section className="how wrap" id="how">
      <Reveal className="section-head">
        <span className="section-eyebrow">The process</span>
        <h2>A short assessment. A clear answer.</h2>
        <p>You complete a brief psychological and lifestyle assessment, and Soul Search takes it from there.</p>
      </Reveal>

      <div className="how-steps">
        {STEPS.map((step, i) => (
          <Reveal key={step.num} delay={i * 90} className="step">
            <span className="step-num mono">{step.num}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks