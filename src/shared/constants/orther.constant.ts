export const SortBy = {
  Price: 'price',
  CreatedAt: 'createdAt',
  Sale: 'sale'
} as const

export const OrderBy = {
  Asc: 'asc',
  Desc: 'desc'
} as const

export type SortByType = (typeof SortBy)[keyof typeof SortBy]
export type OrderByType = (typeof OrderBy)[keyof typeof OrderBy]
