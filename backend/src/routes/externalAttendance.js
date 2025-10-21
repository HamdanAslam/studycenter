import express from 'express'
import {
	externalListAttendance,
	externalGetBatchDate,
	externalGetMonthly,
	externalBulkUpsert,
} from '../controllers/externalAttendanceController.js'
import { authenticateExternalToken, authorizeExternalScopes } from '../middlewares/externalAuth.js'

const router = express.Router()

// Read endpoints (GET) and a bulk-upsert for external integration
router.get('/', authenticateExternalToken, authorizeExternalScopes('read'), externalListAttendance)
router.get('/batch-date', authenticateExternalToken, authorizeExternalScopes('read'), externalGetBatchDate)
router.get('/monthly', authenticateExternalToken, authorizeExternalScopes('read'), externalGetMonthly)
router.post('/bulk-upsert', authenticateExternalToken, authorizeExternalScopes('write'), externalBulkUpsert)

export default router
