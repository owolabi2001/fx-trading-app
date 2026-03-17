import * as argon2 from 'argon2';

export const verifyPassword = (password: string, hashed_password: string) => {
  return argon2.verify(hashed_password, password);
};


export const generateRandomString = (length: number = 7) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join('');
};


export const generateToken = (length = 6) => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const rest = Array.from({ length: length - 1 }, () => Math.floor(Math.random() * 10));
  return [firstDigit, ...rest].join('');
};