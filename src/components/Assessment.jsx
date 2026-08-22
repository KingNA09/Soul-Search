import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { AREAS, AREA_META, QUESTIONS, SCALE } from '../lib/assessmentQuestions'
import './Assessment.css'

const STEP_INTRO = 'intro'
const STEP_RESULTS = 'results'

export default function Assessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEP_INTRO) // 'intro' | 0 | 1 | 2 (area index) | 'results'
  const [answers, setAnswers] = useState({}) // { mental: [..], physical: [..], emotional: [..] }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const currentArea = typeof step === 'number' ? AREAS[step] : null
  const currentAnswers = currentArea ? answers[currentArea] || [] : []

  const handleAnswer = (questionIndex, value) => {
    setAnswers((prev) => {
      const areaAnswers = [...(prev[currentArea] || [])]
      areaAnswers[questionIndex] = value
      return { ...prev, [currentArea]: areaAnswers }
    })
  }

  const allAnswered =
    currentArea && currentAnswers.filter((v) => v !== undefined).length === QUESTIONS[currentArea].length

  const goNext = async () => {
    if (typeof step === 'number' && step < AREAS.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (step === AREAS.length - 1) {
      await finishAndSave()
    }
  }

  const finishAndSave = async () => {
    setSaving(true)
    setError('')

    const scores = {}
    AREAS.forEach((area) => {
      const vals = answers[area] || []
      scores[area] = vals.reduce((sum, v) => sum + v, 0) / vals.length
    })

    const priorityArea = AREAS.reduce((a, b) => (scores[a] >= scores[b] ? a : b))

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You need to be logged in to save results.')

      const { error: insertError } = await supabase.from('assessments').insert({
        user_id: user.id,
        mental_score: scores.mental,
        physical_score: scores.physical,
        emotional_score: scores.emotional,
        priority_area: priorityArea,
        answers,
      })
      if (insertError) throw insertError

      setResult({ scores, priorityArea })
      setStep(STEP_RESULTS)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Something went wrong saving your results.')
    } finally {
      setSaving(false)
    }
  }

  if (step === STEP_INTRO) {
    return (
      <div className="assess-page">
        <div className="wrap assess-wrap">
          <span className="section-eyebrow mono">THE TRIAD</span>
          <h1>One assessment. Three answers.</h1>
          <p className="assess-lead">
            You'll go through five quick questions for each of Mental, Physical, and
            Emotional wellbeing — about 2 minutes total. At the end, we'll tell you
            which area needs your focus most right now.
          </p>
          <button className="btn-primary" onClick={() => setStep(0)}>
            Start assessment <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    )
  }

  if (step === STEP_RESULTS && result) {
    return (
      <div className="assess-page">
        <div className="wrap assess-wrap">
          <span className="section-eyebrow mono">RESULTS</span>
          <h1>Your focus area right now</h1>
          <p className="assess-lead">
            Based on your answers, here's how each area is looking.
          </p>

          <div className="triad-grid assess-results-grid">
            {AREAS.map((area) => {
              const isPriority = area === result.priorityArea
              const pct = Math.round((result.scores[area] / 5) * 100)
              return (
                <div key={area} className={`tcard ${isPriority ? 'tcard-open' : ''}`}>
                  <div className="tcard-top">
                    <span className="tcard-index mono">{AREA_META[area].tag}</span>
                    {isPriority && <span className="focus-tag">Priority</span>}
                  </div>
                  <h3>{AREA_META[area].label}</h3>
                  <p>{AREA_META[area].blurb}</p>
                  <div className="assess-score-bar">
                    <div
                      className="assess-score-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="assess-score-label mono">{pct}% strain</span>
                </div>
              )
            })}
          </div>

          <div className="assess-results-actions">
            <button className="btn-primary assess-done" onClick={() => navigate('/')}>
              Back to home <span className="btn-arrow">→</span>
            </button>
            <Link to="/history" className="btn-ghost hist-retake">
              View your history →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Question step for current area
  return (
    <div className="assess-page">
      <div className="wrap assess-wrap">
        <span className="section-eyebrow mono">{AREA_META[currentArea].tag}</span>
        <h1>{AREA_META[currentArea].label}</h1>
        <p className="assess-lead">{AREA_META[currentArea].blurb}</p>

        <div className="assess-questions">
          {QUESTIONS[currentArea].map((question, qIndex) => (
            <div key={qIndex} className="assess-question">
              <p className="assess-question-text">{question}</p>
              <div className="assess-scale">
                {SCALE.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`assess-scale-btn ${
                      currentAnswers[qIndex] === opt.value ? 'assess-scale-btn-active' : ''
                    }`}
                    onClick={() => handleAnswer(qIndex, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="assess-error">{error}</p>}

        <button
          className="btn-primary"
          onClick={goNext}
          disabled={!allAnswered || saving}
        >
          {saving
            ? 'Saving…'
            : step === AREAS.length - 1
            ? 'See my results'
            : 'Next'}{' '}
          <span className="btn-arrow">→</span>
        </button>

        <p className="assess-step-count mono">
          Step {step + 1} of {AREAS.length}
        </p>
      </div>
    </div>
  )
}