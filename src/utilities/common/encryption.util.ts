import { compare, genSalt, hash } from 'bcryptjs';

export const generateSalt = (): Promise<string> => {
  return genSalt().then((salt: string) => salt);
};

export const hashPassword = (input: string, salt: string): Promise<string> => {
  return hash(input, salt);
};

export const compareToHash = (
  input: string,
  hash: string,
): Promise<boolean> => {
  return compare(input, hash);
};
