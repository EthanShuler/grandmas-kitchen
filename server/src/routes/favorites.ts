import { Router, Request, Response } from 'express';
import { query } from '../db';
import { attachTagsToRecipes } from '../db/helpers';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET all favorited recipe IDs for the current user (used for client-side batch check)
router.get('/ids', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT recipe_id FROM favorites WHERE user_id = $1',
      [req.user!.userId]
    );
    res.json({ ids: result.rows.map(r => r.recipe_id) });
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    res.status(500).json({ error: 'Failed to fetch favorite IDs' });
  }
});

// GET user's favorite recipes (full data)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT r.*, u.username as author
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       LEFT JOIN users u ON r.created_by = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user!.userId]
    );
    await attachTagsToRecipes(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// GET check if a single recipe is favorited
router.get('/check/:recipeId', authenticate, async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.params;
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM favorites
        WHERE user_id = $1 AND recipe_id = $2
      ) as is_favorited`,
      [req.user!.userId, recipeId]
    );
    res.json({ is_favorited: result.rows[0].is_favorited });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// POST add recipe to favorites
router.post('/:recipeId', authenticate, async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.params;
    await query(
      `INSERT INTO favorites (user_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, recipe_id) DO NOTHING`,
      [req.user!.userId, recipeId]
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
    const { recipeId } = req.params;
    await query(
      'DELETE FROM favorites WHERE user_id = $1 AND recipe_id = $2',
      [req.user!.userId, recipeId]
    );
    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
