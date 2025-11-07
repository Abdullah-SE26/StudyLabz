import express from 'express';
import { getAllUsers, updateUserRole, blockUser, logoutUser } from '../controllers/userController.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in this file are protected and require admin privileges
router.use(authMiddleware);
router.use(isAdmin);

router.get('/', getAllUsers);
router.put('/:userId/role', updateUserRole);
router.put('/:userId/block', blockUser);
router.post('/:userId/logout', logoutUser);

export default router;
