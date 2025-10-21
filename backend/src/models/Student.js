import mongoose from '../utils/db.js'

const studentSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String },
	phone: { type: String },
	class: { type: Number, required: true },
	batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
	roll_number: { type: Number, required: true },
	created_at: { type: Date, default: Date.now },
})

// Ensure roll_number is unique within a class
studentSchema.index({ class: 1, roll_number: 1 }, { unique: true })

const Student = mongoose.model('Student', studentSchema)
export default Student
