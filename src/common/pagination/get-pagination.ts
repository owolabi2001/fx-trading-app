import { IPagination } from './pagination.interface';

export const getPagination = (
  _page: number = 1,
  _limit: number = 10,
): IPagination => {
  const skip = +_page > 0 ? +(_page - 1) * _limit : 0;
  const page = +_page > 0 ? +_page : 1;

  return { skip, page, take: +_limit, limit: +_limit };
};
