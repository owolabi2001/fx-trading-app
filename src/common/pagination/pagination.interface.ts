export interface IPagination {
  page: number;
  limit: number;
  take: number;
  skip: number;
}

export interface IPaginationResponse<T = any> {
  page: number;
  limit: number;
  total: number;
  results: T[];
}
