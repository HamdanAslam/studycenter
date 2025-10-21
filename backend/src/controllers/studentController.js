import Student from '../models/Student.js'
import Attendance from '../models/Attendance.js'

// Get students by batch, sorted by roll_number
export async function getStudentsByBatch(req, res) {
	try {
		const batchId = req.params.id
		if (!batchId) return res.status(400).json({ message: 'Batch id required' })
		const students = await Student.find({ batch_id: batchId }).sort({ roll_number: 1 })
		const mapped = Array.isArray(students) ? students.map(s => ({ ...s.toObject(), id: s._id.toString() })) : []
		res.json(mapped)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// List all students
export async function listStudents(_req, res) {
	try {
		const students = await Student.find().sort({ _id: 1 })
		const mapped = Array.isArray(students) ? students.map(s => ({ ...s.toObject(), id: s._id.toString() })) : []
		res.json(mapped)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Get a single student
export async function getStudent(req, res) {
	try {
		const student = await Student.findById(req.params.id)
		if (!student) return res.status(404).json({ message: 'Student not found' })
		const mapped = { ...student.toObject(), id: student._id.toString() }
		res.json(mapped)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Create a student
export async function addStudent(req, res) {
	try {
		const { name, class: classNum, batch_id, email, phone, roll_number } = req.body
		if (!name || !classNum || !roll_number) return res.status(400).json({ message: 'Missing fields' })
		// Check uniqueness of roll_number in class
		const exists = await Student.findOne({ class: classNum, roll_number })
		if (exists) return res.status(400).json({ message: 'Roll number must be unique within the class' })
		const student = new Student({ name, class: classNum, batch_id: batch_id ?? null, email, phone, roll_number })
		await student.save()
		const mapped = { ...student.toObject(), id: student._id.toString() }
		res.status(201).json(mapped)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Update a student
export async function editStudent(req, res) {
	try {
		const { name, class: classNum, batch_id, email, phone, roll_number } = req.body
		// Check uniqueness of roll_number in class (excluding self)
		if (roll_number) {
			const exists = await Student.findOne({ class: classNum, roll_number, _id: { $ne: req.params.id } })
			if (exists) return res.status(400).json({ message: 'Roll number must be unique within the class' })
		}
		const student = await Student.findByIdAndUpdate(
			req.params.id,
			{ name, class: classNum, batch_id, email, phone, roll_number },
			{ new: true }
		)
		if (!student) return res.status(404).json({ message: 'Student not found' })
		// TODO: If roll_number is changed, update related documents here if needed
		const mapped = { ...student.toObject(), id: student._id.toString() }
		res.json(mapped)
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Delete a student
export async function removeStudent(req, res) {
	try {
		await Student.findByIdAndDelete(req.params.id)
		res.status(204).end()
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}

// Get a student's attendance history and percentage
export async function getStudentAttendanceStats(req, res) {
	try {
		const studentId = req.params.id
		const records = await Attendance.find({ student_id: studentId })
		if (!records.length) {
			return res.json({
				total: 0,
				present: 0,
				absent: 0,
				late: 0,
				percentage: 0,
				history: [],
			})
		}
		const total = records.length
		const present = records.filter(r => r.status === 'present').length
		const absent = records.filter(r => r.status === 'absent').length
		const late = records.filter(r => r.status === 'late').length
		const percentage = total > 0 ? Math.round((present / total) * 100) : 0
		res.json({
			total,
			present,
			absent,
			late,
			percentage,
			history: records,
		})
	} catch (err) {
		res.status(500).json({ message: 'Server error' })
	}
}
