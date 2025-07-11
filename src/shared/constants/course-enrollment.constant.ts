export const CourseEnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED'
} as const

export type CourseEnrollmentStatusType = (typeof CourseEnrollmentStatus)[keyof typeof CourseEnrollmentStatus]
