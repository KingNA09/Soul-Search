import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  AREAS,
  AREA_META,
  QUESTIONS,
  SCALE,
} from '../lib/assessmentQuestions'
import './Assessment.css'

const STEP_INTRO = 'intro'
const STEP_RESULTS = 'results'

export default function Assessment() {
  const [step, setStep] = useState(STEP_INTRO)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const currentArea = typeof step === 'number' ? AREAS[step] : null
  const currentAnswers = currentArea ? answers[currentArea] || [] : []

  const handleAnswer = (questionIndex, value) => {
    setAnswers((prev) => {
      const areaAnswers = [...(prev[currentArea] || [])]

      areaAnswers[questionIndex] = value

      return {
        ...prev,
        [currentArea]: areaAnswers,
      }
    })
  }

  const allAnswered =
    currentArea &&
    currentAnswers.filter((value) => value !== undefined).length ===
      QUESTIONS[currentArea].length

  const calculateAreaScore = (area) => {
    const questions = QUESTIONS[area]
    const areaAnswers = answers[area] || []

    const scores = questions.map((question, index) => {
      const answer = Number(areaAnswers[index])

      if (question.reverse) {
        return 6 - answer
      }

      return answer
    })

    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

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
      scores[area] = calculateAreaScore(area)
    })

    const priorityArea = AREAS.reduce((a, b) =>
      scores[a] >= scores[b] ? a : b
    )

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You need to be logged in to save results.')
      }

      const { data: previous, error: prevError } = await supabase
        .from('assessments')
        .select(
          'mental_score, physical_score, emotional_score, created_at'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (prevError) throw prevError

      const { error: insertError } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          mental_score: scores.mental,
          physical_score: scores.physical,
          emotional_score: scores.emotional,
          priority_area: priorityArea,
          answers,
        })

      if (insertError) throw insertError

      const deltas = {}

      if (previous) {
        AREAS.forEach((area) => {
          deltas[area] =
            scores[area] - Number(previous[`${area}_score`])
        })
      }

      setResult({
        scores,
        priorityArea,
        deltas: previous ? deltas : null,
      })

      setStep(STEP_RESULTS)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (err) {
      setError(
        err.message || 'Something went wrong saving your results.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (step === STEP_INTRO) {
    return (
      <div className="assess-page">
        <div className="wrap assess-wrap">
          <span className="section-eyebrow mono">
            THE TRIAD
          </span>

          <h1>A closer look at your week.</h1>

          <p className="assess-lead">
            This check-in looks at your mental, physical, and
            emotional wellbeing over the last 7 days. There are no
            right or wrong answers. Answer honestly and use your
            results to notice patterns, not judge yourself.
          </p>

          <button
            className="btn-primary"
            onClick={() => setStep(0)}
          >
            Start assessment
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    )
  }

  if (step === STEP_RESULTS && result) {
    return (
      <div className="assess-page">
        <div className="wrap assess-wrap">
          <span className="section-eyebrow mono">
            RESULTS
          </span>

          <h1>Your wellbeing snapshot.</h1>

          <p className="assess-lead">
            {result.deltas
              ? "Here's how each area is looking compared with your last check-in."
              : "Here's how each area is looking based on your answers."}
          </p>

          <div className="triad-grid assess-results-grid">
            {AREAS.map((area) => {
              const isPriority = area === result.priorityArea

              const pct = Math.round(
                ((result.scores[area] - 1) / 4) * 100
              )

              const delta = result.deltas
                ? result.deltas[area]
                : null

              return (
                <div
                  key={area}
                  className={`tcard ${
                    isPriority ? 'tcard-open' : ''
                  }`}
                >
                  <div className="tcard-top">
                    <span className="tcard-index mono">
                      {AREA_META[area].tag}
                    </span>

                    {isPriority && (
                      <span className="focus-tag">
                        Focus area
                      </span>
                    )}
                  </div>

                  <h3>{AREA_META[area].label}</h3>

                  <p>{AREA_META[area].blurb}</p>

                  <div className="assess-score-bar">
                    <div
                      className="assess-score-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="assess-score-row">
                    <span className="assess-score-label mono">
                      {pct}% strain
                    </span>

                    {delta !== null &&
                      Math.abs(delta) >= 0.05 && (
                        <span
                          className={`assess-delta mono ${
                            delta > 0
                              ? 'assess-delta-up'
                              : 'assess-delta-down'
                          }`}
                        >
                          {delta > 0 ? '↑' : '↓'}{' '}
                          {Math.abs(delta).toFixed(1)}
                        </span>
                      )}

                    {delta !== null &&
                      Math.abs(delta) < 0.05 && (
                        <span className="assess-delta mono assess-delta-flat">
                          — steady
                        </span>
                      )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="assess-results-actions">
            <Link
              to={`/resources/${result.priorityArea}`}
              className="btn-primary assess-done"
            >
              View your resources
              <span className="btn-arrow">→</span>
            </Link>

            <Link
              to="/history"
              className="btn-ghost hist-retake"
            >
              View your history →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="assess-page">
      <div className="wrap assess-wrap">
        <span className="section-eyebrow mono">
          {AREA_META[currentArea].tag}
        </span>

        <h1>{AREA_META[currentArea].label}</h1>

        <p className="assess-lead">
          {AREA_META[currentArea].blurb}
        </p>

        <p className="assess-time mono">
          Think about the last 7 days.
        </p>

        <div className="assess-questions">
          {QUESTIONS[currentArea].map((question, qIndex) => (
            <div
              key={qIndex}
              className="assess-question"
            >
              <p className="assess-question-number mono">
                {String(qIndex + 1).padStart(2, '0')}
              </p>

              <p className="assess-question-text">
                {question.text}
              </p>

              <div className="assess-scale">
                {SCALE.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`assess-scale-btn ${
                      currentAnswers[qIndex] === option.value
                        ? 'assess-scale-btn-active'
                        : ''
                    }`}
                    onClick={() =>
                      handleAnswer(
                        qIndex,
                        option.value
                      )
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="assess-error">
            {error}
          </p>
        )}

        <button
          className="btn-primary"
          onClick={goNext}
          disabled={!allAnswered || saving}
        >
          {saving
            ? 'Saving…'
            : step === AREAS.length - 1
              ? 'See my results'
              : 'Next'}

          <span className="btn-arrow">→</span>
        </button>

        <p className="assess-step-count mono">
          Step {step + 1} of {AREAS.length}
        </p>
      </div>
    </div>
  )
}