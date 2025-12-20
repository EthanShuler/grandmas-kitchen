import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all recipes (with optional search)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let sql = `
      SELECT DISTINCT r.*, u.username as author
      FROM recipes r
      LEFT JOIN users u ON r.created_by = u.id
    `;
    const params: string[] = [];
    
    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      sql += `
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.id
        LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
        LEFT JOIN tags t ON rt.tag_id = t.id
        WHERE LOWER(r.title) LIKE $1
           OR LOWER(r.description) LIKE $1
           OR LOWER(COALESCE(r.source, '')) LIKE $1
           OR LOWER(i.name) LIKE $1
           OR LOWER(t.name) LIKE $1
      `;
      params.push(searchTerm);
    }
    
    sql += ` ORDER BY r.created_at DESC`;
    
    const result = await query(sql, params);
    
    // Fetch tags for all recipes
    const recipeIds = result.rows.map((r: any) => r.id);
    if (recipeIds.length > 0) {
      const tagsResult = await query(
        `SELECT rt.recipe_id, t.id, t.name
         FROM recipe_tags rt
         JOIN tags t ON rt.tag_id = t.id
         WHERE rt.recipe_id = ANY($1)`,
        [recipeIds]
      );
      
      // Group tags by recipe_id
      const tagsByRecipe: Record<number, any[]> = {};
      for (const tag of tagsResult.rows) {
        if (!tagsByRecipe[tag.recipe_id]) {
          tagsByRecipe[tag.recipe_id] = [];
        }
        tagsByRecipe[tag.recipe_id].push({ id: tag.id, name: tag.name });
      }
      
      // Attach tags to recipes
      for (const recipe of result.rows) {
        recipe.tags = tagsByRecipe[recipe.id] || [];
      }
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET recipe by ID (with ingredients, steps, and tags)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get recipe
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
    
    // Get ingredients
    const ingredientsResult = await query(
      `SELECT ri.id, ri.amount, ri.unit, ri.order_index, i.id as ingredient_id, i.name
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = $1
       ORDER BY ri.order_index`,
      [id]
    );
    
    // Get steps
    const stepsResult = await query(
      `SELECT id, instruction, order_index
       FROM steps
       WHERE recipe_id = $1
       ORDER BY order_index`,
      [id]
    );
    
    // Get tags
    const tagsResult = await query(
      `SELECT t.id, t.name
       FROM recipe_tags rt
       JOIN tags t ON rt.tag_id = t.id
       WHERE rt.recipe_id = $1`,
      [id]
    );
    
    res.json({
      ...recipe,
      ingredients: ingredientsResult.rows,
      steps: stepsResult.rows,
      tags: tagsResult.rows
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
    const created_by = req.user?.userId;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    
    // Start transaction
    await query('BEGIN');
    
    // Create recipe
    const recipeResult = await query(
      `INSERT INTO recipes (title, description, prep_time, cook_time, servings, source, created_by, notes, image_url, instructions, markdown_content)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, prep_time, cook_time, servings, source, created_by, notes, image_url, instructions, markdown_content]
    );
    
    const recipeId = recipeResult.rows[0].id;
    
    // Add ingredients
    if (ingredients && ingredients.length > 0) {
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        
        // Insert or get ingredient
        const ingredientResult = await query(
          `INSERT INTO ingredients (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [ing.name.toLowerCase().trim()]
        );
        
        const ingredientId = ingredientResult.rows[0].id;
        
        // Link to recipe
        await query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [recipeId, ingredientId, ing.amount, ing.unit, i]
        );
      }
    }
    
    // Add steps
    if (steps && steps.length > 0) {
      for (let i = 0; i < steps.length; i++) {
        await query(
          `INSERT INTO steps (recipe_id, instruction, order_index)
           VALUES ($1, $2, $3)`,
          [recipeId, steps[i].instruction || steps[i], i]
        );
      }
    }
    
    // Add tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Insert or get tag
        const tagResult = await query(
          `INSERT INTO tags (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName.toLowerCase().trim()]
        );
        
        const tagId = tagResult.rows[0].id;
        
        // Link to recipe
        await query(
          `INSERT INTO recipe_tags (recipe_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [recipeId, tagId]
        );
      }
    }
    
    await query('COMMIT');
    
    res.status(201).json(recipeResult.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// PUT update recipe
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, prep_time, cook_time, servings, source, ingredients, steps, tags, notes, image_url, instructions, markdown_content } = req.body;
    
    // Check if user owns the recipe or is admin
    const ownerCheck = await query('SELECT created_by FROM recipes WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    
    if (ownerCheck.rows[0].created_by !== req.user?.userId && !req.user?.isAdmin) {
      res.status(403).json({ error: 'Not authorized to update this recipe' });
      return;
    }
    
    await query('BEGIN');
    
    // Update recipe
    const recipeResult = await query(
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
    
    // Update ingredients if provided
    if (ingredients) {
      await query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
      
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        
        const ingredientResult = await query(
          `INSERT INTO ingredients (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [ing.name.toLowerCase().trim()]
        );
        
        await query(
          `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, ingredientResult.rows[0].id, ing.amount, ing.unit, i]
        );
      }
    }
    
    // Update steps if provided
    if (steps) {
      await query('DELETE FROM steps WHERE recipe_id = $1', [id]);
      
      for (let i = 0; i < steps.length; i++) {
        await query(
          `INSERT INTO steps (recipe_id, instruction, order_index)
           VALUES ($1, $2, $3)`,
          [id, steps[i].instruction || steps[i], i]
        );
      }
    }
    
    // Update tags if provided
    if (tags) {
      await query('DELETE FROM recipe_tags WHERE recipe_id = $1', [id]);
      
      for (const tagName of tags) {
        const tagResult = await query(
          `INSERT INTO tags (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName.toLowerCase().trim()]
        );
        
        await query(
          `INSERT INTO recipe_tags (recipe_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, tagResult.rows[0].id]
        );
      }
    }
    
    await query('COMMIT');
    
    res.json(recipeResult.rows[0]);
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// DELETE recipe
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the recipe or is admin
    const ownerCheck = await query('SELECT created_by FROM recipes WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }
    
    if (ownerCheck.rows[0].created_by !== req.user?.userId && !req.user?.isAdmin) {
      res.status(403).json({ error: 'Not authorized to delete this recipe' });
      return;
    }
    
    await query('DELETE FROM recipes WHERE id = $1', [id]);
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
