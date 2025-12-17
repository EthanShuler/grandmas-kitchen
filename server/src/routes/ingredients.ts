import { Router, Request, Response } from 'express';
import { query } from '../db';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// GET all ingredients
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(
      'SELECT * FROM ingredients ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// GET ingredient by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM ingredients WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingredient not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

// POST create new ingredient
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const result = await query(
      `INSERT INTO ingredients (name)
       VALUES ($1)
       RETURNING *`,
      [name.toLowerCase().trim()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating ingredient:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ingredient already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PUT update ingredient (admin only)
router.put('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    
    const result = await query(
      `UPDATE ingredients 
       SET name = $1
       WHERE id = $2
       RETURNING *`,
      [name.toLowerCase().trim(), id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingredient not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ingredient name already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// DELETE ingredient (admin only)
router.delete('/:id', adminOnly, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM ingredients WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Ingredient not found' });
      return;
    }
    
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

export default router;
