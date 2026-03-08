import { Router, Request, Response } from 'express';
import { query, withTransaction } from '../db';
import { attachTagsToRecipes, upsertIngredients, upsertSteps, upsertTags, checkRecipeOwnership } from '../db/helpers';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all recipes (with optional search and tag filtering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, tags: tagParam } = req.query;
    const selectedTags =
      tagParam && typeof tagParam === 'string' && tagParam.trim()
        ? tagParam.split(',').map(t => t.trim().toLowerCase())
        : [];

    let sql = `
      SELECT DISTINCT r.*, u.username as author
      FROM recipes r
      LEFT JOIN users u ON r.created_by = u.id
    `;
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      params.push(searchTerm);
      sql += `
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.id
        LEFT JOIN recipe_tags rt_s ON r.id = rt_s.recipe_id
        LEFT JOIN tags t_s ON rt_s.tag_id = t_s.id
      `;
      conditions.push(`(
        LOWER(r.title) LIKE $${params.length}
        OR LOWER(r.description) LIKE $${params.length}
        OR LOWER(COALESCE(r.source, '')) LIKE $${params.length}
        OR LOWER(i.name) LIKE $${params.length}
        OR LOWER(t_s.name) LIKE $${params.length}
      )`);
    }

    if (selectedTags.length > 0) {
      params.push(selectedTags);
      conditions.push(`r.id IN (
        SELECT rt.recipe_id FROM recipe_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE LOWER(t.name) = ANY($${params.length})
      )`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    await attachTagsToRecipes(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET recipe by ID (with ingredients, steps, and tags)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid recipe ID' });
      return;
    }

    const recipeResult = await query(
      `SELECT r.*, u.username as author
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (recipeResult.rows.length === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    const recipe = recipeResult.rows[0];

    const [ingredientsResult, stepsResult, tagsResult] = await Promise.all([
      query(
        `SELECT ri.id, ri.amount, ri.unit, ri.order_index, i.id as ingredient_id, i.name
         FROM recipe_ingredients ri
         JOIN ingredients i ON ri.ingredient_id = i.id
         WHERE ri.recipe_id = $1
         ORDER BY ri.order_index`,
        [id]
      ),
      query(
        `SELECT id, instruction, order_index
         FROM steps
         WHERE recipe_id = $1
         ORDER BY order_index`,
        [id]
      ),
      query(
        `SELECT t.id, t.name
         FROM recipe_tags rt
         JOIN tags t ON rt.tag_id = t.id
         WHERE rt.recipe_id = $1`,
        [id]
      ),
    ]);

    res.json({
      ...recipe,
      ingredients: ingredientsResult.rows,
      steps: stepsResult.rows,
      tags: tagsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST create new recipe
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, description, prep_time, cook_time, servings, source, ingredients, steps, tags, notes, image_url, instructions, markdown_content } = req.body;
    const created_by = req.user!.userId;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const recipe = await withTransaction(async (client) => {
      const qfn = (text: string, params?: unknown[]) => client.query(text, params);

      const recipeResult = await qfn(
        `INSERT INTO recipes (title, description, prep_time, cook_time, servings, source, created_by, notes, image_url, instructions, markdown_content)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [title, description, prep_time, cook_time, servings, source, created_by, notes, image_url, instructions, markdown_content]
      );

      const recipeId = recipeResult.rows[0].id;
      if (ingredients?.length) await upsertIngredients(recipeId, ingredients, qfn);
      if (steps?.length) await upsertSteps(recipeId, steps, qfn);
      if (tags?.length) await upsertTags(recipeId, tags, qfn);

      return recipeResult.rows[0];
    });

    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// PUT update recipe
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid recipe ID' });
      return;
    }

    const { notFound, forbidden } = await checkRecipeOwnership(id, req.user!.userId, req.user!.isAdmin);
    if (notFound) { res.status(404).json({ error: 'Recipe not found' }); return; }
    if (forbidden) { res.status(403).json({ error: 'Not authorized to update this recipe' }); return; }

    const { title, description, prep_time, cook_time, servings, source, ingredients, steps, tags, notes, image_url, instructions, markdown_content } = req.body;

    const recipe = await withTransaction(async (client) => {
      const qfn = (text: string, params?: unknown[]) => client.query(text, params);

      const recipeResult = await qfn(
        `UPDATE recipes
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             prep_time = COALESCE($3, prep_time),
             cook_time = COALESCE($4, cook_time),
             servings = COALESCE($5, servings),
             source = COALESCE($6, source),
             notes = COALESCE($7, notes),
             image_url = COALESCE($8, image_url),
             instructions = COALESCE($9, instructions),
             markdown_content = COALESCE($10, markdown_content)
         WHERE id = $11
         RETURNING *`,
        [title, description, prep_time, cook_time, servings, source, notes, image_url, instructions, markdown_content, id]
      );

      if (ingredients) {
        await qfn('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
        await upsertIngredients(id, ingredients, qfn);
      }
      if (steps) {
        await qfn('DELETE FROM steps WHERE recipe_id = $1', [id]);
        await upsertSteps(id, steps, qfn);
      }
      if (tags) {
        await qfn('DELETE FROM recipe_tags WHERE recipe_id = $1', [id]);
        await upsertTags(id, tags, qfn);
      }

      return recipeResult.rows[0];
    });

    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// DELETE recipe
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid recipe ID' });
      return;
    }

    const { notFound, forbidden } = await checkRecipeOwnership(id, req.user!.userId, req.user!.isAdmin);
    if (notFound) { res.status(404).json({ error: 'Recipe not found' }); return; }
    if (forbidden) { res.status(403).json({ error: 'Not authorized to delete this recipe' }); return; }

    await query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
