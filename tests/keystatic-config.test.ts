import { describe, expect, it } from 'vitest';
import config from '../keystatic.config';

const collections = ['posts', 'projects'] as const;

describe('keystatic publish date', () => {
  it.each(collections)(
    'serializes a new %s date that YAML can write',
    (name) => {
      const field = config.collections[name].schema.date;
      const initial = field.defaultValue();
      const stored = field.serialize(initial).value;

      expect(initial).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

      if (!(stored instanceof Date)) throw new Error('expected a Date');

      expect(stored.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    },
  );
});
