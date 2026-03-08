import { Router, Request, Response } from 'express';
import { query } from '../db';
import { attachTagsToRecipes } from '../db/helpers';
import { authenticate, adminOnly } from '../middleware/auth';

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

// GET user by ID (authenticated)
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

// GET user by username (public — email excluded)
router.get('/username/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const result = await query(
      'SELECT id, username, avatar_url, is_admin, created_at FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET user's recipes (public)
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
    await attachTagsToRecipes(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ error: 'Failed to fetch user recipes' });
  }
});

// PUT update user (self or admin)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, avatar_url } = req.body;

    if (req.user!.userId !== parseInt(id) && !req.user!.isAdmin) {
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
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
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
