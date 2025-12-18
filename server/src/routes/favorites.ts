import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET user's favorite recipes
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const result = await query(
      `SELECT r.*, u.username as author, 
              CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as is_favorited
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       LEFT JOIN users u ON r.created_by = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    
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
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST add recipe to favorites
router.post('/:recipeId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { recipeId } = req.params;
    
    await query(
      `INSERT INTO favorites (user_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, recipe_id) DO NOTHING`,
      [userId, recipeId]
    );
    
    res.status(201).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE remove recipe from favorites
router.delete('/:recipeId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { recipeId } = req.params;
    
    await query(
      `DELETE FROM favorites
       WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId]
    );
    
    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET check if recipe is favorited
router.get('/check/:recipeId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { recipeId } = req.params;
    
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM favorites
        WHERE user_id = $1 AND recipe_id = $2
      ) as is_favorited`,
      [userId, recipeId]
    );
    
    res.json({ is_favorited: result.rows[0].is_favorited });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

export default router;
