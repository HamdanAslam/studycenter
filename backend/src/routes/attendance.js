import express from 'express'
import {
	listAttendance,
	addAttendance,
	getAttendanceForBatchDate,
	getMonthlyAttendanceForBatch,
	upsertAttendanceBulk,
} from '../controllers/attendanceController.js'
import { authenticateToken, authorizeRoles } from '../middlewares/auth.js'
const router = express.Router()

router.get('/', authenticateToken, authorizeRoles('teacher', 'admin'), listAttendance)
router.post('/', authenticateToken, authorizeRoles('teacher'), addAttendance)

router.get('/batch-date', authenticateToken, authorizeRoles('teacher', 'admin'), getAttendanceForBatchDate)
router.get('/monthly', authenticateToken, authorizeRoles('teacher', 'admin'), getMonthlyAttendanceForBatch)
router.post('/bulk-upsert', authenticateToken, authorizeRoles('teacher'), upsertAttendanceBulk)

export default router
