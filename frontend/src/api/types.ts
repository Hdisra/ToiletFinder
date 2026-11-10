/** A page of results from the admin list endpoints. */
export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
