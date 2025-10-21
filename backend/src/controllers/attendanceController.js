import Attendance from '../models/Attendance.js'
import Student from '../models/Student.js'
import Batch from '../models/Batch.js'

// Helper: Validate ObjectId
const isValidObjectId = id => /^[a-fA-F0-9]{24}$/.test(id)

// GET /api/attendance/batch-date?batchId=...&date=...
export const getAttendanceForBatchDate = async (req, res) => {
	try {
		const { batchId, date } = req.query
		if (!batchId || !date) {
			return res.status(400).json({ message: 'batchId and date are required' })
		}
		if (!isValidObjectId(batchId)) {
			return res.status(400).json({ message: 'Invalid batchId' })
		}
		// Validate date (YYYY-MM-DD)
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res.status(400).json({ message: 'Invalid date format (YYYY-MM-DD expected)' })
		}
		const students = await Student.find({ batch: batchId }).lean()
		const attendance = await Attendance.find({ batch: batchId, date }).lean()
		res.json({ students, attendance })
	} catch (err) {
		console.error('getAttendanceForBatchDate error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}

// GET /api/attendance/monthly?batch_id=...&year=2025&month=10
export const getMonthlyAttendanceForBatch = async (req, res) => {
	try {
		const { batch_id, year, month } = req.query
		if (!batch_id || !isValidObjectId(batch_id)) {
			return res.status(400).json({ message: 'Invalid or missing batch_id' })
		}
		const y = parseInt(year, 10)
		const m = parseInt(month, 10) // 1-12
		if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
			return res.status(400).json({ message: 'Invalid or missing year/month' })
		}

		// build date range (UTC start of day)
		const start = new Date(Date.UTC(y, m - 1, 1))
		const end = new Date(Date.UTC(y, m, 1)) // first day of next month

		// fetch students in batch
		const students = await Student.find({ batch_id }).lean()

		// fetch attendance in date range
		const attendance = await Attendance.find({
			batch_id,
			date: { $gte: start, $lt: end },
		})
			.populate('student_id', 'name roll_number')
			.lean()

		// days in month
		const lastDay = new Date(y, m, 0).getDate()
		const days = Array.from({ length: lastDay }, (_, i) => {
			const d = i + 1
			const mm = String(m).padStart(2, '0')
			const dd = String(d).padStart(2, '0')
			return `${y}-${mm}-${dd}`
		})

		// map students
		const studentMap = new Map()
		students.forEach(s => {
			studentMap.set(String(s._id), {
				id: String(s._id),
				name: s.name,
				roll_number: s.roll_number,
				records: {},
			})
		})

		attendance.forEach(a => {
			const sid = a.student_id ? String(a.student_id._id || a.student_id) : String(a.student_id)
			const dateStr = a.date ? new Date(a.date).toISOString().slice(0, 10) : ''
			const rec = studentMap.get(sid) || {
				id: sid,
				name: (a.student_id && a.student_id.name) || '',
				roll_number: null,
				records: {},
			}
			rec.records[dateStr] = a.status
			studentMap.set(sid, rec)
		})

		const studentArr = Array.from(studentMap.values()).sort((a, b) => (a.roll_number || 0) - (b.roll_number || 0))

		res.json({ year: y, month: m, days, students: studentArr })
	} catch (err) {
		console.error('getMonthlyAttendanceForBatch error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}

// POST /api/attendance/bulk-upsert
export const upsertAttendanceBulk = async (req, res) => {
	try {
		const { records, batch_id, date } = req.body
		if (!Array.isArray(records) || records.length === 0) {
			return res.status(400).json({ message: 'No attendance records provided' })
		}
		if (!batch_id || !isValidObjectId(batch_id)) {
			return res.status(400).json({ message: 'Invalid or missing batch_id' })
		}
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res.status(400).json({ message: 'Invalid or missing date' })
		}
		// Validate and map records
		const mappedRecords = records.map(rec => {
			if (!rec.student_id || !isValidObjectId(rec.student_id)) {
				throw new Error('Invalid or missing student_id in record')
			}
			if (!rec.status || typeof rec.status !== 'string') {
				throw new Error('Invalid or missing status in record')
			}
			return {
				student_id: rec.student_id,
				batch_id,
				date,
				status: rec.status,
			}
		})
		// Use bulkWrite for efficient upsert
		const bulkOps = mappedRecords.map(rec => ({
			updateOne: {
				filter: { student_id: rec.student_id, date: rec.date },
				update: { $set: rec },
				upsert: true,
			},
		}))
		await Attendance.bulkWrite(bulkOps)
		res.json({ message: 'Attendance records upserted successfully' })
	} catch (err) {
		console.error('upsertAttendanceBulk error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}

// GET /api/attendance
export const listAttendance = async (req, res) => {
	try {
		let { batchId, studentId, page = 1, limit = 20 } = req.query
		page = parseInt(page, 10)
		limit = parseInt(limit, 10)
		const query = {}
		if (batchId && isValidObjectId(batchId)) query.batch_id = batchId
		if (studentId && isValidObjectId(studentId)) query.student_id = studentId
		const [attendance, total] = await Promise.all([
			Attendance.find(query)
				.populate('student_id', 'name roll_number')
				.sort({ 'student_id.roll_number': 1, date: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.lean(),
			Attendance.countDocuments(query),
		])
		res.json({ attendance, total, page, limit })
	} catch (err) {
		console.error('listAttendance error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}

// POST /api/attendance
export const addAttendance = async (req, res) => {
	try {
		const { student, batch, date, status } = req.body
		if (!student || !isValidObjectId(student)) {
			return res.status(400).json({ message: 'Invalid or missing student' })
		}
		if (!batch || !isValidObjectId(batch)) {
			return res.status(400).json({ message: 'Invalid or missing batch' })
		}
		if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res.status(400).json({ message: 'Invalid or missing date' })
		}
		if (!status || typeof status !== 'string') {
			return res.status(400).json({ message: 'Invalid or missing status' })
		}
		const record = await Attendance.create({ student, batch, date, status })
		res.status(201).json(record)
	} catch (err) {
		console.error('addAttendance error:', err)
		res.status(500).json({ message: 'Server error' })
	}
}
