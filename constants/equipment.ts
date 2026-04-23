export const EQUIPMENT = [
  'Drum kit',
  'Bass amp',
  'Guitar amp',
  'Keyboard / Piano',
  'PA system',
  'Microphones',
  'Monitor speakers',
  'DI boxes',
  'Mixing desk',
  'Recording setup',
  'Other',
] as const

export type Equipment = (typeof EQUIPMENT)[number]
