export const SortBy = {
  Price: 'price',
  CreatedAt: 'createdAt',
  Sale: 'sale',
  FullName: 'fullName',
  Email: 'email',
  Name: 'name'  
} as const

export const OrderBy = {
  Asc: 'asc',
  Desc: 'desc'
} as const

export type SortByType = (typeof SortBy)[keyof typeof SortBy]
export type OrderByType = (typeof OrderBy)[keyof typeof OrderBy]

export const PREFIX_PAYMENT_CODE = 'DH'
