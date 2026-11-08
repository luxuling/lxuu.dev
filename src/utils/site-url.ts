const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

// NOTE: localhost keeps the request origin so local links do not point at production
export const resolveSiteUrl = (requestUrl: URL) => {
  if (LOCAL_HOSTS.includes(requestUrl.hostname)) return requestUrl.origin;

  return import.meta.env.PUBLIC_SITE_URL ?? requestUrl.origin;
};
