export const resolveReturnPath = (returnTo: string, origin: string) => {
  if (!URL.canParse(returnTo, origin)) return '/';

  const target = new URL(returnTo, origin);
  if (target.origin !== origin) return '/';

  return `${target.pathname}${target.search}${target.hash}`;
};
