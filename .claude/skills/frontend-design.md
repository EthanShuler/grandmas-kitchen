---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or UI for this project (examples include recipe cards, layout pages, dashboards, React components, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics. Always uses Mantine UI components.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Tech Stack

This project uses **Mantine UI** as the component library. All UI must be built with Mantine components:
- Use `@mantine/core` components (`Button`, `Card`, `Stack`, `Group`, `Text`, `Title`, `Badge`, `Paper`, etc.) for all layout and UI elements
- Use Mantine's style props (`c`, `bg`, `p`, `m`, `fz`, `fw`, `lh`, etc.) for inline styling
- Use `useMantineTheme()` and `useMantineColorScheme()` hooks for theme access
- Use Mantine's `createTheme()` for theme customization — never fight the Mantine theme system
- Leverage Mantine's built-in variants (`variant="filled"`, `"light"`, `"subtle"`, `"outline"`, `"transparent"`) before reaching for custom CSS
- Use `sx` prop or CSS modules for custom styles only when Mantine's style props are insufficient
- Avoid raw HTML elements (`<div>`, `<p>`, `<h1>`, etc.) when a Mantine equivalent exists (`Box`, `Text`, `Title`)

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick a clear direction — warm/nostalgic (fitting for a family recipe site), editorial/magazine, rustic/artisan, refined/minimal, etc. Consider the "grandma's kitchen" context: warmth, tradition, handmade quality.
- **Constraints**: Must use Mantine components; SSR-compatible; TypeScript throughout.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. The Mantine constraint is a feature, not a limitation — work creatively within it.

## Frontend Aesthetics Guidelines

Within Mantine's system, focus on:
- **Typography**: Use Mantine's `Title` and `Text` components but customize font families via the theme (`headings.fontFamily`, `fontFamily`). Choose warm, characterful fonts (serif display fonts, humanist sans-serifs) that evoke the recipe/kitchen context. Avoid generic defaults.
- **Color & Theme**: Customize Mantine's color palette to match the aesthetic. Use `createTheme()` to define a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Consider warm earth tones, aged paper, deep greens.
- **Motion**: Use CSS transitions on Mantine components via `sx` or `style` props. Focus on high-impact moments: card hover states, page entry animations. Keep SSR in mind — avoid motion that breaks hydration.
- **Spatial Composition**: Use Mantine's spacing system creatively. Generous negative space in cards. Asymmetric layouts using `Grid` with unequal columns. Overlap effects with negative margins.
- **Backgrounds & Visual Details**: Use Mantine's `Paper` and `Card` components with custom `style` for texture-like effects (subtle gradients, borders). Use `variant="light"` backgrounds creatively. Avoid flat, solid white.

## Implementation Notes

- All components must be TypeScript — no `any`
- Follow the project's import conventions: `@/components`, `@/lib`, `@/types`
- Use `useAuth()` from `@/lib/auth-context` to conditionally render authenticated UI
- Loader data flows through React Router's `useLoaderData` — respect the data shape
- Custom CSS is acceptable but must be the last resort, not the first instinct

NEVER use generic aesthetics: predictable layouts, cookie-cutter card patterns, or designs that ignore the warm, family-oriented context of this recipe site. Every component should feel like it belongs in a lovingly designed cookbook.

Remember: the Mantine constraint is an opportunity to show mastery — beautiful design within a system, not despite it.
