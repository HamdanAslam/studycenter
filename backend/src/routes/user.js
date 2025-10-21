import express from 'express'
import { getAllUsers, changePassword, getMe, updateMe } from '../controllers/userController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()
// Get/update current user's profile
router.get('/me', authenticateToken, getMe)
router.put('/me', authenticateToken, updateMe)

// Change password (self)
router.post('/change-password', authenticateToken, changePassword)

export default router
