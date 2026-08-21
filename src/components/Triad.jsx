import { useState } from 'react'
import Reveal from './Reveal'

const TRIAD = [
  {
    index: '01 / MENTAL',
    title: 'Mental',
    summary: 'Focus, overthinking, and mental fatigue — support built for clarity under pressure.',
    covers: ['Focus & concentration', 'Overthinking patterns', 'Academic and work pressure'],
  },
  {
    index: '02 / PHYSICAL',
    title: 'Physical',
    summary: "Sleep, movement, and energy — small, doable shifts rather than a plan you won't keep.",
    covers: ['Sleep quality', 'Daily movement', 'Energy levels'],
  },
  {
    index: '03 / EMOTIONAL',
    title: 'Emotional',
    summary: 'Mood and emotional regulation — grounded support for the heavier days.',
    covers: ['Mood tracking', 'Stress regulation', 'Emotional resilience'],
  },
]

function TriadCard({ item, delay }) {
  const [open, setOpen] = useState(false)

  return (
    <Reveal delay={delay}>
      <button
        type="button"
        className={`tcard ${open ? 'tcard-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="tcard-top">
          <span className="tcard-index mono">{item.index}</span>
          <span className="tcard-chevron" aria-hidden="true">{open ? '−' : '+'}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>

        <div className={`tcard-detail ${open ? 'tcard-detail-open' : ''}`}>
          <span className="tcard-detail-label">What this covers</span>
          <ul>
            {item.covers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </button>
    </Reveal>
  )
}

function Triad() {
  return (
    <section className="triad wrap" id="triad">
      <Reveal className="section-head">
        <span className="section-eyebrow">The triad</span>
        <h2>Three areas. One focus at a time.</h2>
        <p>Every result, resource, and recommendation is tied to exactly one of these — so you always know what you're working on. Tap a card to see what it covers.</p>
      </Reveal>

      <div className="triad-grid">
        {TRIAD.map((item, i) => (
          <TriadCard key={item.title} item={item} delay={i * 90} />
        ))}
      </div>
    </section>
  )
}

export default Triad