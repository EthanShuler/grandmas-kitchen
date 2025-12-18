import { Router } from 'express';
import authRoutes from './auth';
import usersRoutes from './users';
import recipesRoutes from './recipes';
import ingredientsRoutes from './ingredients';
import tagsRoutes from './tags';
import favoritesRoutes from './favorites';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/recipes', recipesRoutes);
router.use('/ingredients', ingredientsRoutes);
router.use('/tags', tagsRoutes);
router.use('/favorites', favoritesRoutes);

export default router;
