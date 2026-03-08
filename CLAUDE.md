# Grandma's Kitchen

A website to log grandma's family recipes. Full-stack app with a React Router SSR frontend and Express API backend.

## Project Structure

NPM monorepo with two workspaces:

- `client/` — React Router 7 (SSR), Mantine UI, TipTap editor, Vite
- `server/` — Express 5, PostgreSQL via `pg`, JWT auth

**Client** (`client/app/`):
- `routes/` — Page components (file-based routing)
- `components/` — Reusable UI (Navbar, RecipeCard, RecipeForm, etc.)
- `lib/` — Utilities: `api.ts`, `auth-context.tsx`, `fractions.ts`
- `types/` — Shared TypeScript interfaces

**Server** (`server/src/`):
- `routes/` — Express route handlers (auth, recipes, ingredients, tags, favorites, users)
- `middleware/` — JWT auth middleware
- `db/index.ts` — PostgreSQL connection pool
- `db/schema.sql` — Full DB schema

API runs on port **3001**; Vite proxies `/api/*` to it during development.

## Commands

```bash
npm run dev              # Run client + server in parallel
npm run dev:client       # Client only
npm run dev:server       # Server only (tsx watch)
npm run build            # Build both workspaces
npm run typecheck        # TypeScript check across all workspaces
```

No test framework is configured.

## Features

### Public
- View all recipes
- Search recipes by ingredient, theme, or tag
- Browse recipe categories
- View detailed recipe instructions with ingredients and steps

### Authenticated
- Add and edit recipes
- Manage recipe ingredients, steps, and tags
- Favorite recipes
- User profiles

## Database

PostgreSQL. Connection via `DATABASE_URL` in `.env`. See `instructions/db-migrate.md` for migration notes.

| Table | Key Columns |
|---|---|
| `users` | id, username, email, password_hash, avatar_url, is_admin, created_at |
| `recipes` | id, title, description, prep_time, cook_time, servings, content, created_by, created_at, updated_at |
| `ingredients` | id, name, created_at |
| `recipe_ingredients` | id, recipe_id, ingredient_id, amount, unit, order_index |
| `steps` | id, recipe_id, instruction, order_index |
| `tags` | id, name |
| `recipe_tags` | recipe_id, tag_id |
| `favorites` | user_id, recipe_id |

## Auth

JWT tokens with bcrypt password hashing. Auth state lives in `client/app/lib/auth-context.tsx` via `useAuth()` hook. See `instructions/AUTH_CONTEXT_USAGE.md` for patterns.

## Coding Conventions

- Use TypeScript throughout — avoid `any`
- Use Mantine components for all UI; don't add custom CSS unless necessary
- Follow React Router 7 conventions for routing and data loading (loaders/actions)
- Use async/await for all database operations
- Use prepared statements (parameterized queries) to prevent SQL injection
- Validate user input on both client and server

## Key Config

- `client/tsconfig.json` — Path aliases `~/` and `@/` both map to `./app/*`
- `client/vite.config.ts` — Vite + React Router plugin, API proxy to :3001
- `client/react-router.config.ts` — SSR enabled
- `client/postcss.config.cjs` — PostCSS with Mantine preset
- `.env` (root) — `DATABASE_URL`, `JWT_SECRET`

## Deployment

Docker + AWS Lightsail or Render. See `instructions/` for deployment guides.

## Todo

- Admin panel — manage users, recipes, and site content
- Recipe photo upload — multiple images per recipe
- Make ingredients and steps reorderable via drag-and-drop
- Profile picture upload for users
