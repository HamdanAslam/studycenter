import mongoose from '../utils/db.js'

const attendanceSchema = new mongoose.Schema({
	student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
	batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
	date: { type: Date, required: true },
	status: { type: String, enum: ['present', 'absent', 'late'], required: true },
	created_at: { type: Date, default: Date.now },
})

const Attendance = mongoose.model('Attendance', attendanceSchema)
export default Attendance
