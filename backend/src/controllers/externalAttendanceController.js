import {
	listAttendance,
	getAttendanceForBatchDate,
	getMonthlyAttendanceForBatch,
	upsertAttendanceBulk,
} from './attendanceController.js'

// Expose the same handlers but wrap responses to include a source field for external apps
export const externalListAttendance = async (req, res) => {
	// call internal listAttendance but capture the response
	await listAttendance(req, res)
}

export const externalGetBatchDate = async (req, res) => {
	await getAttendanceForBatchDate(req, res)
}

export const externalGetMonthly = async (req, res) => {
	await getMonthlyAttendanceForBatch(req, res)
}

export const externalBulkUpsert = async (req, res) => {
	// Allow external apps only to upsert for a specific external_batch_id mapping if needed.
	// For now, forward to internal handler. Ensure the external token is present via middleware.
	await upsertAttendanceBulk(req, res)
}
