import express from 'express'
import { issueExternalToken } from '../controllers/externalAuthController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'

const router = express.Router()

// Admins can create external tokens for third-party integrations
router.post('/token', authenticateToken, authorizeRoles('admin'), issueExternalToken)

export default router
