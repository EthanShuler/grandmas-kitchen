import { query as poolQuery } from './index';

type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

interface RecipeRow {
  id: number;
  tags?: { id: number; name: string }[];
  [key: string]: unknown;
}

interface IngredientInput {
  name: string;
  amount?: number | null;
  unit?: string | null;
}

/**
 * Fetches tags for a list of recipes and attaches them in-place.
 * Replaces the copy-pasted tag-attachment block that existed in recipes, users, and favorites routes.
 */
export async function attachTagsToRecipes(rows: RecipeRow[], queryFn: QueryFn = poolQuery): Promise<void> {
  const recipeIds = rows.map(r => r.id);
  if (recipeIds.length === 0) return;

  const tagsResult = await queryFn(
    `SELECT rt.recipe_id, t.id, t.name
     FROM recipe_tags rt
     JOIN tags t ON rt.tag_id = t.id
     WHERE rt.recipe_id = ANY($1)`,
    [recipeIds]
  );

  const tagsByRecipe: Record<number, { id: number; name: string }[]> = {};
  for (const tag of tagsResult.rows) {
    if (!tagsByRecipe[tag.recipe_id]) {
      tagsByRecipe[tag.recipe_id] = [];
    }
    tagsByRecipe[tag.recipe_id].push({ id: tag.id, name: tag.name });
  }

  for (const recipe of rows) {
    recipe.tags = tagsByRecipe[recipe.id] || [];
  }
}

/**
 * Upserts ingredients and links them to a recipe.
 * Must be called within a transaction (pass client.query.bind(client) as queryFn).
 */
export async function upsertIngredients(
  recipeId: number,
  ingredients: IngredientInput[],
  queryFn: QueryFn
): Promise<void> {
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    const ingredientResult = await queryFn(
      `INSERT INTO ingredients (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [ing.name.toLowerCase().trim()]
    );
    await queryFn(
      `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, order_index)
       VALUES ($1, $2, $3, $4, $5)`,
      [recipeId, ingredientResult.rows[0].id, ing.amount ?? null, ing.unit ?? null, i]
    );
  }
}

/**
 * Inserts steps for a recipe.
 * Must be called within a transaction.
 */
export async function upsertSteps(
  recipeId: number,
  steps: string[],
  queryFn: QueryFn
): Promise<void> {
  for (let i = 0; i < steps.length; i++) {
    await queryFn(
      `INSERT INTO steps (recipe_id, instruction, order_index) VALUES ($1, $2, $3)`,
      [recipeId, steps[i], i]
    );
  }
}

/**
 * Upserts tags and links them to a recipe.
 * Must be called within a transaction.
 */
export async function upsertTags(
  recipeId: number,
  tags: string[],
  queryFn: QueryFn
): Promise<void> {
  for (const tagName of tags) {
    const tagResult = await queryFn(
      `INSERT INTO tags (name)
       VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tagName.toLowerCase().trim()]
    );
    await queryFn(
      `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [recipeId, tagResult.rows[0].id]
    );
  }
}

/**
 * Checks that the requesting user owns a recipe (or is admin).
 * Returns { notFound, forbidden } flags so the caller can respond appropriately.
 */
export async function checkRecipeOwnership(
  recipeId: string | number,
  userId: number,
  isAdmin: boolean,
  queryFn: QueryFn = poolQuery
): Promise<{ notFound: boolean; forbidden: boolean }> {
  const result = await queryFn('SELECT created_by FROM recipes WHERE id = $1', [recipeId]);
  if (result.rows.length === 0) return { notFound: true, forbidden: false };
  if (result.rows[0].created_by !== userId && !isAdmin) return { notFound: false, forbidden: true };
  return { notFound: false, forbidden: false };
}
