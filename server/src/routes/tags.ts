import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// GET all tags
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM tags ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// GET tag by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM tags WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tag:', error);
    res.status(500).json({ error: 'Failed to fetch tag' });
  }
});

// GET recipes by tag ID
router.get('/:id/recipes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT r.*, u.username as author
       FROM recipes r
       JOIN recipe_tags rt ON r.id = rt.recipe_id
       LEFT JOIN users u ON r.created_by = u.id
       WHERE rt.tag_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recipes by tag:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// POST create new tag
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO tags (name)
       VALUES ($1)
       RETURNING *`,
      [name.toLowerCase().trim()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating tag:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Tag already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// PUT update tag (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const result = await query(
      `UPDATE tags 
       SET name = $1
       WHERE id = $2
       RETURNING *`,
      [name.toLowerCase().trim(), id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating tag:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Tag name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// DELETE tag (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM tags WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }
    
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default router;
