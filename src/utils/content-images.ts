export const contentImageOptions = (kind: 'posts' | 'projects') => ({
  directory: `public/images/${kind}`,
  publicPath: `/images/${kind}/`,
});
