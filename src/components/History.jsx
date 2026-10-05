import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AREAS, AREA_META } from '../lib/assessmentQuestions'
import './History.css'

const AREA_COLOR = {
  mental: '#5B7CFF',
  physical: '#7CFFB2',
  emotional: '#FF8A5B',
}

const getPercentage = (score) => {
  return Math.round(((Number(score) - 1) / 4) * 100)
}

const getTrend = (current, previous) => {
  if (previous === null || previous === undefined) {
    return {
      type: 'first',
      label: 'Starting point',
      symbol: '•',
    }
  }

  const delta = Number(current) - Number(previous)

  if (Math.abs(delta) < 0.05) {
    return {
      type: 'steady',
      label: 'Steady',
      symbol: '→',
    }
  }

  if (delta < 0) {
    return {
      type: 'improving',
      label: 'Improving',
      symbol: '↓',
    }
  }

  return {
    type: 'higher',
    label: 'Higher strain',
    symbol: '↑',
  }
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
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setAssessments((prev) => prev.filter((assessment) => assessment.id !== id))
    } catch (err) {
      setError(err.message || 'Could not delete this check-in.')
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  const latestAssessment = assessments[assessments.length - 1]
  const previousAssessment =
    assessments.length > 1 ? assessments[assessments.length - 2] : null

  const latestSummary = useMemo(() => {
    if (!latestAssessment) return []

    return AREAS.map((area) => {
      const score = Number(latestAssessment[`${area}_score`])
      const previousScore = previousAssessment
        ? Number(previousAssessment[`${area}_score`])
        : null

      return {
        area,
        score,
        percentage: getPercentage(score),
        trend: getTrend(score, previousScore),
      }
    })
  }, [latestAssessment, previousAssessment])

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

          <h1>Your first check-in</h1>

          <p className="assess-lead">
            This is where you'll see how your mental, physical, and emotional strain
            changes over time. Complete your first assessment to create your starting
            point.
          </p>

          <div className="hist-empty-note">
            <span className="hist-empty-icon">01</span>
            <div>
              <strong>Start with a quick check-in</strong>
              <p>
                Five questions across each area. It takes around two minutes.
              </p>
            </div>
          </div>

          <Link to="/assessment" className="btn-primary">
            Take your first assessment <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="hist-page">
      <div className="wrap hist-wrap">
        <span className="section-eyebrow mono">YOUR HISTORY</span>

        <h1>
          {assessments.length === 1 ? 'Your wellbeing' : 'Progress over time'}
        </h1>

        <p className="assess-lead">
          {assessments.length === 1
            ? 'This is your starting point. Complete another check-in later to see how your strain changes.'
            : `${assessments.length} check-ins so far. Lower strain is better.`}
        </p>

        {error && <p className="assess-error hist-page-error">{error}</p>}

        <section className="hist-section">
          <div className="hist-section-heading">
            <div>
              <span className="hist-section-label mono">LATEST CHECK-IN</span>
              <h2>
                {new Date(latestAssessment.created_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h2>
            </div>

            <span className="hist-checkin-count mono">
              {assessments.length} {assessments.length === 1 ? 'CHECK-IN' : 'CHECK-INS'}
            </span>
          </div>

          <div className="hist-summary-grid">
            {latestSummary.map(({ area, score, percentage, trend }) => (
              <div
                key={area}
                className={`hist-summary-card ${
                  latestAssessment.priority_area === area ? 'hist-summary-card-focus' : ''
                }`}
              >
                <div className="hist-summary-top">
                  <span
                    className="hist-area-dot"
                    style={{ background: AREA_COLOR[area] }}
                  />

                  <span className="hist-summary-tag mono">
                    {AREA_META[area].tag}
                  </span>

                  {latestAssessment.priority_area === area && (
                    <span className="focus-tag">Focus</span>
                  )}
                </div>

                <h3>{AREA_META[area].label}</h3>

                <p>{AREA_META[area].blurb}</p>

                <div className="hist-summary-score">
                  <strong>{percentage}%</strong>
                  <span className="mono">strain</span>
                </div>

                <div className="hist-summary-bar">
                  <div
                    className="hist-summary-fill"
                    style={{
                      width: `${percentage}%`,
                      background: AREA_COLOR[area],
                    }}
                  />
                </div>

                <div className={`hist-trend hist-trend-${trend.type}`}>
                  <span>{trend.symbol}</span>
                  <span>{trend.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="hist-focus-card">
          <div className="hist-focus-copy">
            <span className="hist-section-label mono">CURRENT FOCUS</span>

            <h2>
              {AREA_META[latestAssessment.priority_area].label}
            </h2>

            <p>
              {AREA_META[latestAssessment.priority_area].blurb}
            </p>

            <span className="hist-focus-explanation">
              This was your highest-strain area in your latest check-in.
            </span>
          </div>

          <Link
            to={`/resources/${latestAssessment.priority_area}`}
            className="btn-primary"
          >
            View resources <span className="btn-arrow">→</span>
          </Link>
        </section>

        <section className="hist-section">
          <div className="hist-section-heading hist-chart-heading">
            <div>
              <span className="hist-section-label mono">TREND</span>
              <h2>Strain over time</h2>
            </div>

            <span className="hist-chart-note mono">LOWER IS BETTER</span>
          </div>

          <div className="hist-chart">
            <div className="hist-chart-scale mono">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="hist-chart-main">
              <TrendChart assessments={assessments} />
            </div>
          </div>

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
        </section>

        <section className="hist-section hist-history-section">
          <div className="hist-section-heading">
            <div>
              <span className="hist-section-label mono">CHECK-INS</span>
              <h2>Previous check-ins</h2>
            </div>
          </div>

          <div className="hist-list">
            {[...assessments].reverse().map((assessment) => (
              <div key={assessment.id} className="hist-row">
                <div className="hist-row-main">
                  <div className="hist-row-date mono">
                    {new Date(assessment.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="hist-row-priority">
                    <span className="focus-tag">
                      {AREA_META[assessment.priority_area].label}
                    </span>
                  </div>

                  <div className="hist-row-scores">
                    {AREAS.map((area) => (
                      <span key={area} className="hist-row-score mono">
                        {AREA_META[area].label[0]}:{' '}
                        {getPercentage(assessment[`${area}_score`])}%
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hist-row-actions">
                  {confirmingId === assessment.id ? (
                    <div className="hist-delete-confirmation">
                      <span className="hist-confirm-text">
                        Delete this check-in permanently?
                      </span>

                      <button
                        type="button"
                        className="hist-delete-confirm"
                        onClick={() => handleDelete(assessment.id)}
                        disabled={deletingId === assessment.id}
                      >
                        {deletingId === assessment.id ? 'Deleting…' : 'Yes, delete'}
                      </button>

                      <button
                        type="button"
                        className="hist-delete-cancel"
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="hist-delete-btn"
                      onClick={() => setConfirmingId(assessment.id)}
                      aria-label={`Delete check-in from ${new Date(
                        assessment.created_at
                      ).toLocaleDateString()}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="hist-bottom-action">
          <Link to="/assessment" className="btn-ghost hist-retake">
            Take a new check-in →
          </Link>
        </div>
      </div>
    </div>
  )
}

function TrendChart({ assessments }) {
  const width = 640
  const height = 230
  const paddingLeft = 10
  const paddingRight = 10
  const paddingTop = 16
  const paddingBottom = 34

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const getX = (index) => {
    if (assessments.length === 1) {
      return width / 2
    }

    return (
      paddingLeft +
      (index / (assessments.length - 1)) * chartWidth
    )
  }

  const getY = (score) => {
    const percentage = getPercentage(score)

    return (
      paddingTop +
      ((100 - percentage) / 100) * chartHeight
    )
  }

  const getPoints = (area) => {
    return assessments
      .map((assessment, index) => {
        const x = getX(index)
        const y = getY(assessment[`${area}_score`])

        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <svg
      className="hist-trend-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Wellbeing strain trends over time"
    >
      {[0, 25, 50, 75, 100].map((percentage) => {
        const y =
          paddingTop +
          ((100 - percentage) / 100) * chartHeight

        return (
          <line
            key={percentage}
            x1={paddingLeft}
            x2={width - paddingRight}
            y1={y}
            y2={y}
            stroke="var(--line-soft)"
            strokeWidth="1"
          />
        )
      })}

      {AREAS.map((area) => (
        <g key={area}>
          <polyline
            points={getPoints(area)}
            fill="none"
            stroke={AREA_COLOR[area]}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {assessments.map((assessment, index) => (
            <circle
              key={`${area}-${assessment.id}`}
              cx={getX(index)}
              cy={getY(assessment[`${area}_score`])}
              r="4"
              fill="var(--panel)"
              stroke={AREA_COLOR[area]}
              strokeWidth="2"
            />
          ))}
        </g>
      ))}

      {assessments.map((assessment, index) => {
        const x = getX(index)

        return (
          <text
            key={assessment.id}
            x={x}
            y={height - 8}
            textAnchor="middle"
            fill="var(--text-faint)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {new Date(assessment.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </text>
        )
      })}
    </svg>
  )
}