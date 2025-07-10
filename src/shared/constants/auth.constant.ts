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

export const OTPType = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD'
} as const

export type OTPTypeType = (typeof OTPType)[keyof typeof OTPType]

export const REQUEST_USER_KEY = 'user'
export const REQUEST_ROLE_PERMISSIONS = 'role_permissions'
