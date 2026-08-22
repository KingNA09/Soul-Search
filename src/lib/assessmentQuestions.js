export const AREAS = ['mental', 'physical', 'emotional']

export const AREA_META = {
  mental: {
    label: 'Mental',
    tag: '01 / MENTAL',
    blurb: 'Focus, overthinking, and mental fatigue.',
  },
  physical: {
    label: 'Physical',
    tag: '02 / PHYSICAL',
    blurb: 'Sleep, movement, and energy.',
  },
  emotional: {
    label: 'Emotional',
    tag: '03 / EMOTIONAL',
    blurb: 'Mood and emotional regulation.',
  },
}

export const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Very often' },
]

export const QUESTIONS = {
  mental: [
    "I've felt mentally foggy or unfocused.",
    "I catch myself overthinking or replaying conversations.",
    "Small tasks have felt harder to start than usual.",
    "My mind feels crowded even when I'm not busy.",
    "I've had trouble concentrating on one thing at a time.",
  ],
  physical: [
    "I haven't been getting enough restful sleep.",
    "I've skipped moving my body (walking, stretching, exercise).",
    "My energy dips noticeably during the day.",
    "I feel physically tense or achy without explanation.",
    "My eating or hydration routine has been inconsistent.",
  ],
  emotional: [
    "My mood has felt unpredictable rather than steady.",
    "I've felt disconnected from people around me.",
    "I've had moments of sadness or low mood I couldn't shake.",
    "I've struggled to name what I'm feeling in the moment.",
    "Stress has felt overwhelming rather than manageable.",
  ],
}