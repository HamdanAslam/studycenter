import express from 'express'
import {
	listStudents,
	getStudent,
	addStudent,
	editStudent,
	removeStudent,
	getStudentAttendanceStats,
} from '../controllers/studentController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()

// All endpoints require admin role
router.get('/', authenticateToken, authorizeRoles('admin'), listStudents)
router.get('/:id', authenticateToken, authorizeRoles('admin'), getStudent)
router.get('/:id/attendance', authenticateToken, authorizeRoles('admin'), getStudentAttendanceStats)
router.post('/', authenticateToken, authorizeRoles('admin'), addStudent)
router.put('/:id', authenticateToken, authorizeRoles('admin'), editStudent)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), removeStudent)

export default router
