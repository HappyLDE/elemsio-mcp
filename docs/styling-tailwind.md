# Styling with ELEMS Classes

Load this resource for visual layout or class changes. ELEMS stores the canonical class string in the
element's `attributes.class` and regenerates draft CSS through its Tailwind/JIT pipeline after class
mutations.

## Safe class workflow

Inspect `class_targets[]`, then call `elems_update_element_classes` with the exact bare `mdid`, fresh
`classes_hash`, and only the tokens to add/remove. Unrelated tokens and their order are preserved.
Page scope is the default; template scope requires the effective `template_id`. The write is
draft-only.

Use mobile-first base classes and add breakpoint variants only where the layout changes:

```text
grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3
```

Representative ELEMS authoring patterns include:

- layout: `flex flex-col gap-4 md:flex-row`, `grid`, `items-center`, `justify-between`;
- containment: `w-full max-w-6xl mx-auto px-4 sm:px-6`;
- spacing: `py-12 md:py-20`, `space-y-4`, `gap-x-8`;
- type: `text-3xl md:text-5xl font-bold leading-tight`;
- surfaces: `bg-slate-950 text-white`, `border border-slate-200 rounded-2xl`;
- gradients/states: `bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 focus:ring-2`;
- bounded arbitrary values when needed: `min-h-[22rem]`, `grid-cols-[minmax(0,1fr)_auto]`.

Responsive (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`), state (`hover:`, `focus:`), custom, Bootstrap, and
balanced arbitrary-value tokens are accepted as class tokens. Validation rejects malformed brackets,
whitespace outside arbitrary-value brackets, control/markup/quote characters, assignments, Liquid,
and executable URL-like content. Inline `style` is not a generic MCP class-edit surface.

## Rendering is the proof

Accepted syntax does not guarantee that every imagined utility or combination exists in the
effective stylesheet/runtime. After meaningful styling changes, open the draft preview and verify the
actual computed result at representative mobile and desktop widths. Check wrapping, stacking, focus
visibility, image behavior, and content-length changes.

Avoid horizontal overflow: prefer `w-full`, `max-w-*`, `min-w-0`, wrapping, responsive grids, and
bounded media. Be cautious with fixed widths, large translations, negative margins, and arbitrary
viewport calculations. Never assume a successful mutation means the intended layout rendered.
