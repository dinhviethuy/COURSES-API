export const AuthType = {
  Session: 'session',
  PaymentAPIKey: 'paymentAPIKey',
  None: 'none'
} as const

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  Or: 'or',
  And: 'and'
} as const

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]
