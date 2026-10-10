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
    blurb: 'Mood, connection, and emotional wellbeing.',
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
    {
      text: "I've felt mentally foggy or unfocused.",
      reverse: false,
    },
    {
      text: 'I catch myself overthinking or replaying conversations.',
      reverse: false,
    },
    {
      text: 'Small tasks have felt harder to start than usual.',
      reverse: false,
    },
    {
      text: 'My mind feels crowded even when I am not busy.',
      reverse: false,
    },
    {
      text: "I've had trouble concentrating on one thing at a time.",
      reverse: false,
    },
    {
      text: 'I have given myself enough time to properly switch off and reset.',
      reverse: true,
    },
  ],

  physical: [
    {
      text: "I haven't been getting enough restful sleep.",
      reverse: false,
    },
    {
      text: "I've skipped moving my body when I could have been active.",
      reverse: false,
    },
    {
      text: 'My energy dips noticeably during the day.',
      reverse: false,
    },
    {
      text: 'I feel physically tense or achy without an obvious reason.',
      reverse: false,
    },
    {
      text: 'My eating or hydration routine has been inconsistent.',
      reverse: false,
    },
    {
      text: 'I have made time for movement or physical activity this week.',
      reverse: true,
    },
  ],

  emotional: [
    {
      text: 'My mood has felt unpredictable rather than steady.',
      reverse: false,
    },
    {
      text: "I've felt disconnected from people around me.",
      reverse: false,
    },
    {
      text: "I've had moments of sadness or low mood that were difficult to shake.",
      reverse: false,
    },
    {
      text: "I've struggled to identify what I'm feeling in the moment.",
      reverse: false,
    },
    {
      text: 'Stress has felt overwhelming rather than manageable.',
      reverse: false,
    },
    {
      text: 'I have made time for something I genuinely enjoy this week.',
      reverse: true,
    },
  ],
}