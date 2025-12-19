import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, adminOnly } from '../middleware/auth';
import bcrypt from 'bcrypt';

const router = Router();

// GET all users (admin only)
router.get('/', adminOnly, async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT id, username, email, avatar_url, is_admin, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET user by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, username, email, avatar_url, is_admin, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET user's recipes
router.get('/:id/recipes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT DISTINCT r.*, u.username as author
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.created_by = $1
       ORDER BY r.created_at DESC`,
      [id]
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
      
      const tagsByRecipe: Record<number, any[]> = {};
      for (const tag of tagsResult.rows) {
        if (!tagsByRecipe[tag.recipe_id]) {
          tagsByRecipe[tag.recipe_id] = [];
        }
        tagsByRecipe[tag.recipe_id].push({ id: tag.id, name: tag.name });
      }
      
      for (const recipe of result.rows) {
        recipe.tags = tagsByRecipe[recipe.id] || [];
      }
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// POST create new user (registration)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, email, password, avatar_url } = req.body;
    
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }
    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const result = await query(
      `INSERT INTO users (username, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, is_admin, created_at`,
      [username, email, password_hash, avatar_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT update user
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, avatar_url } = req.body;
    
    // Users can only update their own profile unless admin
    if (req.user?.userId !== parseInt(id) && !req.user?.isAdmin) {
      res.status(403).json({ error: 'Not authorized to update this user' });
      return;
    }
    
    const result = await query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, username, email, avatar_url, is_admin, created_at`,
      [username, email, avatar_url, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Username or email already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE user (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
