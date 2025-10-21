import mongoose from '../utils/db.js'

const batchSchema = new mongoose.Schema({
	name: { type: String, required: true },
	class: { type: Number, required: true },
	schedule: { type: String },
	created_at: { type: Date, default: Date.now },
})

const Batch = mongoose.model('Batch', batchSchema)
export default Batch
