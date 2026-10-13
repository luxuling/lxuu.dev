import { BadRequestError } from '@/utils/http-error';

export const readJsonBody = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new BadRequestError('Invalid JSON');
  }
};

export const getClientIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  request.headers.get('x-real-ip');

export const getCookie = (request: Request, name: string) => {
  const header = request.headers.get('cookie');
  if (!header) return null;

  const match = header.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));

  return match?.[1] ?? null;
};
