import { config, collection, fields } from '@keystatic/core';
import { tagsField } from './src/components/tag-field';
import { contentImageOptions } from './src/utils/content-images';

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
        tags: tagsField,
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
        thumbnail: fields.image({
          label: 'Thumbnail',
          ...contentImageOptions('posts'),
        }),
        content: fields.mdx({
          label: 'Content',
          options: { image: contentImageOptions('posts') },
        }),
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
        tags: tagsField,
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
        thumbnail: fields.image({
          label: 'Thumbnail',
          ...contentImageOptions('projects'),
        }),
        logo: fields.image({
          label: 'Logo',
          ...contentImageOptions('projects'),
        }),
        links: fields.object({
          github: fields.url({ label: 'GitHub URL' }),
          live: fields.url({ label: 'Live URL' }),
        }),
        content: fields.mdx({
          label: 'Content',
          options: { image: contentImageOptions('projects') },
        }),
      },
    }),
  },
});
