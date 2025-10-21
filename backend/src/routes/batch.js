import express from 'express'
import { listBatches, getBatch, addBatch, editBatch, removeBatch } from '../controllers/batchController.js'
import { getStudentsByBatch } from '../controllers/studentController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()

// Allow both admin and teacher to view batches, but only admin can modify
router.get('/', authenticateToken, authorizeRoles('admin', 'teacher'), listBatches)
// Get students for a batch
router.get('/:id/students', authenticateToken, authorizeRoles('admin', 'teacher'), getStudentsByBatch)
router.get('/:id', authenticateToken, authorizeRoles('admin', 'teacher'), getBatch)
router.post('/', authenticateToken, authorizeRoles('admin'), addBatch)
router.put('/:id', authenticateToken, authorizeRoles('admin'), editBatch)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeBatch)

export default router
