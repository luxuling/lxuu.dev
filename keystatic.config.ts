import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (p) => p.value,
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Posted', value: 'posted' },
          ],
          defaultValue: 'draft',
        }),
        date: fields.datetime({
          label: 'Publish Date',
          defaultValue: new Date().toISOString(),
        }),
        highlight: fields.checkbox({
          label: 'Highlight on homepage',
          defaultValue: false,
        }),
        thumbnail: fields.url({ label: 'Thumbnail URL' }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (p) => p.value,
        }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'WIP', value: 'wip' },
            { label: 'Archived', value: 'archived' },
          ],
          defaultValue: 'active',
        }),
        date: fields.datetime({
          label: 'Publish Date',
          defaultValue: new Date().toISOString(),
        }),
        highlight: fields.checkbox({
          label: 'Highlight on homepage',
          defaultValue: false,
        }),
        thumbnail: fields.url({ label: 'Thumbnail URL' }),
        links: fields.object({
          github: fields.url({ label: 'GitHub URL' }),
          live: fields.url({ label: 'Live URL' }),
        }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
});
