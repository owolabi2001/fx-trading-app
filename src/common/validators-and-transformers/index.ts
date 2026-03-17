/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';

export const Capitalize = () =>
  Transform(({ value }) =>
    typeof value === 'string'
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : value,
  );