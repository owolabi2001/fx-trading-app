/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Transform } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const Capitalize = () =>
  Transform(({ value }) =>
    typeof value === 'string'
      ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
      : value,
  );
export const ToLowerCase = () =>
  Transform(({ value }) =>
    typeof value === 'string'
      ? value.charAt(0).toLowerCase() + value.slice(1).toLowerCase()
      : value,
  );

export const CapitalizeEachWord = () =>
  Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(' ')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ')
      : value,
  );

@ValidatorConstraint({ name: 'MinStringNumber', async: false })
export class MinStringNumber implements ValidatorConstraintInterface {
  validate(value: string) {
    return parseFloat(value) >= 5;
  }

  defaultMessage() {
    return 'price must be at least 5';
  }
}
