import { config, collection, fields, singleton } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';
import { tagsField } from './src/components/tag-field';
import {
  contentBodyImageOptions,
  contentImageOptions,
} from './src/utils/content-images';

const sizedImage = (kind: 'posts' | 'projects') =>
  block({
    label: 'Image',
    schema: {
      src: fields.image({
        label: 'Image',
        validation: { isRequired: true },
        ...contentBodyImageOptions(kind),
      }),
      alt: fields.text({ label: 'Alt text' }),
      size: fields.select({
        label: 'Size',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Full width', value: 'full' },
        ],
        defaultValue: 'full',
      }),
    },
  });

const publishDate = fields.datetime({
  label: 'Publish Date',
  defaultValue: { kind: 'now' },
});

export default config({
  storage: { kind: 'local' },
  singletons: {
    nowBuilding: singleton({
      label: 'Now Building',
      path: 'src/data/now-building',
      format: { data: 'json' },
      schema: {
        projects: fields.array(
          fields.relationship({ label: 'Project', collection: 'projects' }),
          {
            label: 'Projects',
            itemLabel: (props) => props.value ?? 'Select a project',
          },
        ),
      },
    }),
  },
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
        date: publishDate,
        highlight: fields.checkbox({
          label: 'Highlight on homepage',
          defaultValue: false,
        }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower shows first. Leave empty to sort by date.',
        }),
        thumbnail: fields.image({
          label: 'Thumbnail',
          ...contentImageOptions('posts'),
        }),
        content: fields.mdx({
          label: 'Content',
          options: { image: contentBodyImageOptions('posts') },
          components: { Image: sizedImage('posts') },
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
        date: publishDate,
        highlight: fields.checkbox({
          label: 'Highlight on homepage',
          defaultValue: false,
        }),
        order: fields.integer({
          label: 'Sort order',
          description: 'Lower shows first. Leave empty to sort by date.',
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
          options: { image: contentBodyImageOptions('projects') },
          components: { Image: sizedImage('projects') },
        }),
      },
    }),
  },
});
