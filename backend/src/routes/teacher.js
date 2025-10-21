import express from 'express'
import { listTeachers, getTeacher, addTeacher, editTeacher, removeTeacher } from '../controllers/teacherController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()

// All endpoints require admin role
router.get('/', authenticateToken, authorizeRoles('admin'), listTeachers)
router.get('/:id', authenticateToken, authorizeRoles('admin'), getTeacher)
router.post('/', authenticateToken, authorizeRoles('admin'), addTeacher)
router.put('/:id', authenticateToken, authorizeRoles('admin'), editTeacher)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeTeacher)

export default router
