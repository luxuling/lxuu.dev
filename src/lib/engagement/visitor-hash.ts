function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    ''
  );
}

export async function hmacHex(secret: string, raw: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function dailyViewHash(
  slug: string,
  req: Request,
  visitorKey: string,
  secret: string,
): Promise<string> {
  const ip = clientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  const date = new Date().toISOString().slice(0, 10);
  return hmacHex(secret, `${slug}|${ip}|${ua}|${date}|${visitorKey}`);
}

export async function stableLikeHash(
  slug: string,
  req: Request,
  visitorKey: string,
  secret: string,
): Promise<string> {
  if (visitorKey) {
    return hmacHex(secret, `project:${slug}|${visitorKey}`);
  }
  const ip = clientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  return hmacHex(secret, `project:${slug}|${ip}|${ua}`);
}

export async function readVisitorKey(request: Request): Promise<string> {
  try {
    const body = await request.clone().json();
    if (typeof body?.visitor_key === 'string') return body.visitor_key.trim();
  } catch {
    /* body is optional */
  }
  return '';
}
