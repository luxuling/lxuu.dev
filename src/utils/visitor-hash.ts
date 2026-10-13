import { hmacHex } from '@/utils/hmac';
import { getClientIp } from '@/utils/request';

export const dailyViewHash = (
  slug: string,
  request: Request,
  visitorKey: string,
  secret: string,
) => {
  const ip = getClientIp(request) ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';
  const date = new Date().toISOString().slice(0, 10);

  return hmacHex(secret, `${slug}|${ip}|${userAgent}|${date}|${visitorKey}`);
};
