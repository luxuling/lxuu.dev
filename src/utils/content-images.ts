type ContentKind = 'posts' | 'projects';

export const contentImageOptions = (kind: ContentKind) => ({
  directory: `public/images/${kind}`,
  publicPath: `/images/${kind}/`,
});

export const toUploadFilename = (
  originalFilename: string,
  now = Date.now(),
) => {
  const dotIndex = originalFilename.lastIndexOf('.');
  const name = originalFilename.slice(0, dotIndex);
  const extension = originalFilename.slice(dotIndex + 1).toLowerCase();

  const kebabName =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'image';

  return `${kebabName}-${now.toString(36)}.${extension}`;
};

export const contentBodyImageOptions = (kind: ContentKind) => ({
  ...contentImageOptions(kind),
  transformFilename: (originalFilename: string) =>
    toUploadFilename(originalFilename),
});
