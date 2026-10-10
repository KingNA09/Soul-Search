
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

const getPercentage = (score) => {
  const numericScore = Number(score)

  if (!Number.isFinite(numericScore)) return 0

  return Math.max(
    0,
    Math.min(100, Math.round(((numericScore - 1) / 4) * 100))
  )
}

const getStrainSummary = (percentage) => {
  if (percentage <= 25) {
    return {
      title: 'Lower reported strain',
      description:
        'Your answers suggest this area has felt relatively manageable this week. Consider what has helped you maintain that balance.',
    }
  }

  if (percentage <= 50) {
    return {
      title: 'Some strain',
      description:
        'Your answers suggest there may be some pressure in this area. Notice what has been taking your energy and what helps you recover.',
    }
  }

  if (percentage <= 75) {
    return {
      title: 'Elevated strain',
      description:
        'Your answers suggest this area has felt more demanding. Consider one source of pressure and one realistic way to ease it.',
    }
  }

  return {
    title: 'High reported strain',
    description:
      'Your answers suggest this area has felt particularly demanding. Consider reaching out to someone you trust and choosing one manageable next step.',
  }
}

const FOCUS_GUIDANCE = {
  mental: {
    title: 'Give your mind some space',
    action:
      'Take five minutes away from distractions. Write down what is on your mind and identify one thing you can address today.',
  },
  physical: {
    title: 'Make room for recovery',
    action:
      'Check in with your basic needs. Consider whether rest, regular meals, gentle movement or a consistent sleep routine could help.',
  },
  emotional: {
    title: 'Check in with your feelings',
    action:
      'Take a moment to name what you are feeling. Consider talking with someone you trust or making space for an activity that helps you feel supported.',
  },
}

const getScoredAnswer = (question, answer) => {
  if (answer === undefined || answer === null) return null

  const numericAnswer = Number(answer)

  if (!Number.isFinite(numericAnswer)) return null

  return question.reverse ? 6 - numericAnswer : numericAnswer
}

export default function Assessment() {
  const [step, setStep] = useState(STEP_INTRO)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const currentArea =
    typeof step === 'number' ? AREAS[step] : null

  const currentAnswers = currentArea
    ? answers[currentArea] || []
    : []

  const allAnswered =
    currentArea !== null &&
    currentArea !== undefined &&
    QUESTIONS[currentArea].every(
      (_, index) => currentAnswers[index] !== undefined
    )

  const handleAnswer = (questionIndex, value) => {
    setAnswers((previous) => {
      const areaAnswers = [...(previous[currentArea] || [])]

      areaAnswers[questionIndex] = value

      return {
        ...previous,
        [currentArea]: areaAnswers,
      }
    })
  }

  const calculateAreaScore = (area) => {
    const questions = QUESTIONS[area]
    const areaAnswers = answers[area] || []

    if (!questions.length) return 1

    const scores = questions.map((question, index) => {
      const score = getScoredAnswer(question, areaAnswers[index])
      return score ?? 1
    })

    return (
      scores.reduce((sum, score) => sum + score, 0) /
      scores.length
    )
  }

  const finishAndSave = async () => {
    setSaving(true)
    setError('')

    try {
      const scores = {}

      AREAS.forEach((area) => {
        scores[area] = calculateAreaScore(area)
      })

      const priorityArea = AREAS.reduce((areaA, areaB) =>
        scores[areaA] >= scores[areaB] ? areaA : areaB
      )

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      if (!user) {
        throw new Error(
          'You need to be logged in to save results.'
        )
      }

      const { data: previous, error: previousError } =
        await supabase
          .from('assessments')
          .select(
            'mental_score, physical_score, emotional_score, created_at'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

      if (previousError) throw previousError

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
        answers: { ...answers },
      })

      setStep(STEP_RESULTS)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong saving your results.'
      )
    } finally {
      setSaving(false)
    }
  }

  const goNext = async () => {
    if (
      typeof step !== 'number' ||
      !allAnswered ||
      saving
    ) {
      return
    }

    if (step < AREAS.length - 1) {
      setStep(step + 1)
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
      return
    }

    await finishAndSave()
  }

  const startAgain = () => {
    setAnswers({})
    setResult(null)
    setError('')
    setStep(STEP_INTRO)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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
            This check-in looks at your mental, physical and
            emotional wellbeing over the last 7 days. There
            are no right or wrong answers. Answer honestly
            and use your results to notice patterns, not
            judge yourself.
          </p>

          {error && (
            <p className="assess-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setError('')
              setStep(0)
            }}
          >
            Start assessment
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    )
  }

  if (step === STEP_RESULTS && result) {
    const focusGuidance =
      FOCUS_GUIDANCE[result.priorityArea] ||
      FOCUS_GUIDANCE.mental

    return (
      <div className="assess-page">
        <div className="wrap assess-wrap">
          <span className="section-eyebrow mono">
            RESULTS
          </span>

          <h1>Your wellbeing snapshot.</h1>

          <p className="assess-lead">
            {result.deltas
              ? 'Compare this check-in with your previous one and notice what may have changed.'
              : 'Use this first check-in as a starting point for understanding how your week has felt.'}
          </p>

          <p className="assess-results-disclaimer">
            These scores reflect your answers, not a diagnosis.
            Use them as a prompt for reflection rather than a
            judgement about your wellbeing.
          </p>

          {/* SCORE CARDS */}
          <div className="triad-grid assess-results-grid">
            {AREAS.map((area) => {
              const isPriority =
                area === result.priorityArea

              const percentage = getPercentage(
                result.scores[area]
              )

              const summary = getStrainSummary(percentage)

              const delta = result.deltas
                ? result.deltas[area]
                : null

              return (
                <article
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

                  <div className="assess-score-row">
                    <span className="assess-score-label mono">
                      {percentage}% strain
                    </span>
                  </div>

                  <div
                    className="assess-score-bar"
                    role="progressbar"
                    aria-label={`${AREA_META[area].label} reported strain`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percentage}
                  >
                    <div
                      className="assess-score-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <h4 className="assess-summary-title">
                    {summary.title}
                  </h4>

                  <p>{summary.description}</p>

                  {delta !== null && (
                    <p
                      className={`assess-change assess-change-${
                        Math.abs(delta) < 0.05
                          ? 'steady'
                          : delta < 0
                            ? 'lower'
                            : 'higher'
                      }`}
                    >
                      {Math.abs(delta) < 0.05
                        ? 'Your average score is broadly unchanged.'
                        : delta < 0
                          ? `Your average score decreased by ${Math.abs(
                              delta
                            ).toFixed(
                              1
                            )} points, indicating lower reported strain.`
                          : `Your average score increased by ${delta.toFixed(
                              1
                            )} points, indicating higher reported strain.`}
                    </p>
                  )}
                </article>
              )
            })}
          </div>

          {/* YOUR ANSWERS */}
          <section className="assess-answers-section">
            <span className="section-eyebrow mono">
              YOUR ANSWERS
            </span>

            <h2>What shaped your results?</h2>

            <p className="assess-lead">
              Review the answers behind each score. Use them
              to notice patterns in your week and identify
              areas where a little extra support may help.
            </p>

            {AREAS.map((area) => {
              const percentage = getPercentage(
                result.scores[area]
              )

              const summary = getStrainSummary(percentage)
              const questions = QUESTIONS[area]
              const areaAnswers = result.answers?.[area] || []

              const isPriority =
                area === result.priorityArea

              const isElevated =
                percentage > 50 && percentage <= 75

              const isHigh = percentage > 75
              const needsAttention = isElevated || isHigh

              return (
                <details
                  key={area}
                  className={`assess-answer-group ${
                    needsAttention
                      ? 'assess-answer-group-attention'
                      : ''
                  }`}
                  open={isPriority}
                >
                  <summary className="assess-answer-heading">
                    <div>
                      <span className="assess-answer-area mono">
                        {AREA_META[area].tag}
                      </span>

                      <h3>{AREA_META[area].label}</h3>

                      <span className="assess-answer-status">
                        {summary.title} · {percentage}%
                      </span>
                    </div>

                    <span
                      className="assess-answer-toggle"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>

                  {needsAttention && (
                    <div className="assess-answer-guidance">
                      <strong>
                        {isHigh
                          ? 'Take things one step at a time'
                          : 'An area worth reflecting on'}
                      </strong>

                      <p>
                        {isHigh
                          ? 'Your answers suggest this area has felt particularly demanding. You do not need to solve everything today. Consider which experience has affected you most and whether someone you trust could offer support.'
                          : 'Your answers suggest this area has felt more demanding. Look at the responses below and consider one realistic change that could make your week more manageable.'}
                      </p>
                    </div>
                  )}

                  <div className="assess-answer-list">
                    {questions.map((question, index) => {
                      const answer = areaAnswers[index]

                      const selectedOption = SCALE.find(
                        (option) =>
                          Number(option.value) === Number(answer)
                      )

                      const scoredAnswer = getScoredAnswer(
                        question,
                        answer
                      )

                      const isHigherStrain =
                        scoredAnswer !== null &&
                        scoredAnswer >= 4

                      return (
                        <div
                          key={`${area}-${index}`}
                          className="assess-answer-item"
                        >
                          <span className="assess-answer-number mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          <div className="assess-answer-content">
                            <p className="assess-answer-question">
                              {question.text}
                            </p>

                            <span className="assess-answer-selected">
                              Your answer:{' '}
                              {selectedOption?.label ??
                                'Not answered'}
                            </span>

                            {needsAttention && isHigherStrain && (
                              <p className="assess-answer-note">
                                This answer contributed to your
                                higher strain score. Consider what
                                was happening for you this week.
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </section>

          {/* RECOMMENDED NEXT STEP */}
          <section className="hist-focus-card">
            <div className="hist-focus-copy">
              <span className="hist-section-label mono">
                YOUR NEXT STEP
              </span>

              <h2>{focusGuidance.title}</h2>

              <p>{focusGuidance.action}</p>

              <span className="hist-focus-explanation">
                {AREA_META[result.priorityArea].label} had the
                highest reported strain score in this check-in.
                This is a starting point for reflection, not a
                judgement.
              </span>
            </div>

            <Link
              to={`/resources/${result.priorityArea}`}
              className="btn-primary assess-done"
            >
              Explore resources
              <span className="btn-arrow">→</span>
            </Link>
          </section>

          {/* RESULTS ACTIONS */}
          <div className="assess-results-actions">
            <Link
              to="/history"
              className="btn-ghost hist-retake"
            >
              View your history →
            </Link>

            <button
              type="button"
              className="btn-ghost hist-retake"
              onClick={startAgain}
            >
              Start another check-in →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ASSESSMENT QUESTIONS
  if (typeof step !== 'number' || !currentArea) {
    return null
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

        <div
          className="assess-progress"
          role="progressbar"
          aria-label="Assessment progress"
          aria-valuemin={1}
          aria-valuemax={AREAS.length}
          aria-valuenow={step + 1}
        >
          <div
            className="assess-progress-fill"
            style={{
              width: `${((step + 1) / AREAS.length) * 100}%`,
            }}
          />
        </div>

        <div className="assess-questions">
          {QUESTIONS[currentArea].map(
            (question, questionIndex) => (
              <div
                key={questionIndex}
                className="assess-question"
              >
                <p className="assess-question-number mono">
                  {String(questionIndex + 1).padStart(2, '0')}
                </p>

                <p className="assess-question-text">
                  {question.text}
                </p>

                <div className="assess-scale">
                  {SCALE.map((option) => {
                    const selected =
                      currentAnswers[questionIndex] ===
                      option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`assess-scale-btn ${
                          selected
                            ? 'assess-scale-btn-active'
                            : ''
                        }`}
                        aria-pressed={selected}
                        onClick={() =>
                          handleAnswer(
                            questionIndex,
                            option.value
                          )
                        }
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {error && (
          <p className="assess-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
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