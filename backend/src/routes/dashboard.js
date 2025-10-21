import express from 'express'
import { getDashboardStats } from '../controllers/dashboardController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()

router.get('/', authenticateToken, authorizeRoles('admin', 'teacher'), getDashboardStats)

export default router
