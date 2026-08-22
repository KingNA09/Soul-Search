import { useParams, Link, Navigate } from 'react-router-dom'
import { AREAS, AREA_META } from '../lib/assessmentQuestions'
import { RESOURCES } from '../lib/resources'
import './Resources.css'

export default function Resources() {
  const { area } = useParams()

  if (!AREAS.includes(area)) {
    return <Navigate to="/" replace />
  }

  const meta = AREA_META[area]
  const content = RESOURCES[area]

  return (
    <div className="res-page">
      <div className="wrap res-wrap">
        <span className="section-eyebrow mono">{meta.tag}</span>
        <h1>{meta.label} resources</h1>
        <p className="assess-lead">{meta.blurb}</p>

        <section className="res-section">
          <h2 className="res-section-title">Quick tips</h2>
          <ul className="res-tips">
            {content.tips.map((tip, i) => (
              <li key={i} className="res-tip">
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="res-section">
          <h2 className="res-section-title">Try one of these</h2>
          <div className="res-exercises">
            {content.exercises.map((ex, i) => (
              <div key={i} className="res-exercise">
                <h3>{ex.title}</h3>
                <p>{ex.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="res-actions">
          <Link to="/assessment" className="btn-primary">
            Retake the assessment <span className="btn-arrow">→</span>
          </Link>
          <Link to="/history" className="btn-ghost">
            View your history →
          </Link>
        </div>
      </div>
    </div>
  )
}