import Reveal from './Reveal'

const FEATURES = [
  {
    icon: '◐',
    title: 'Real-time tracking',
    body: 'Log mood, sleep, and activity as they happen, and see your data update as you go.',
  },
  {
    icon: '◇',
    title: 'Personalised insight',
    body: 'Feedback built from your own patterns, not a generic wellness tip of the day.',
  },
  {
    icon: '▤',
    title: 'Resource library',
    body: 'Workouts, articles, and videos matched to whichever area needs your attention.',
  },
  {
    icon: '◈',
    title: 'Private by design',
    body: 'Your check-ins stay yours — strong data protection, with control always in your hands.',
  },
]

function Features() {
  return (
    <section className="features wrap" id="features">
      <Reveal className="section-head">
        <span className="section-eyebrow">What you get</span>
        <h2>Built around how you actually check in on yourself.</h2>
      </Reveal>

      <div className="feat-grid">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 80} className="feat-card">
            <div className="feat-icon" aria-hidden="true">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Features