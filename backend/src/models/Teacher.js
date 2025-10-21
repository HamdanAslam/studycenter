import mongoose from '../utils/db.js'

const teacherSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, unique: true, sparse: true },
	phone: { type: String },
	subjects: [String],
	created_at: { type: Date, default: Date.now },
})

const Teacher = mongoose.model('Teacher', teacherSchema)
export default Teacher
