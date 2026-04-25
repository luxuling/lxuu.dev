# Agent Rules

This project uses the following development rules:

1. Keep architecture simple and clean:
   - Separate UI, logic, and data concerns.
   - Keep modules focused and easy to maintain.
   - Avoid unnecessary abstractions and complexity.

2. Use kebab-case for all file and folder names:
   - Example: `hero-section.astro`
   - Example: `theme-toggle.tsx`

3. Use only Astro and SolidJS:
   - Astro for pages/layout structure.
   - SolidJS for interactive components.
   - Do not introduce other UI frameworks.

4. No unnecessary comments in code:
   - Do not add comments that narrate what the code does (e.g. "// Import the module", "// Define the function").
   - Only comment non-obvious intent, trade-offs, or constraints the code cannot convey on its own.
   - Never explain a change being made in a comment.

5. Project context:
   - This project is personal portfolio website for owner.
   - Keep style minimal, solid color surfaces, no decorative background patterns.
   - Prefer reusable layout and base components for consistency.
