import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AREAS, AREA_META } from '../lib/assessmentQuestions'
import './History.css'

const AREA_COLOR = {
  mental: '#5B7CFF',
  physical: '#7CFFB2',
  emotional: '#FF8A5B',
}

export default function History() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmingId, setConfirmingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in.')

      const { data, error: fetchError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setAssessments(data || [])
    } catch (err) {
      setError(err.message || 'Could not load your history.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      const { error: deleteError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setAssessments((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message || 'Could not delete this check-in.')
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  if (loading) {
    return (
      <div className="hist-page">
        <div className="wrap hist-wrap">
          <p className="hist-loading mono">Loading your history…</p>
        </div>
      </div>
    )
  }

  if (error && assessments.length === 0) {
    return (
      <div className="hist-page">
        <div className="wrap hist-wrap">
          <p className="assess-error">{error}</p>
        </div>
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <div className="hist-page">
        <div className="wrap hist-wrap">
          <span className="section-eyebrow mono">YOUR HISTORY</span>
          <h1>No check-ins yet</h1>
          <p className="assess-lead">
            Take your first assessment to start tracking how mental, physical, and
            emotional wellbeing shift over time.
          </p>
          <Link to="/assessment" className="btn-primary">
            Take the assessment <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="hist-page">
      <div className="wrap hist-wrap">
        <span className="section-eyebrow mono">YOUR HISTORY</span>
        <h1>Progress over time</h1>
        <p className="assess-lead">
          {assessments.length} check-in{assessments.length > 1 ? 's' : ''} so far.
          Lower strain is better.
        </p>

        <TrendChart assessments={assessments} />

        <div className="hist-legend">
          {AREAS.map((area) => (
            <span key={area} className="hist-legend-item">
              <span
                className="hist-legend-dot"
                style={{ background: AREA_COLOR[area] }}
              />
              {AREA_META[area].label}
            </span>
          ))}
        </div>

        {error && <p className="assess-error">{error}</p>}

        <div className="hist-list">
          {[...assessments].reverse().map((a) => (
            <div key={a.id} className="hist-row">
              <div className="hist-row-date mono">
                {new Date(a.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="hist-row-priority">
                <span className="focus-tag">{AREA_META[a.priority_area].label}</span>
              </div>
              <div className="hist-row-scores">
                {AREAS.map((area) => (
                  <span key={area} className="hist-row-score mono">
                    {AREA_META[area].label[0]}: {Number(a[`${area}_score`]).toFixed(1)}
                  </span>
                ))}
              </div>

              <div className="hist-row-actions">
                {confirmingId === a.id ? (
                  <>
                    <span className="hist-confirm-text">Delete this check-in?</span>
                    <button
                      type="button"
                      className="hist-delete-confirm"
                      onClick={() => handleDelete(a.id)}
                      disabled={deletingId === a.id}
                    >
                      {deletingId === a.id ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button
                      type="button"
                      className="hist-delete-cancel"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="hist-delete-btn"
                    onClick={() => setConfirmingId(a.id)}
                    aria-label="Delete this check-in"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Link to="/assessment" className="btn-ghost hist-retake">
          Take a new check-in →
        </Link>
      </div>
    </div>
  )
}

function TrendChart({ assessments }) {
  const width = 600
  const height = 200
  const padding = 20

  const points = (area) =>
    assessments
      .map((a, i) => {
        const x =
          assessments.length === 1
            ? width / 2
            : padding + (i / (assessments.length - 1)) * (width - padding * 2)
        const score = Number(a[`${area}_score`])
        const y = padding + ((5 - score) / 4) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')

  return (
    <div className="hist-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[1, 2, 3, 4, 5].map((v) => {
          const y = padding + ((5 - v) / 4) * (height - padding * 2)
          return (
            <line
              key={v}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="var(--line-soft)"
              strokeWidth="1"
            />
          )
        })}
        {AREAS.map((area) => (
          <polyline
            key={area}
            points={points(area)}
            fill="none"
            stroke={AREA_COLOR[area]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  )
}